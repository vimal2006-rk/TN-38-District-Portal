const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

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

// Ensure local fallback uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

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
  storage: useCloud ? cloudinaryImageStorage : diskStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadMedia = multer({
  storage: useCloud ? cloudinaryMediaStorage : diskStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 },
});

/**
 * Helper to resolve uploaded file URL (Cloudinary HTTPS URL or backend /uploads URL)
 */
const resolveUploadedFileUrl = (req, file) => {
  if (!file) return null;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  const host = req.get('host');
  const proto = req.headers['x-forwarded-proto']?.split(',')[0] || req.protocol || 'https';
  return `${proto}://${host}/uploads/${file.filename}`;
};

module.exports = {
  uploadSingle: uploadImage.single('image'),
  uploadMultiple: uploadImage.array('images', 10),
  uploadGallerySingle: uploadMedia.single('media'),
  uploadGalleryMultiple: uploadMedia.array('files', 10),
  resolveUploadedFileUrl,
  isCloudinaryConfigured,
};
