const express = require('express');
const router = express.Router();
const {
  getAllDistricts, getDistrictById, createDistrict, updateDistrict, deleteDistrict,
} = require('../controllers/district.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// GET /api/districts
router.get('/', getAllDistricts);

// GET /api/districts/:id
router.get('/:id', getDistrictById);

// POST /api/districts  — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createDistrict);

// PUT /api/districts/:id — Super Admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), updateDistrict);

// DELETE /api/districts/:id — Super Admin (soft delete)
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteDistrict);

module.exports = router;
