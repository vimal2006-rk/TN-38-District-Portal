const {
  authenticateAdmin,
  refreshAdminSession,
  revokeRefreshToken,
  getAdminProfile,
  changeAdminPassword,
} = require('../services/adminAuth.service');
const { logActivity } = require('../services/activityLog.service');
const { getRefreshCookieOptions } = require('../utils/jwt');
const { parseCookies } = require('../utils/cookies');

const REFRESH_COOKIE_NAME = 'tmssa_refresh_token';

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authenticateAdmin(email, password, req);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    await logActivity({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `Admin logged in (${user.email})`,
      req,
    });

    return res.status(200).json({
      success: true,
      accessToken,
      token: accessToken, // backward compatibility
      user,
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const rawRefreshToken = cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    const { accessToken, refreshToken, user } = await refreshAdminSession(rawRefreshToken, req);
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, getRefreshCookieOptions());

    return res.status(200).json({
      success: true,
      accessToken,
      token: accessToken,
      user,
    });
  } catch (err) {
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api' });
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const cookies = parseCookies(req);
    const rawRefreshToken = cookies[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

    await revokeRefreshToken(rawRefreshToken);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api' });

    if (req.user?.id) {
      await logActivity({
        userId: req.user.id,
        action: 'LOGOUT',
        entityType: 'AUTH',
        entityId: req.user.id,
        details: `Admin logged out (${req.user.email})`,
        req,
      });
    }

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const profile = await getAdminProfile(req.user.id);
    return res.status(200).json({ success: true, user: profile });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await changeAdminPassword(req.user.id, oldPassword, newPassword);
    res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api' });

    await logActivity({
      userId: req.user.id,
      action: 'CHANGE_PASSWORD',
      entityType: 'SETTINGS',
      entityId: req.user.id,
      details: 'Admin changed account password',
      req,
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please log in again.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, refresh, logout, me, changePassword };
