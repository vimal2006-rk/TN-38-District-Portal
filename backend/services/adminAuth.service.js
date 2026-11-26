const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../config/database');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  parseDurationMs,
} = require('../utils/jwt');

const buildTokenPayload = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role.name,
  districtId: user.districtId,
});

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role.name,
  districtId: user.districtId,
});

const issueTokenPair = async (user, req) => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({
    id: user.id,
    jti: crypto.randomUUID(),
  });

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d')
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt,
      ipAddress: req?.headers['x-forwarded-for']?.split(',')[0]?.trim() || req?.ip || null,
      userAgent: req?.headers['user-agent']?.slice(0, 255) || null,
    },
  });

  return { accessToken, refreshToken };
};

const authenticateAdmin = async (email, password, req) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).trim().toLowerCase() },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcryptjs.compare(password, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  if (!['SUPER_ADMIN', 'DISTRICT_ADMIN'].includes(user.role?.name)) {
    const err = new Error('Forbidden. Admin privileges required.');
    err.statusCode = 403;
    throw err;
  }

  const { accessToken, refreshToken } = await issueTokenPair(user, req);
  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

const refreshAdminSession = async (rawRefreshToken, req) => {
  if (!rawRefreshToken) {
    const err = new Error('Refresh token missing.');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 401;
    throw err;
  }

  const tokenHash = hashToken(rawRefreshToken);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: { include: { role: true } } },
  });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    // Reuse detection: if token was already revoked, revoke all active tokens for that user
    if (stored?.revokedAt && decoded?.id) {
      await prisma.refreshToken.updateMany({
        where: { userId: decoded.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    const err = new Error('Refresh token has been revoked or expired.');
    err.statusCode = 401;
    throw err;
  }

  if (!stored.user || !stored.user.isActive) {
    const err = new Error('Account is inactive.');
    err.statusCode = 401;
    throw err;
  }

  // Rotate refresh token
  const { accessToken, refreshToken: newRefreshToken } = await issueTokenPair(stored.user, req);
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: {
      revokedAt: new Date(),
      replacedByTokenHash: hashToken(newRefreshToken),
    },
  });

  return { accessToken, refreshToken: newRefreshToken, user: sanitizeUser(stored.user) };
};

const revokeRefreshToken = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = hashToken(rawRefreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

const getAdminProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, district: { select: { id: true, nameEn: true, nameTa: true } } },
  });
  if (!user || !user.isActive) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return {
    ...sanitizeUser(user),
    district: user.district,
    createdAt: user.createdAt,
  };
};

const changeAdminPassword = async (userId, oldPassword, newPassword) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }

  const isMatch = await bcryptjs.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Current password is incorrect.');
    err.statusCode = 400;
    throw err;
  }

  const salt = await bcryptjs.genSalt(12);
  const passwordHash = await bcryptjs.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  // Revoke all existing refresh tokens on password change for security
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

module.exports = {
  authenticateAdmin,
  refreshAdminSession,
  revokeRefreshToken,
  getAdminProfile,
  changeAdminPassword,
};
