const { verifyAccessToken } = require('../utils/jwt');
const { requireRole, requireSuperAdmin, requireAdmin, requireDistrictOwnership } = require('./rbac.middleware');

/**
 * JWT Authentication Middleware
 * Extracts and verifies Bearer access token from Authorization header.
 * Attaches decoded user payload to req.user.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token.' });
  }
};

const optionalAuthenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch (err) {
    // Pass along without user if token is expired or invalid
  }
  next();
};

const authorizeRoles = (...roles) => requireRole(...roles);

authenticate.authenticate = authenticate;
authenticate.optionalAuthenticate = optionalAuthenticate;
authenticate.authorizeRoles = authorizeRoles;
authenticate.checkDistrictOwnership = requireDistrictOwnership;
authenticate.requireDistrictOwnership = requireDistrictOwnership;
authenticate.requireRole = requireRole;
authenticate.requireSuperAdmin = requireSuperAdmin;
authenticate.requireAdmin = requireAdmin;

module.exports = authenticate;
