const { getDashboardStats } = require('../services/dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
