const prisma = require('../config/database');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      districtId: user.districtId,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        districtId: user.districtId,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcryptjs.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect' });
    }

    const salt = await bcryptjs.genSalt(10);
    const passwordHash = await bcryptjs.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile, changePassword };
