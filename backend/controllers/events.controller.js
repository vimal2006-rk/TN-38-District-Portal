const prisma = require('../config/database');
const { logActivity } = require('../services/activityLog.service');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

const getAllEvents = async (req, res, next) => {
  try {
    const { districtId, search, status, page, limit } = req.query;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const where = {};
    if (districtId) where.districtId = parseInt(districtId, 10);

    if (!isAdmin) {
      where.isPublished = true;
    } else if (status === 'published') {
      where.isPublished = true;
    } else if (status === 'draft') {
      where.isPublished = false;
    }

    if (status === 'UPCOMING' || status === 'COMPLETED') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { titleEn: { contains: q, mode: 'insensitive' } },
        { titleTa: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const usePagination = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit || '12', 10)));

    const cacheKey = !isAdmin && !search && !status && !usePagination ? `events:public:${districtId || 'all'}` : null;
    if (cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cached);
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        orderBy: { eventDate: 'desc' },
        include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
        ...(usePagination ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
      }),
      prisma.event.count({ where }),
    ]);

    const payload = {
      success: true,
      data: events,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    };

    if (cacheKey) {
      setCache(cacheKey, payload, 30000);
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    }

    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const cacheKey = !isAdmin ? `events:one:${id}` : null;
    if (cacheKey) {
      const cached = getCache(cacheKey);
      if (cached) {
        res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
        return res.status(200).json(cached);
      }
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id, 10) },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    if (!event || (!isAdmin && !event.isPublished)) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const payload = { success: true, data: event };
    if (cacheKey) {
      setCache(cacheKey, payload, 30000);
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    }
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const getEventsByDistrict = async (req, res, next) => {
  try {
    const { districtId } = req.params;
    const cacheKey = `events:district:${districtId}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
      return res.status(200).json(cached);
    }

    const events = await prisma.event.findMany({
      where: { districtId: parseInt(districtId, 10), isPublished: true },
      orderBy: { eventDate: 'desc' },
    });

    const payload = { success: true, data: events };
    setCache(cacheKey, payload, 30000);
    res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const {
      districtId,
      titleEn,
      titleTa,
      descriptionEn,
      descriptionTa,
      eventDate,
      eventTime,
      location,
      status,
      isPublished,
    } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : req.body.imageUrl || null;

    if (!titleEn?.trim() && !titleTa?.trim()) {
      return res.status(400).json({ success: false, message: 'Event title is required.' });
    }
    if (!eventDate) {
      return res.status(400).json({ success: false, message: 'Event date is required.' });
    }

    const data = {
      titleEn: (titleEn || titleTa || '').trim(),
      titleTa: (titleTa || titleEn || '').trim(),
      descriptionEn: (descriptionEn || descriptionTa || '').trim() || null,
      descriptionTa: (descriptionTa || descriptionEn || '').trim() || null,
      eventDate: new Date(eventDate),
      eventTime: eventTime?.trim() || null,
      location: location?.trim() || null,
      imageUrl,
      status: status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING',
      isPublished: isPublished === true || isPublished === 'true',
    };

    if (districtId) data.districtId = parseInt(districtId, 10);

    const event = await prisma.event.create({
      data,
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    invalidateCache('events:');

    await logActivity({
      userId: req.user?.id,
      action: 'CREATE_EVENT',
      entityType: 'EVENT',
      entityId: event.id,
      details: `Created event: ${event.titleEn}`,
      req,
    });

    return res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const {
      districtId,
      titleEn,
      titleTa,
      descriptionEn,
      descriptionTa,
      eventDate,
      eventTime,
      location,
      status,
      isPublished,
    } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : req.body.imageUrl;

    const data = {};
    if (titleEn !== undefined) data.titleEn = titleEn.trim();
    if (titleTa !== undefined) data.titleTa = titleTa.trim();
    if (descriptionEn !== undefined) data.descriptionEn = descriptionEn.trim() || null;
    if (descriptionTa !== undefined) data.descriptionTa = descriptionTa.trim() || null;
    if (eventTime !== undefined) data.eventTime = eventTime.trim() || null;
    if (location !== undefined) data.location = location.trim() || null;
    if (eventDate) data.eventDate = new Date(eventDate);
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (districtId !== undefined) data.districtId = districtId ? parseInt(districtId, 10) : null;
    if (status !== undefined) data.status = status === 'COMPLETED' ? 'COMPLETED' : 'UPCOMING';
    if (isPublished !== undefined) data.isPublished = isPublished === true || isPublished === 'true';

    const event = await prisma.event.update({
      where: { id: eventId },
      data,
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    invalidateCache('events:');

    await logActivity({
      userId: req.user?.id,
      action: 'UPDATE_EVENT',
      entityType: 'EVENT',
      entityId: event.id,
      details: `Updated event: ${event.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const togglePublishEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const isPublished = !existing.isPublished;
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { isPublished },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });
    invalidateCache('events:');

    await logActivity({
      userId: req.user?.id,
      action: isPublished ? 'PUBLISH_EVENT' : 'UNPUBLISH_EVENT',
      entityType: 'EVENT',
      entityId: event.id,
      details: `${isPublished ? 'Published' : 'Unpublished'} event: ${event.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id, 10);
    const existing = await prisma.event.findUnique({ where: { id: eventId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await prisma.event.delete({ where: { id: eventId } });
    invalidateCache('events:');

    await logActivity({
      userId: req.user?.id,
      action: 'DELETE_EVENT',
      entityType: 'EVENT',
      entityId: eventId,
      details: `Deleted event: ${existing.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getEventsByDistrict,
  createEvent,
  updateEvent,
  togglePublishEvent,
  deleteEvent,
};
