const express = require('express');
const router = express.Router();
const { login, getProfile, changePassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { loginSchema } = require('../validators/auth.validator');

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

// PUT /api/auth/change-password
router.put('/change-password', authenticate, changePassword);

module.exports = router;
