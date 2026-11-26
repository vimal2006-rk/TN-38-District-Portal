const express = require('express');
const router = express.Router();

const { login, refresh, logout, me, changePassword } = require('../controllers/adminAuth.controller');
const { getDashboard } = require('../controllers/adminDashboard.controller');
const {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  togglePublish: togglePublishNews,
} = require('../controllers/news.controller');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  togglePublishEvent,
  deleteEvent,
} = require('../controllers/events.controller');
const {
  getAllGallery,
  uploadMedia,
  updateMedia,
  togglePublishMedia,
  deleteMedia,
} = require('../controllers/gallery.controller');
const {
  getAllOfficBearers,
  createOfficBearer,
  updateOfficBearer,
  deleteOfficBearer,
} = require('../controllers/officBearer.controller');

const { authenticate, authorizeRoles, optionalAuthenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { uploadSingle, uploadGalleryMultiple } = require('../middleware/upload.middleware');
const { adminLoginSchema, changePasswordSchema } = require('../validators/adminAuth.validator');

// ── Admin Auth (public login/refresh, protected logout/me/password) ───────────
router.post('/auth/login', validate(adminLoginSchema), login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', optionalAuthenticate, logout);
router.get('/auth/me', authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'), me);
router.post(
  '/auth/change-password',
  authenticate,
  authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'),
  validate(changePasswordSchema),
  changePassword
);

// All routes below require authenticated Admin (HTTP 401 if unauthenticated, HTTP 403 if wrong role)
router.use(authenticate, authorizeRoles('SUPER_ADMIN', 'DISTRICT_ADMIN'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', getDashboard);

// ── News Management ───────────────────────────────────────────────────────────
router.get('/news', getAllNews);
router.get('/news/:id', getNewsById);
router.post('/news', uploadSingle, createNews);
router.put('/news/:id', uploadSingle, updateNews);
router.patch('/news/:id/publish', togglePublishNews);
router.delete('/news/:id', deleteNews);

// ── Events Management ─────────────────────────────────────────────────────────
router.get('/events', getAllEvents);
router.get('/events/:id', getEventById);
router.post('/events', uploadSingle, createEvent);
router.put('/events/:id', uploadSingle, updateEvent);
router.patch('/events/:id/publish', togglePublishEvent);
router.delete('/events/:id', deleteEvent);

// ── Gallery Management (multiple images & videos) ─────────────────────────────
router.get('/gallery', getAllGallery);
router.post('/gallery', uploadGalleryMultiple, uploadMedia);
router.put('/gallery/:id', updateMedia);
router.patch('/gallery/:id/publish', togglePublishMedia);
router.delete('/gallery/:id', deleteMedia);

// ── Administration / Office Bearers Management ────────────────────────────────
router.get('/administration', getAllOfficBearers);
router.post('/administration', uploadSingle, createOfficBearer);
router.put('/administration/:id', uploadSingle, updateOfficBearer);
router.delete('/administration/:id', deleteOfficBearer);

module.exports = router;
