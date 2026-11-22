const prisma = require('../config/database');

const getAllEvents = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const where = {};
    if (districtId) where.districtId = parseInt(districtId);
    if (!isAdmin) where.isPublished = true;

    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'desc' },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const getEventsByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const events = await prisma.event.findMany({
      where: { districtId: parseInt(districtId), isPublished: true },
      orderBy: { eventDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const { districtId, titleEn, titleTa, descriptionEn, descriptionTa, eventDate, location, isPublished } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl || null;

    const data = {
      titleEn,
      titleTa,
      descriptionEn,
      descriptionTa,
      eventDate: new Date(eventDate),
      location,
      imageUrl,
      isPublished: isPublished === true || isPublished === 'true',
    };

    if (districtId) data.districtId = parseInt(districtId);

    const event = await prisma.event.create({ data });

    return res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { districtId, titleEn, titleTa, descriptionEn, descriptionTa, eventDate, location, isPublished } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    const data = { titleEn, titleTa, descriptionEn, descriptionTa, location };
    if (eventDate) data.eventDate = new Date(eventDate);
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (districtId !== undefined) data.districtId = districtId ? parseInt(districtId) : null;
    if (isPublished !== undefined) data.isPublished = isPublished === true || isPublished === 'true';

    const event = await prisma.event.update({ where: { id: parseInt(id) }, data });

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.event.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllEvents, getEventById, getEventsByDistrict, createEvent, updateEvent, deleteEvent };
