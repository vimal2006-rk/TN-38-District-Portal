const express = require('express');
const router = express.Router();
const {
  getAllNews, getNewsById, createNews, updateNews, deleteNews, togglePublish,
} = require('../controllers/news.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/news — public (optional auth for admin to see unpublished)
router.get('/', optionalAuthenticate, getAllNews);

// GET /api/news/:id — public
router.get('/:id', getNewsById);

// POST /api/news — admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadSingle, createNews);

// PUT /api/news/:id — admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadSingle, updateNews);

// PATCH /api/news/:id/publish — admin
router.patch('/:id/publish', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), togglePublish);

// DELETE /api/news/:id — admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), deleteNews);

module.exports = router;
