const express = require('express');
const router = express.Router();
const {
  getAllStateAdmins, getStateAdminById, createStateAdmin, updateStateAdmin, deleteStateAdmin,
} = require('../controllers/stateAdmin.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/state-admins — public
router.get('/', getAllStateAdmins);

// GET /api/state-admins/:id — public
router.get('/:id', getStateAdminById);

// POST /api/state-admins — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), uploadSingle, createStateAdmin);

// PUT /api/state-admins/:id — Super Admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), uploadSingle, updateStateAdmin);

// DELETE /api/state-admins/:id — Super Admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteStateAdmin);

module.exports = router;
