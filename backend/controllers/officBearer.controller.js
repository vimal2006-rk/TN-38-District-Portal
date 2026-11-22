const prisma = require('../config/database');

const getOfficBearersByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const bearers = await prisma.officBearer.findMany({
      where: { districtId: parseInt(districtId), isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return res.status(200).json({ success: true, data: bearers });
  } catch (err) {
    next(err);
  }
};

const getAllOfficBearers = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const where = { isActive: true };
    if (districtId) where.districtId = parseInt(districtId);

    const bearers = await prisma.officBearer.findMany({
      where,
      include: { district: { select: { nameEn: true, nameTa: true } } },
      orderBy: [{ district: { nameEn: 'asc' } }, { sortOrder: 'asc' }],
    });
    return res.status(200).json({ success: true, data: bearers });
  } catch (err) {
    next(err);
  }
};

const getOfficBearerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bearer = await prisma.officBearer.findUnique({
      where: { id: parseInt(id) },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });
    if (!bearer) {
      return res.status(404).json({ success: false, message: 'Office bearer not found' });
    }
    return res.status(200).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const createOfficBearer = async (req, res, next) => {
  try {
    const { districtId, nameEn, nameTa, roleEn, roleTa, phone, photoUrl, sortOrder } = req.body;
    const imageUrl = req.file ? req.file.path : photoUrl || null;

    const bearer = await prisma.officBearer.create({
      data: {
        districtId: parseInt(districtId), nameEn, nameTa, roleEn, roleTa,
        phone, photoUrl: imageUrl, sortOrder: sortOrder ? parseInt(sortOrder) : 0,
      },
    });

    return res.status(201).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const updateOfficBearer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, roleEn, roleTa, phone, photoUrl, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? req.file.path : photoUrl;

    const bearer = await prisma.officBearer.update({
      where: { id: parseInt(id) },
      data: {
        nameEn, nameTa, roleEn, roleTa, phone,
        ...(imageUrl !== undefined && { photoUrl: imageUrl }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
    });

    return res.status(200).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const deleteOfficBearer = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.officBearer.update({ where: { id: parseInt(id) }, data: { isActive: false } });
    return res.status(200).json({ success: true, message: 'Office bearer deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOfficBearersByDistrict, getAllOfficBearers, getOfficBearerById,
  createOfficBearer, updateOfficBearer, deleteOfficBearer,
};
