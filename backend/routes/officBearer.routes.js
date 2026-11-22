const express = require('express');
const router = express.Router();
const {
  getOfficBearersByDistrict, getAllOfficBearers, getOfficBearerById,
  createOfficBearer, updateOfficBearer, deleteOfficBearer,
} = require('../controllers/officBearer.controller');
const { authenticate, authorizeRoles, checkDistrictOwnership } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/offic-bearers/district/:districtId — public
router.get('/district/:districtId', getOfficBearersByDistrict);

// GET /api/offic-bearers — admin
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), getAllOfficBearers);

// GET /api/offic-bearers/:id
router.get('/:id', getOfficBearerById);

// POST /api/offic-bearers — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), uploadSingle, createOfficBearer);

// PUT /api/offic-bearers/:id — admin + districtOwnership
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), checkDistrictOwnership, uploadSingle, updateOfficBearer);

// DELETE /api/offic-bearers/:id — Super Admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteOfficBearer);

module.exports = router;
