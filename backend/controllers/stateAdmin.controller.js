const prisma = require('../config/database');

const getAllStateAdmins = async (req, res, next) => {
  try {
    const admins = await prisma.stateAdministrator.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
};

const getStateAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await prisma.stateAdministrator.findUnique({ where: { id: parseInt(id) } });
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
    const imageUrl = req.file ? req.file.path : photoUrl || null;

    const admin = await prisma.stateAdministrator.create({
      data: { nameEn, nameTa, designationEn, designationTa, phone, photoUrl: imageUrl, sortOrder: sortOrder ? parseInt(sortOrder) : 0 },
    });

    return res.status(201).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const updateStateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, designationEn, designationTa, phone, photoUrl, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? req.file.path : photoUrl;

    const admin = await prisma.stateAdministrator.update({
      where: { id: parseInt(id) },
      data: {
        nameEn, nameTa, designationEn, designationTa, phone,
        ...(imageUrl !== undefined && { photoUrl: imageUrl }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
    });

    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const deleteStateAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.stateAdministrator.update({ where: { id: parseInt(id) }, data: { isActive: false } });
    return res.status(200).json({ success: true, message: 'State administrator deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllStateAdmins, getStateAdminById, createStateAdmin, updateStateAdmin, deleteStateAdmin };
