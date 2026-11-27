require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Route imports
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const membershipRoutes = require('./routes/membership.routes');
const districtRoutes = require('./routes/district.routes');
const memberRoutes = require('./routes/member.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');
const newsRoutes = require('./routes/news.routes');
const eventsRoutes = require('./routes/events.routes');
const galleryRoutes = require('./routes/gallery.routes');
const stateAdminRoutes = require('./routes/stateAdmin.routes');
const districtAdminRoutes = require('./routes/districtAdmin.routes');
const officBearerRoutes = require('./routes/officBearer.routes');
const contactRoutes = require('./routes/contact.routes');
const translationRoutes = require('./routes/translation.routes');

const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();
app.set('trust proxy', 1);

// Performance & Compression middleware
app.use(compression({ threshold: 1024, level: 6 }));

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true, maxAge: 86400 }));

// Serve uploaded media with browser cache when local storage fallback is used
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', etag: true }));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fast lightweight health check (before rate limiters)
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, status: 'ok', uptime: Math.round(process.uptime()) });
});

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Stricter auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);
app.use('/api/admin/auth/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/districts', districtRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/state-admins', stateAdminRoutes);
app.use('/api/district-admins', districtAdminRoutes);
app.use('/api/office-bearers', officBearerRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/translations', translationRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
