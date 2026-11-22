const prisma = require('../config/database');

const getAllNews = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const where = {};
    if (districtId) where.districtId = parseInt(districtId);
    if (!isAdmin) where.isPublished = true;

    const news = await prisma.news.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const getNewsById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await prisma.news.findUnique({
      where: { id: parseInt(id) },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const createNews = async (req, res, next) => {
  try {
    const { districtId, titleEn, titleTa, contentEn, contentTa, isPublished } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl || null;

    const data = {
      titleEn,
      titleTa,
      contentEn,
      contentTa,
      imageUrl,
      isPublished: isPublished === true || isPublished === 'true',
    };

    if (districtId) data.districtId = parseInt(districtId);
    if (data.isPublished) data.publishedAt = new Date();

    const news = await prisma.news.create({ data });

    return res.status(201).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { districtId, titleEn, titleTa, contentEn, contentTa, isPublished } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    const data = { titleEn, titleTa, contentEn, contentTa };
    if (imageUrl !== undefined) data.imageUrl = imageUrl;
    if (districtId !== undefined) data.districtId = districtId ? parseInt(districtId) : null;
    if (isPublished !== undefined) {
      data.isPublished = isPublished === true || isPublished === 'true';
      if (data.isPublished) data.publishedAt = new Date();
    }

    const news = await prisma.news.update({ where: { id: parseInt(id) }, data });

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.news.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ success: true, message: 'News deleted' });
  } catch (err) {
    next(err);
  }
};

const togglePublish = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.news.findUnique({ where: { id: parseInt(id) } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'News not found' });
    }

    const isPublished = !existing.isPublished;
    const news = await prisma.news.update({
      where: { id: parseInt(id) },
      data: {
        isPublished,
        publishedAt: isPublished ? new Date() : existing.publishedAt,
      },
    });

    return res.status(200).json({ success: true, data: news });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllNews, getNewsById, createNews, updateNews, deleteNews, togglePublish };
