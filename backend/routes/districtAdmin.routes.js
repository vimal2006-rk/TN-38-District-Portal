const express = require('express');
const router = express.Router();
const {
  getDistrictAdminsByDistrict, getAllDistrictAdmins, getDistrictAdminById,
  createDistrictAdmin, updateDistrictAdmin, deleteDistrictAdmin,
} = require('../controllers/districtAdmin.controller');
const { authenticate, authorizeRoles, checkDistrictOwnership } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/district-admins/district/:districtId — public
router.get('/district/:districtId', getDistrictAdminsByDistrict);

// GET /api/district-admins — admin
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), getAllDistrictAdmins);

// GET /api/district-admins/:id — admin
router.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), getDistrictAdminById);

// POST /api/district-admins — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), uploadSingle, createDistrictAdmin);

// PUT /api/district-admins/:id — admin + districtOwnership
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), checkDistrictOwnership, uploadSingle, updateDistrictAdmin);

// DELETE /api/district-admins/:id — Super Admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteDistrictAdmin);

module.exports = router;
