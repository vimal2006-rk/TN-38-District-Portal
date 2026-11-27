const prisma = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');

const getDistrictAdminsByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const cacheKey = `districtAdmins:district:${districtId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.status(200).json(cached);
    }

    const admins = await prisma.districtAdministrator.findMany({
      where: { districtId: parseInt(districtId, 10), isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const payload = { success: true, data: admins };
    setCache(cacheKey, payload, 30000);
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getAllDistrictAdmins = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const cacheKey = `districtAdmins:all:${districtId || 'all'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
      return res.status(200).json(cached);
    }

    const where = { isActive: true };
    if (districtId) where.districtId = parseInt(districtId, 10);

    const admins = await prisma.districtAdministrator.findMany({
      where,
      include: { district: { select: { nameEn: true, nameTa: true } } },
      orderBy: [{ district: { nameEn: 'asc' } }, { sortOrder: 'asc' }],
    });
    const payload = { success: true, data: admins };
    setCache(cacheKey, payload, 30000);
    res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getDistrictAdminById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await prisma.districtAdministrator.findUnique({
      where: { id: parseInt(id, 10) },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'District administrator not found' });
    }
    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const createDistrictAdmin = async (req, res, next) => {
  try {
    const { districtId, nameEn, nameTa, designationEn, designationTa, phone, photoUrl, sortOrder } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl || null;

    const admin = await prisma.districtAdministrator.create({
      data: {
        districtId: parseInt(districtId, 10), nameEn, nameTa, designationEn, designationTa,
        phone, photoUrl: imageUrl, sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
    });
    invalidateCache('districtAdmins:');
    invalidateCache('districts:');

    return res.status(201).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const updateDistrictAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, designationEn, designationTa, phone, photoUrl, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl;

    const admin = await prisma.districtAdministrator.update({
      where: { id: parseInt(id, 10) },
      data: {
        nameEn, nameTa, designationEn, designationTa, phone,
        ...(imageUrl !== undefined && { photoUrl: imageUrl }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder, 10) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
    });
    invalidateCache('districtAdmins:');
    invalidateCache('districts:');

    return res.status(200).json({ success: true, data: admin });
  } catch (err) {
    next(err);
  }
};

const deleteDistrictAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.districtAdministrator.update({ where: { id: parseInt(id, 10) }, data: { isActive: false } });
    invalidateCache('districtAdmins:');
    invalidateCache('districts:');
    return res.status(200).json({ success: true, message: 'District administrator deactivated' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDistrictAdminsByDistrict, getAllDistrictAdmins, getDistrictAdminById,
  createDistrictAdmin, updateDistrictAdmin, deleteDistrictAdmin,
};
