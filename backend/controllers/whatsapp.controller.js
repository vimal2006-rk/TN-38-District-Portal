const prisma = require('../config/database');

const getAllGroups = async (req, res, next) => {
  try {
    const groups = await prisma.whatsappGroup.findMany({
      where: { isActive: true },
      include: { district: { select: { id: true, nameEn: true, nameTa: true, slug: true } } },
      orderBy: { district: { nameEn: 'asc' } },
    });
    return res.status(200).json({ success: true, data: groups });
  } catch (err) {
    next(err);
  }
};

const getGroupByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const group = await prisma.whatsappGroup.findFirst({
      where: { districtId: parseInt(districtId), isActive: true },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    if (!group) {
      return res.status(404).json({ success: false, message: 'WhatsApp group not found for this district' });
    }

    return res.status(200).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

const createGroup = async (req, res, next) => {
  try {
    const { districtId, groupName, inviteLink } = req.body;

    const group = await prisma.whatsappGroup.create({
      data: { districtId: parseInt(districtId), groupName, inviteLink },
    });

    return res.status(201).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

const updateGroup = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { groupName, inviteLink, isActive } = req.body;

    const existing = await prisma.whatsappGroup.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // District Admin can only update own district's group
    if (req.user.role === 'DISTRICT_ADMIN' && existing.districtId !== req.user.districtId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const group = await prisma.whatsappGroup.update({
      where: { id: parseInt(id) },
      data: { groupName, inviteLink, isActive },
    });

    return res.status(200).json({ success: true, data: group });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllGroups, getGroupByDistrict, createGroup, updateGroup };
