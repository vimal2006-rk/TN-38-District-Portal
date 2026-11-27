const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
  getMembershipConfig,
  registerMembership,
  downloadApplicationPdf,
  downloadReceiptPdf,
} = require('../controllers/membership.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadMembershipFiles } = require('../middleware/upload.middleware');

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many membership submissions. Please try again later.' },
});

// Public membership configuration (fees, QR, terms, next serial preview)
router.get('/config', getMembershipConfig);

// Public membership registration with rate limit + photo, optional signature & payment screenshot
router.post('/register', registerLimiter, uploadMembershipFiles, registerMembership);

// Protected PDF downloads (via signed download token or Admin JWT)
router.get('/:serialNumber/pdf/application', optionalAuthenticate, downloadApplicationPdf);
router.get('/:serialNumber/pdf/receipt', optionalAuthenticate, downloadReceiptPdf);

module.exports = router;
