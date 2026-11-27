const prisma = require('../config/database');
const { logActivity } = require('../services/activityLog.service');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');
const { evictCachedMedia } = require('./media.controller');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

const getOfficBearersByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const cacheKey = `admin:bearers:district:${districtId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
      return res.status(200).json(cached);
    }

    const bearers = await prisma.officBearer.findMany({
      where: { districtId: parseInt(districtId, 10), isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    const payload = { success: true, data: bearers };
    setCache(cacheKey, payload, 30000);
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getAllOfficBearers = async (req, res, next) => {
  try {
    const { districtId, search } = req.query;
    const isAdmin = Boolean(req.user && ['SUPER_ADMIN', 'DISTRICT_ADMIN'].includes(req.user.role));
    const where = { isActive: true };
    if (districtId && districtId !== 'all') where.districtId = parseInt(districtId, 10);

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { nameEn: { contains: q, mode: 'insensitive' } },
        { nameTa: { contains: q, mode: 'insensitive' } },
        { roleEn: { contains: q, mode: 'insensitive' } },
        { roleTa: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const cacheKey = !isAdmin && !search ? `admin:bearers:${districtId || 'all'}` : null;
    if (cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cached);
      }
    }

    const bearers = await prisma.officBearer.findMany({
      where,
      include: { district: { select: { id: true, nameEn: true, nameTa: true, slug: true } } },
      orderBy: [{ district: { nameEn: 'asc' } }, { sortOrder: 'asc' }, { id: 'desc' }],
    });
    const payload = { success: true, data: bearers };
    if (cacheKey) {
      setCache(cacheKey, payload, 30000);
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    } else if (isAdmin) {
      res.set('Cache-Control', 'no-store');
    }
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getOfficBearerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bearer = await prisma.officBearer.findUnique({
      where: { id: parseInt(id, 10) },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    if (!bearer) {
      return res.status(404).json({ success: false, message: 'Administration member not found' });
    }
    return res.status(200).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const createOfficBearer = async (req, res, next) => {
  try {
    const { districtId, nameEn, nameTa, roleEn, roleTa, phone, photoUrl, sortOrder } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl || null;

    if (!districtId || (!nameEn?.trim() && !nameTa?.trim())) {
      return res.status(400).json({ success: false, message: 'District and member name are required.' });
    }

    const bearer = await prisma.officBearer.create({
      data: {
        districtId: parseInt(districtId, 10),
        nameEn: (nameEn || nameTa || '').trim(),
        nameTa: (nameTa || nameEn || '').trim(),
        roleEn: (roleEn || roleTa || 'Office Bearer').trim(),
        roleTa: (roleTa || roleEn || 'நிர்வாகி').trim(),
        phone: phone?.trim() || null,
        photoUrl: imageUrl,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    invalidateCache('admin:bearers:');

    await logActivity({
      userId: req.user?.id,
      action: 'CREATE_ADMINISTRATION',
      entityType: 'ADMINISTRATION',
      entityId: bearer.id,
      details: `Added administration member: ${bearer.nameEn} (${bearer.roleEn})`,
      req,
    });

    return res.status(201).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const updateOfficBearer = async (req, res, next) => {
  try {
    const bearerId = parseInt(req.params.id, 10);
    const { districtId, nameEn, nameTa, roleEn, roleTa, phone, photoUrl, sortOrder, isActive } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : photoUrl;

    const bearer = await prisma.officBearer.update({
      where: { id: bearerId },
      data: {
        ...(districtId && { districtId: parseInt(districtId, 10) }),
        ...(nameEn !== undefined && { nameEn: nameEn.trim() }),
        ...(nameTa !== undefined && { nameTa: nameTa.trim() }),
        ...(roleEn !== undefined && { roleEn: roleEn.trim() }),
        ...(roleTa !== undefined && { roleTa: roleTa.trim() }),
        ...(phone !== undefined && { phone: phone.trim() || null }),
        ...(imageUrl !== undefined && { photoUrl: imageUrl || null }),
        ...(sortOrder !== undefined && { sortOrder: parseInt(sortOrder, 10) }),
        ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
      },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    invalidateCache('admin:bearers:');

    await logActivity({
      userId: req.user?.id,
      action: 'UPDATE_ADMINISTRATION',
      entityType: 'ADMINISTRATION',
      entityId: bearer.id,
      details: `Updated administration member: ${bearer.nameEn}`,
      req,
    });

    return res.status(200).json({ success: true, data: bearer });
  } catch (err) {
    next(err);
  }
};

const deleteOfficBearer = async (req, res, next) => {
  try {
    const bearerId = parseInt(req.params.id, 10);
    const existing = await prisma.officBearer.findUnique({ where: { id: bearerId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Administration member not found' });
    }

    if (existing.photoUrl && existing.photoUrl.includes('/media/')) {
      const mediaId = existing.photoUrl.split('/media/').pop().split('?')[0];
      if (/^[0-9a-f-]{16,64}$/i.test(mediaId)) {
        evictCachedMedia(mediaId);
        await prisma.uploadedMedia.deleteMany({ where: { id: mediaId } }).catch(() => {});
      }
    }

    await prisma.officBearer.delete({ where: { id: bearerId } });
    invalidateCache('admin:bearers:');

    await logActivity({
      userId: req.user?.id,
      action: 'DELETE_ADMINISTRATION',
      entityType: 'ADMINISTRATION',
      entityId: bearerId,
      details: `Deleted administration member: ${existing.nameEn}`,
      req,
    });

    return res.status(200).json({ success: true, message: 'Administration member deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOfficBearersByDistrict,
  getAllOfficBearers,
  getOfficBearerById,
  createOfficBearer,
  updateOfficBearer,
  deleteOfficBearer,
};
