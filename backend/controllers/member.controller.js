const prisma = require('../config/database');

const registerMember = async (req, res, next) => {
  try {
    const { fullName, mobile, email, districtId, address, membershipCategory } = req.body;

    const member = await prisma.member.create({
      data: {
        fullName,
        mobile,
        email,
        districtId: parseInt(districtId),
        address,
        membershipCategory: membershipCategory || 'General',
        status: 'PENDING',
      },
    });

    return res.status(201).json({ success: true, message: 'Registration submitted. Awaiting approval.', data: member });
  } catch (err) {
    next(err);
  }
};

const getAllMembers = async (req, res, next) => {
  try {
    const { districtId, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (districtId) where.districtId = parseInt(districtId);
    if (status) where.status = status;

    // District Admin can only see own district
    if (req.user.role === 'DISTRICT_ADMIN' && req.user.districtId) {
      where.districtId = req.user.districtId;
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { registeredAt: 'desc' },
        include: { district: { select: { nameEn: true, nameTa: true } } },
      }),
      prisma.member.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: members,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

const getMemberById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await prisma.member.findUnique({
      where: { id: parseInt(id) },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // District Admin can only view own district's member
    if (req.user.role === 'DISTRICT_ADMIN' && member.districtId !== req.user.districtId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

const updateMemberStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['APPROVED', 'REJECTED', 'INACTIVE'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });
    }

    const existing = await prisma.member.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    // District Admin can only update own district members
    if (req.user.role === 'DISTRICT_ADMIN' && existing.districtId !== req.user.districtId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const data = { status };
    if (status === 'APPROVED') data.approvedAt = new Date();

    const member = await prisma.member.update({ where: { id: parseInt(id) }, data });

    return res.status(200).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
};

const deleteMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.member.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ success: true, message: 'Member deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { registerMember, getAllMembers, getMemberById, updateMemberStatus, deleteMember };
