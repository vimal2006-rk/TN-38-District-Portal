const prisma = require('../config/database');

const logActivity = async ({ userId, action, entityType, entityId = null, details = null, req = null }) => {
  try {
    const ipAddress = req
      ? req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null
      : null;

    await prisma.adminActivityLog.create({
      data: {
        userId: userId || null,
        action,
        entityType,
        entityId: entityId ? Number(entityId) : null,
        details: details ? String(details).slice(0, 500) : null,
        ipAddress,
      },
    });
  } catch (err) {
    // Activity logging should never break the primary request
    console.error('Activity log error:', err.message);
  }
};

module.exports = { logActivity };
