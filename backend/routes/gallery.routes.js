const express = require('express');
const router = express.Router();
const {
  getAllGallery,
  uploadMedia,
  updateMedia,
  togglePublishMedia,
  deleteMedia,
} = require('../controllers/gallery.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadGalleryMultiple } = require('../middleware/upload.middleware');

// GET /api/gallery — public (optional auth for admin)
router.get('/', optionalAuthenticate, getAllGallery);

// POST /api/gallery — admin + multi-upload
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadGalleryMultiple, uploadMedia);

// PUT /api/gallery/:id — admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), updateMedia);

// PATCH /api/gallery/:id/publish — admin
router.patch('/:id/publish', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), togglePublishMedia);

// DELETE /api/gallery/:id — admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), deleteMedia);

module.exports = router;
