const prisma = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

const getAllDistricts = async (req, res, next) => {
  try {
    const { isActive, page, limit } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const usePagination = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit || '38', 10)));

    const cacheKey = `districts:all:${isActive ?? 'any'}:${usePagination ? `${pageNum}:${pageSize}` : 'full'}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.status(200).json(cached);
    }

    const districts = await prisma.district.findMany({
      where,
      select: {
        id: true,
        nameEn: true,
        nameTa: true,
        slug: true,
        isActive: true,
        whatsappGroup: {
          select: { id: true, groupName: true, inviteLink: true, isActive: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { nameEn: 'asc' },
      ...(usePagination ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
    });

    const payload = { success: true, data: districts };
    setCache(cacheKey, payload, 60000);
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getDistrictById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);

    const cacheKey = `districts:one:${id}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=0, must-revalidate');
      return res.status(200).json(cached);
    }

    const district = await prisma.district.findFirst({
      where: isNumeric ? { id: parseInt(id, 10) } : { slug: id },
      include: {
        districtAdministrators: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        officBearers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        whatsappGroup: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }

    const payload = { success: true, data: district };
    setCache(cacheKey, payload, 60000);
    res.set('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const createDistrict = async (req, res, next) => {
  try {
    const { nameEn, nameTa, slug, officeAddress, contactNumber, description_en, description_ta } = req.body;

    const district = await prisma.district.create({
      data: { nameEn, nameTa, slug, officeAddress, contactNumber, description_en, description_ta },
    });
    invalidateCache('districts:');

    return res.status(201).json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

const updateDistrict = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nameEn, nameTa, slug, officeAddress, contactNumber, description_en, description_ta, isActive } = req.body;

    const district = await prisma.district.update({
      where: { id: parseInt(id, 10) },
      data: { nameEn, nameTa, slug, officeAddress, contactNumber, description_en, description_ta, isActive },
    });
    invalidateCache('districts:');

    return res.status(200).json({ success: true, data: district });
  } catch (err) {
    next(err);
  }
};

const deleteDistrict = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete
    const district = await prisma.district.update({
      where: { id: parseInt(id, 10) },
      data: { isActive: false },
    });
    invalidateCache('districts:');

    return res.status(200).json({ success: true, message: 'District deactivated', data: district });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDistricts, getDistrictById, createDistrict, updateDistrict, deleteDistrict };
