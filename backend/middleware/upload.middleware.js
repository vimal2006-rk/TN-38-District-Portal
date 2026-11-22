const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    format: async (req, file) => 'auto',
  },
});

// File filter — allow only image mimetypes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'), false);
  }
};

const upload = multer({ storage, fileFilter });

/**
 * uploadSingle — handles a single file from the 'image' field
 */
const uploadSingle = upload.single('image');

/**
 * uploadMultiple — handles up to 10 files from the 'images' field
 */
const uploadMultiple = upload.array('images', 10);

module.exports = { uploadSingle, uploadMultiple };
