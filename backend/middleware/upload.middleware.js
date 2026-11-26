const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];

// Cloudinary storage for images (News, Events, etc.)
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'tmssa/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  },
});

// Cloudinary storage for gallery (images + videos)
const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: isVideo ? 'tmssa/gallery/videos' : 'tmssa/gallery/images',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo
        ? ['mp4', 'webm', 'mov']
        : ['jpg', 'jpeg', 'png', 'gif', 'webp'],
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

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max for images
});

const uploadMedia = multer({
  storage: mediaStorage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 50 * 1024 * 1024, files: 10 }, // 50MB max per file, up to 10 files
});

const uploadSingle = uploadImage.single('image');
const uploadMultiple = uploadImage.array('images', 10);
const uploadGallerySingle = uploadMedia.single('media');
const uploadGalleryMultiple = uploadMedia.array('files', 10);

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadGallerySingle,
  uploadGalleryMultiple,
};
