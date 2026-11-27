const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const prisma = require('../config/database');
const { cacheMediaItem } = require('../controllers/media.controller');

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
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

// Persistent memoryStorage -> saved to Supabase PostgreSQL when Cloudinary is not configured
// (Avoids Render's ephemeral disk wiping images on restart/sleep/redeploy)
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

const useCloud = isCloudinaryConfigured();

const uploadImage = multer({
  storage: useCloud ? cloudinaryImageStorage : memoryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMedia = multer({
  storage: useCloud ? cloudinaryMediaStorage : memoryStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: useCloud ? 50 * 1024 * 1024 : MAX_DB_MEDIA_BYTES, files: 10 },
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
  storage: useCloud ? cloudinaryImageStorage : memoryStorage,
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

const persistMemoryFileToDb = async (file) => {
  if (!file || !file.buffer || file.savedMediaId) return;
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
 * Wraps multer middleware so non-Cloudinary uploads persist directly to PostgreSQL
 * instead of Render's ephemeral disk, keeping downstream controller calls unchanged.
 */
const withPersistentFallback = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, async (err) => {
    if (err) return next(err);
    if (useCloud) return next();
    try {
      const files = collectRequestFiles(req);
      if (files.length > 0) {
        await Promise.all(files.map(persistMemoryFileToDb));
      }
      return next();
    } catch (persistErr) {
      return next(persistErr);
    }
  });
};

const uploadMembershipFiles = withPersistentFallback(
  uploadMembershipImage.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'paymentScreenshot', maxCount: 1 },
  ])
);

/**
 * Helper to resolve uploaded file URL (Cloudinary HTTPS URL or persistent /api/media/:id URL)
 */
const resolveUploadedFileUrl = (req, file) => {
  if (!file) return null;
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

module.exports = {
  uploadSingle: withPersistentFallback(uploadImage.single('image')),
  uploadMultiple: withPersistentFallback(uploadImage.array('images', 10)),
  uploadGallerySingle: withPersistentFallback(uploadMedia.single('media')),
  uploadGalleryMultiple: withPersistentFallback(uploadMedia.array('files', 10)),
  uploadMembershipFiles,
  resolveUploadedFileUrl,
  isCloudinaryConfigured,
};
