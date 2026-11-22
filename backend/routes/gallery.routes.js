const express = require('express');
const router = express.Router();
const { getAllGallery, uploadMedia, deleteMedia } = require('../controllers/gallery.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/gallery — public
router.get('/', getAllGallery);

// POST /api/gallery — admin + upload
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadSingle, uploadMedia);

// DELETE /api/gallery/:id — admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), deleteMedia);

module.exports = router;
