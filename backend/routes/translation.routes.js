const express = require('express');
const router = express.Router();
const { getTranslations, updateTranslation } = require('../controllers/translation.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// GET /api/translations/:lang — public
router.get('/:lang', getTranslations);

// PUT /api/translations/:key — Super Admin
router.put('/:key', authenticate, authorizeRoles('SUPER_ADMIN'), updateTranslation);

module.exports = router;
