const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { isGcsConfigured, uploadBufferToGcs, deleteGcsObjectByUrl } = require('../config/gcs');
const prisma = require('../config/database');
const { cacheMediaItem, evictCachedMedia } = require('../controllers/media.controller');

let sharp = null;
try {
  sharp = require('sharp');
} catch {
  sharp = null;
}

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const CONVERTIBLE_WEBP_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
const MAX_DB_MEDIA_BYTES = 15 * 1024 * 1024; // 15MB safety cap when falling back to PostgreSQL storage

const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME || '';
  const key = process.env.CLOUDINARY_API_KEY || '';
  const secret = process.env.CLOUDINARY_API_SECRET || '';
  return (
    Boolean(name && key && secret) &&
    !name.startsWith('your_') &&
    !key.startsWith('your_') &&
    !secret.startsWith('your_')
  );
};

// Keep local uploads dir creation only if needed by legacy paths
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Persistent memoryStorage -> converted to WebP and stored in GCS or Supabase PostgreSQL
const memoryStorage = multer.memoryStorage();

const cloudinaryImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tmssa/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

const cloudinaryMediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: isVideo ? 'tmssa/gallery/videos' : 'tmssa/gallery/images',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? ['mp4', 'webm', 'mov'] : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    };
  },
});

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Only JPEG, PNG, WebP, or GIF image files are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const mediaFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_MIME.includes(file.mimetype) || ALLOWED_VIDEO_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Only valid image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV) files are allowed.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const useCloudinaryFallback = !isGcsConfigured() && isCloudinaryConfigured();

const uploadImage = multer({
  storage: useCloudinaryFallback ? cloudinaryImageStorage : memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMedia = multer({
  storage: useCloudinaryFallback ? cloudinaryMediaStorage : memoryStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: isGcsConfigured() || isCloudinaryConfigured() ? 50 * 1024 * 1024 : MAX_DB_MEDIA_BYTES, files: 10 },
});

const strictJpgPngFilter = (req, file, cb) => {
  if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Only JPG, JPEG, and PNG images are allowed for membership uploads.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const uploadMembershipImage = multer({
  storage: useCloudinaryFallback ? cloudinaryImageStorage : memoryStorage,
  fileFilter: strictJpgPngFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const collectRequestFiles = (req) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === 'object') {
    for (const arr of Object.values(req.files)) {
      if (Array.isArray(arr)) files.push(...arr);
    }
  }
  return files;
};

const resolveFolderAndMaxDim = (req, file) => {
  const route = `${req.baseUrl || ''}${req.path || ''}`.toLowerCase();
  if (route.includes('administration') || route.includes('office-bearers')) {
    return { folder: 'office-bearers', maxDim: 800, quality: 85 };
  }
  if (route.includes('district-admins')) {
    return { folder: 'district-admins', maxDim: 800, quality: 85 };
  }
  if (route.includes('state-admins')) {
    return { folder: 'state-admins', maxDim: 800, quality: 85 };
  }
  if (route.includes('news')) {
    return { folder: 'news', maxDim: 1400, quality: 85 };
  }
  if (route.includes('events')) {
    return { folder: 'events', maxDim: 1400, quality: 85 };
  }
  if (route.includes('gallery')) {
    const isVideo = file.mimetype?.startsWith('video/');
    return {
      folder: isVideo ? 'gallery/videos' : 'gallery/images',
      maxDim: 1600,
      quality: 85,
    };
  }
  if (route.includes('membership/settings')) {
    return { folder: 'membership/qr', maxDim: 600, quality: 90 };
  }
  if (route.includes('membership')) {
    return { folder: 'membership/applications', maxDim: 1000, quality: 85 };
  }
  return { folder: 'images', maxDim: 1400, quality: 85 };
};

const optimizeImageBufferToWebp = async (file, { maxDim = 1400, quality = 85 } = {}) => {
  if (!sharp || !file?.buffer || !CONVERTIBLE_WEBP_MIME.has(file.mimetype)) {
    return file;
  }

  try {
    const pipeline = sharp(file.buffer, { failOn: 'none' }).rotate();
    const meta = await pipeline.metadata();
    const withinBounds =
      (!meta.width || meta.width <= maxDim) && (!meta.height || meta.height <= maxDim);

    // Avoid re-compressing already properly sized WebP images uploaded by admin UI
    if (file.mimetype === 'image/webp' && withinBounds) {
      return file;
    }

    const webpBuffer = await sharp(file.buffer, { failOn: 'none' })
      .rotate()
      .resize({
        width: maxDim,
        height: maxDim,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    const baseName = (file.originalname || 'image').replace(/\.[^/.]+$/, '') || 'image';
    file.buffer = webpBuffer;
    file.size = webpBuffer.length;
    file.mimetype = 'image/webp';
    file.originalname = `${baseName}.webp`;
  } catch (err) {
    console.warn('Server WebP optimization skipped:', err.message);
  }
  return file;
};

const sanitizeObjectName = (filename, fallbackExt = '') => {
  const parsed = path.parse(filename || 'upload');
  const safeBase = (parsed.name || 'upload')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'upload';
  const ext = parsed.ext || fallbackExt;
  return `${Date.now()}-${crypto.randomUUID()}-${safeBase}${ext}`;
};

const persistMemoryFile = async (req, file, { convertToWebp = true } = {}) => {
  if (!file || !file.buffer || file.savedMediaId || file.gcsUrl) return;

  const { folder, maxDim, quality } = resolveFolderAndMaxDim(req, file);
  if (convertToWebp) {
    await optimizeImageBufferToWebp(file, { maxDim, quality });
  }

  if (isGcsConfigured()) {
    const ext = file.mimetype === 'image/webp' ? '.webp' : '';
    const objectPath = `${folder}/${sanitizeObjectName(file.originalname, ext)}`;
    file.gcsUrl = await uploadBufferToGcs({
      buffer: file.buffer,
      objectPath,
      mimeType: file.mimetype || 'application/octet-stream',
    });
    file.buffer = null;
    return;
  }

  const record = await prisma.uploadedMedia.create({
    data: {
      filename: (file.originalname || 'upload').slice(0, 200),
      mimeType: file.mimetype || 'application/octet-stream',
      size: file.size || file.buffer.length,
      data: file.buffer,
    },
    select: { id: true, mimeType: true, data: true },
  });
  cacheMediaItem(record.id, {
    mimeType: record.mimeType,
    data: Buffer.isBuffer(record.data) ? record.data : Buffer.from(record.data),
  });
  file.savedMediaId = record.id;
  file.buffer = null; // release buffer from RAM immediately
};

/**
 * Wraps multer middleware to automatically optimize images to WebP and store them in
 * Google Cloud Storage (when configured) or persistent PostgreSQL media storage.
 */
const withPersistentUpload = (multerMiddleware, { convertToWebp = true } = {}) => (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err) return next(err);
    if (useCloudinaryFallback) return next();
    try {
      const files = collectRequestFiles(req);
      if (files.length > 0) {
        await Promise.all(files.map((file) => persistMemoryFile(req, file, { convertToWebp })));
      }
      return next();
    } catch (persistErr) {
      return next(persistErr);
    }
  });
};

const uploadMembershipFiles = withPersistentUpload(
  uploadMembershipImage.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 },
  ]),
  { convertToWebp: false } // PDFKit only supports JPEG & PNG for membership PDFs
);

