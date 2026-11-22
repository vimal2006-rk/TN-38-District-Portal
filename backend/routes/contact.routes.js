const express = require('express');
const router = express.Router();
const { getAllContacts, getContactById, createContact, updateContact, deleteContact } = require('../controllers/contact.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');

// GET /api/contacts — public
router.get('/', getAllContacts);

// GET /api/contacts/:id — public
router.get('/:id', getContactById);

// POST /api/contacts — Super Admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN'), createContact);

// PUT /api/contacts/:id — Super Admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), updateContact);

// DELETE /api/contacts/:id — Super Admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteContact);

module.exports = router;
