const express = require('express');
const router = express.Router();
const {
  getAllGroups, getGroupByDistrict, createGroup, updateGroup,
} = require('../controllers/whatsapp.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// GET /api/whatsapp — authenticated
router.get('/', authenticate, getAllGroups);

// GET /api/whatsapp/district/:districtId — authenticated
router.get('/district/:districtId', authenticate, getGroupByDistrict);

// POST /api/whatsapp — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createGroup);

// PUT /api/whatsapp/:id — admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), updateGroup);

module.exports = router;