/**
 * Resolves uploaded file URL (GCS CDN URL, Cloudinary URL, or persistent /api/media/:id URL).
 */
const resolveUploadedFileUrl = (req, file) => {
  if (!file) return null;
  if (file.gcsUrl) return file.gcsUrl;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  const host = req.get('host');
  const proto = req.headers['x-forwarded-proto']?.split(',')[0] || req.protocol || 'https';
  if (file.savedMediaId) {
    return `${proto}://${host}/api/media/${file.savedMediaId}`;
  }
  return `${proto}://${host}/uploads/${file.filename}`;
};

/**
 * Best-effort cleanup of deleted/replaced files stored in Google Cloud Storage or PostgreSQL.
 */
const deleteStoredMediaByUrl = async (url) => {
  if (!url || typeof url !== 'string') return;
  await deleteGcsObjectByUrl(url);

  if (url.includes('/media/')) {
    const mediaId = url.split('/media/').pop().split('?')[0];
    if (/^[0-9a-f-]{16,64}$/i.test(mediaId)) {
      evictCachedMedia(mediaId);
      await prisma.uploadedMedia.deleteMany({ where: { id: mediaId } }).catch(() => {});
    }
  }
};

module.exports = {
  uploadSingle: withPersistentUpload(uploadImage.single('image'), { convertToWebp: true }),
  uploadMultiple: withPersistentUpload(uploadImage.array('images', 10), { convertToWebp: true }),
  uploadGallerySingle: withPersistentUpload(uploadMedia.single('media'), { convertToWebp: true }),
  uploadGalleryMultiple: withPersistentUpload(uploadMedia.array('files', 10), { convertToWebp: true }),
  uploadMembershipFiles,
  resolveUploadedFileUrl,
  deleteStoredMediaByUrl,
  isCloudinaryConfigured,
  isGcsConfigured,
};
