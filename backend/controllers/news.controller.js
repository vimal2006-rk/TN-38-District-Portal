const prisma = require('../config/database');
const { logActivity } = require('../services/activityLog.service');
const { resolveUploadedFileUrl } = require('../middleware/upload.middleware');

const getAllNews = async (req, res, next) => {
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

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { titleEn: { contains: q, mode: 'insensitive' } },
        { titleTa: { contains: q, mode: 'insensitive' } },
        { contentEn: { contains: q, mode: 'insensitive' } },
        { contentTa: { contains: q, mode: 'insensitive' } },
      ];
    }

    const usePagination = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit || '12', 10)));

    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
        ...(usePagination ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
      }),
      prisma.news.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: news,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const news = await prisma.news.findUnique({
      where: { id: parseInt(id, 10) },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    if (!news || (!isAdmin && !news.isPublished)) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const createNews = async (req, res, next) => {
  try {
    const { districtId, titleEn, titleTa, contentEn, contentTa, isPublished, publishedAt } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : req.body.imageUrl || null;
    const publishedFlag = isPublished === true || isPublished === 'true';

    if (!titleEn?.trim() && !titleTa?.trim()) {
      return res.status(400).json({ success: false, message: 'News title is required.' });
    }

    const data = {
      titleEn: (titleEn || titleTa || '').trim(),
      titleTa: (titleTa || titleEn || '').trim(),
      contentEn: (contentEn || contentTa || '').trim(),
      contentTa: (contentTa || contentEn || '').trim(),
      imageUrl,
      isPublished: publishedFlag,
      publishedAt: publishedAt ? new Date(publishedAt) : publishedFlag ? new Date() : null,
    };

    if (districtId) data.districtId = parseInt(districtId, 10);

    const news = await prisma.news.create({
      data,
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    await logActivity({
      userId: req.user?.id,
      action: 'CREATE_NEWS',
      entityType: 'NEWS',
      entityId: news.id,
      details: `Created news: ${news.titleEn} (${news.isPublished ? 'Published' : 'Draft'})`,
      req,
    });

    return res.status(201).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newsId = parseInt(id, 10);
    const existing = await prisma.news.findUnique({ where: { id: newsId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    const { districtId, titleEn, titleTa, contentEn, contentTa, isPublished, publishedAt } = req.body;
    const imageUrl = req.file ? resolveUploadedFileUrl(req, req.file) : req.body.imageUrl;

    const data = {};
    if (titleEn !== undefined) data.titleEn = titleEn.trim();
    if (titleTa !== undefined) data.titleTa = titleTa.trim();
    if (contentEn !== undefined) data.contentEn = contentEn.trim();
    if (contentTa !== undefined) data.contentTa = contentTa.trim();
    if (imageUrl !== undefined) data.imageUrl = imageUrl || null;
    if (districtId !== undefined) data.districtId = districtId ? parseInt(districtId, 10) : null;

    if (publishedAt !== undefined) {
      data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    }

    if (isPublished !== undefined) {
      data.isPublished = isPublished === true || isPublished === 'true';
      if (data.isPublished && !data.publishedAt && !existing.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    const news = await prisma.news.update({
      where: { id: newsId },
      data,
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    await logActivity({
      userId: req.user?.id,
      action: 'UPDATE_NEWS',
      entityType: 'NEWS',
      entityId: news.id,
      details: `Updated news: ${news.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const newsId = parseInt(req.params.id, 10);
    const existing = await prisma.news.findUnique({ where: { id: newsId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    await prisma.news.delete({ where: { id: newsId } });

    await logActivity({
      userId: req.user?.id,
      action: 'DELETE_NEWS',
      entityType: 'NEWS',
      entityId: newsId,
      details: `Deleted news: ${existing.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, message: 'News deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const newsId = parseInt(req.params.id, 10);
    const existing = await prisma.news.findUnique({ where: { id: newsId } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    const isPublished = !existing.isPublished;
    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        isPublished,
        publishedAt: isPublished ? existing.publishedAt || new Date() : existing.publishedAt,
      },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    await logActivity({
      userId: req.user?.id,
      action: isPublished ? 'PUBLISH_NEWS' : 'UNPUBLISH_NEWS',
      entityType: 'NEWS',
      entityId: news.id,
      details: `${isPublished ? 'Published' : 'Unpublished'} news: ${news.titleEn}`,
      req,
    });

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllNews, getNewsById, createNews, updateNews, deleteNews, togglePublish };
