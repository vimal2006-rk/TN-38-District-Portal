const express = require('express');
const router = express.Router();
const {
  getMembershipConfig,
  registerMembership,
  downloadApplicationPdf,
  downloadReceiptPdf,
} = require('../controllers/membership.controller');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadMembershipFiles } = require('../middleware/upload.middleware');

// Public membership configuration (fees, QR, terms, next serial preview)
router.get('/config', getMembershipConfig);

// Public membership registration with photo, optional signature & payment screenshot
router.post('/register', uploadMembershipFiles, registerMembership);

// Protected PDF downloads (via signed download token or Admin JWT)
router.get('/:serialNumber/pdf/application', optionalAuthenticate, downloadApplicationPdf);
router.get('/:serialNumber/pdf/receipt', optionalAuthenticate, downloadReceiptPdf);

module.exports = router;
