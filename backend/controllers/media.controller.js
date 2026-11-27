const prisma = require('../config/database');

// Bounded in-memory binary cache (max ~24MB across items <= 2MB each) for sub-5ms warm reads
const MAX_CACHE_BYTES = 24 * 1024 * 1024;
const MAX_ITEM_BYTES = 2 * 1024 * 1024;
const mediaCache = new Map();
let currentCacheBytes = 0;

const getCachedMedia = (id) => {
  const entry = mediaCache.get(id);
  if (!entry) return null;
  // Refresh LRU order
  mediaCache.delete(id);
  mediaCache.set(id, entry);
  return entry;
};

const cacheMediaItem = (id, item) => {
  if (!id || !item?.data || item.data.length > MAX_ITEM_BYTES) return;
  if (mediaCache.has(id)) {
    const old = mediaCache.get(id);
    currentCacheBytes -= old.data.length;
    mediaCache.delete(id);
  }
  while (currentCacheBytes + item.data.length > MAX_CACHE_BYTES && mediaCache.size > 0) {
    const oldestKey = mediaCache.keys().next().value;
    const oldestVal = mediaCache.get(oldestKey);
    currentCacheBytes -= oldestVal.data.length;
    mediaCache.delete(oldestKey);
  }
  mediaCache.set(id, item);
  currentCacheBytes += item.data.length;
};

const evictCachedMedia = (id) => {
  const entry = mediaCache.get(id);
  if (entry) {
    currentCacheBytes -= entry.data.length;
    mediaCache.delete(id);
  }
};

const serveMediaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !/^[0-9a-f-]{16,64}$/i.test(id)) {
      return res.status(404).json({ success: false, message: 'Media not found' });
    }

    const etag = `"${id}"`;
    if (req.headers['if-none-match'] === etag) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
      res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('ETag', etag);
      return res.status(304).end();
    }

    let media = getCachedMedia(id);
    if (!media) {
      const record = await prisma.uploadedMedia.findUnique({
        where: { id },
        select: { mimeType: true, data: true },
      });
      if (!record) {
        return res.status(404).json({ success: false, message: 'Media not found' });
      }
      media = {
        mimeType: record.mimeType || 'application/octet-stream',
        data: Buffer.isBuffer(record.data) ? record.data : Buffer.from(record.data),
      };
      cacheMediaItem(id, media);
    }

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader('Content-Length', media.data.length);
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    res.setHeader('CDN-Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).send(media.data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  serveMediaById,
  getCachedMedia,
  cacheMediaItem,
  evictCachedMedia,
};
