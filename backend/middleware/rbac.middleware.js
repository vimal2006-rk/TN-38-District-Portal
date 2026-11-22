/**
 * Role-Based Access Control (RBAC) Middleware
 */

/**
 * requireRole - Returns middleware that allows access only to users with one of the specified roles.
 * @param  {...string} roles - Allowed role names
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.',
      });
    }
    next();
  };
};

/**
 * requireSuperAdmin - Only SUPER_ADMIN role allowed.
 */
const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * requireAdmin - SUPER_ADMIN or DISTRICT_ADMIN allowed.
 */
const requireAdmin = requireRole('SUPER_ADMIN', 'DISTRICT_ADMIN');

/**
 * requireDistrictOwnership - Ensures a DISTRICT_ADMIN can only access their own district.
 * SUPER_ADMIN bypasses this check.
 */
const requireDistrictOwnership = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' });
  }

  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const paramDistrictId = req.params.districtId;
  const userDistrictId = String(req.user.districtId);

  if (!paramDistrictId || userDistrictId !== String(paramDistrictId)) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. You can only manage your own district.',
    });
  }

  next();
};

module.exports = {
  requireRole,
  requireSuperAdmin,
  requireAdmin,
  requireDistrictOwnership,
};
