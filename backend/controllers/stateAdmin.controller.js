const prisma = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');

const getAllStateAdmins = async (req, res, next) => {
  try {
    const cached = getCache('stateAdmins:all');
    if (cached) {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.status(200).json(cached);
    }

    const admins = await prisma.stateAdministrator.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const payload = { success: true, data: admins };
    setCache('stateAdmins:all', payload, 30000);
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getStateAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await prisma.stateAdministrator.findUnique({ where: { id: parseInt(id, 10) } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'State administrator not found' });
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const createStateAdmin = async (req, res, next) => {
  try {
    const { nameEn, nameTa, designationEn, designationTa, phone, photoUrl, sortOrder } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl || null;

    const admin = await prisma.stateAdministrator.create({
      data: { nameEn, nameTa, designationEn, designationTa, phone, photoUrl: imageUrl, sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0 },
    });
    invalidateCache('stateAdmins:');

    return res.status(201).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const updateStateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, designationEn, designationTa, phone, photoUrl, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl;

    const admin = await prisma.stateAdministrator.update({
      where: { id: parseInt(id, 10) },
      data: {
        nameEn, nameTa, designationEn, designationTa, phone,
        ...(imageUrl !== undefined && { photoUrl: imageUrl }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder, 10) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
    });
    invalidateCache('stateAdmins:');

    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const deleteStateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.stateAdministrator.update({ where: { id: parseInt(id, 10) }, data: { isActive: false } });
    invalidateCache('stateAdmins:');
    return res.status(200).json({ success: true, message: 'State administrator deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStateAdmins, getStateAdminById, createStateAdmin, updateStateAdmin, deleteStateAdmin };
