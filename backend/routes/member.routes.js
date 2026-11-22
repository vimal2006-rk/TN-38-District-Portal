const express = require('express');
const router = express.Router();
const {
  registerMember, getAllMembers, getMemberById, updateMemberStatus, deleteMember,
} = require('../controllers/member.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { registerMemberSchema } = require('../validators/member.validator');

// POST /api/members/register — public
router.post('/register', validate(registerMemberSchema), registerMember);

// GET /api/members — admin
router.get('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), getAllMembers);

// GET /api/members/:id — admin
router.get('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), getMemberById);

// PUT /api/members/:id/status — admin
router.put('/:id/status', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), updateMemberStatus);

// DELETE /api/members/:id — Super Admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN'), deleteMember);

module.exports = router;
