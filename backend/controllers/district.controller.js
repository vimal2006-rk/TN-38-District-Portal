const prisma = require('../config/database');

const getAllDistricts = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    const where = {};
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const districts = await prisma.district.findMany({
      where,
      include: {
        _count: {
          select: { whatsappGroup: true },
        },
      },
      orderBy: { nameEn: 'asc' },
    });

    return res.status(200).json({ success: true, data: districts });
  } catch (err) {
    next(err);
  }
};

const getDistrictById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isNumeric = !isNaN(id);

    const district = await prisma.district.findFirst({
      where: isNumeric ? { id: parseInt(id) } : { slug: id },
      include: {
        districtAdministrators: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        offcBearers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        whatsappGroup: true,
        _count: {
          select: { members: true },
        },
      },
    });

    if (!district) {
      return res.status(404).json({ success: false, message: 'District not found' });
    }

    return res.status(200).json({ success: true, data: district });
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
      where: { id: parseInt(id) },
      data: { nameEn, nameTa, slug, officeAddress, contactNumber, description_en, description_ta, isActive },
    });

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
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return res.status(200).json({ success: true, message: 'District deactivated', data: district });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllDistricts, getDistrictById, createDistrict, updateDistrict, deleteDistrict };
