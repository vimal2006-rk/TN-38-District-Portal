const express = require('express');
const router = express.Router();
const {
  getAllEvents, getEventById, getEventsByDistrict, createEvent, updateEvent, deleteEvent,
} = require('../controllers/events.controller');
const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middleware/auth.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

// GET /api/events — public
router.get('/', optionalAuthenticate, getAllEvents);

// GET /api/events/district/:districtId — public
router.get('/district/:districtId', getEventsByDistrict);

// GET /api/events/:id — public
router.get('/:id', getEventById);

// POST /api/events — admin
router.post('/', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadSingle, createEvent);

// PUT /api/events/:id — admin
router.put('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), uploadSingle, updateEvent);

// DELETE /api/events/:id — admin
router.delete('/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), deleteEvent);

module.exports = router;
