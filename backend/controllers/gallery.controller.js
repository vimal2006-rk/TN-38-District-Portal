const prisma = require('../config/database');
const cloudinary = require('../config/cloudinary');
const { logActivity } = require('../services/activityLog.service');

const getAllGallery = async (req, res, next) => {
  try {
    const { districtId, search, category, mediaType, status, page, limit } = req.query;
    const isAdmin = req.user && (req.user.role === 'SUPER_ADMIN' || req.user.role === 'DISTRICT_ADMIN');

    const where = {};
    if (districtId) where.districtId = parseInt(districtId, 10);
    if (category && category !== 'ALL') where.category = category;
    if (mediaType && (mediaType === 'IMAGE' || mediaType === 'VIDEO')) {
      where.mediaType = mediaType;
    }

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
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { album: { contains: q, mode: 'insensitive' } },
      ];
    }

    const usePagination = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit || '16', 10)));

    const [gallery, total] = await Promise.all([
      prisma.gallery.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
        ...(usePagination ? { skip: (pageNum - 1) * pageSize, take: pageSize } : {}),
      }),
      prisma.gallery.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data: gallery,
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

const uploadMedia = async (req, res, next) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    const {
      districtId,
      titleEn,
      titleTa,
      description,
      category,
      album,
      caption,
      mediaType,
      isPublished,
      mediaUrl: bodyMediaUrl,
    } = req.body;

    const publishedFlag = isPublished === false || isPublished === 'false' ? false : true;

    if (files.length === 0 && !bodyMediaUrl) {
      return res.status(400).json({ success: false, message: 'Please upload at least one image or video file.' });
    }

    const createdItems = [];

    if (files.length > 0) {
      for (const file of files) {
        const detectedType = file.mimetype?.startsWith('video/') ? 'VIDEO' : 'IMAGE';
        const item = await prisma.gallery.create({
          data: {
            districtId: districtId ? parseInt(districtId, 10) : null,
            titleEn: titleEn?.trim() || null,
            titleTa: titleTa?.trim() || null,
            description: description?.trim() || null,
            category: category?.trim() || 'General',
            album: album?.trim() || null,
            mediaUrl: file.path,
            publicId: file.filename || null,
            mediaType: mediaType || detectedType,
            caption: caption?.trim() || null,
            isPublished: publishedFlag,
          },
          include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
        });
        createdItems.push(item);
      }
    } else {
      const item = await prisma.gallery.create({
        data: {
          districtId: districtId ? parseInt(districtId, 10) : null,
          titleEn: titleEn?.trim() || null,
          titleTa: titleTa?.trim() || null,
          description: description?.trim() || null,
          category: category?.trim() || 'General',
          album: album?.trim() || null,
          mediaUrl: bodyMediaUrl.trim(),
          mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
          caption: caption?.trim() || null,
          isPublished: publishedFlag,
        },
        include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
      });
      createdItems.push(item);
    }

    await logActivity({
      userId: req.user?.id,
      action: 'UPLOAD_GALLERY',
      entityType: 'GALLERY',
      entityId: createdItems[0]?.id || null,
      details: `Uploaded ${createdItems.length} gallery item(s) (${createdItems[0]?.category || 'General'})`,
      req,
    });

    return res.status(201).json({
      success: true,
      data: createdItems.length === 1 ? createdItems[0] : createdItems,
      items: createdItems,
    });
  } catch (err) {
    next(err);
  }
};

const updateMedia = async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id, 10);
    const existing = await prisma.gallery.findUnique({ where: { id: mediaId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    const { districtId, titleEn, titleTa, description, category, album, caption, isPublished } = req.body;
    const data = {};
    if (titleEn !== undefined) data.titleEn = titleEn.trim() || null;
    if (titleTa !== undefined) data.titleTa = titleTa.trim() || null;
    if (description !== undefined) data.description = description.trim() || null;
    if (category !== undefined) data.category = category.trim() || 'General';
    if (album !== undefined) data.album = album.trim() || null;
    if (caption !== undefined) data.caption = caption.trim() || null;
    if (districtId !== undefined) data.districtId = districtId ? parseInt(districtId, 10) : null;
    if (isPublished !== undefined) data.isPublished = isPublished === true || isPublished === 'true';

    const updated = await prisma.gallery.update({
      where: { id: mediaId },
      data,
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    await logActivity({
      userId: req.user?.id,
      action: 'UPDATE_GALLERY',
      entityType: 'GALLERY',
      entityId: updated.id,
      details: `Updated gallery item: ${updated.titleEn || updated.id}`,
      req,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const togglePublishMedia = async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id, 10);
    const existing = await prisma.gallery.findUnique({ where: { id: mediaId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    const isPublished = !existing.isPublished;
    const updated = await prisma.gallery.update({
      where: { id: mediaId },
      data: { isPublished },
      include: { district: { select: { id: true, nameEn: true, nameTa: true } } },
    });

    await logActivity({
      userId: req.user?.id,
      action: isPublished ? 'PUBLISH_GALLERY' : 'UNPUBLISH_GALLERY',
      entityType: 'GALLERY',
      entityId: updated.id,
      details: `${isPublished ? 'Published' : 'Unpublished'} gallery item: ${updated.titleEn || updated.id}`,
      req,
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const mediaId = parseInt(req.params.id, 10);
    const existing = await prisma.gallery.findUnique({ where: { id: mediaId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Gallery item not found' });
    }

    // Best-effort Cloudinary cleanup
    if (existing.publicId) {
      try {
        await cloudinary.uploader.destroy(existing.publicId, {
          resource_type: existing.mediaType === 'VIDEO' ? 'video' : 'image',
        });
      } catch (cloudErr) {
        console.warn('Cloudinary delete warning:', cloudErr.message);
      }
    }

    await prisma.gallery.delete({ where: { id: mediaId } });

    await logActivity({
      userId: req.user?.id,
      action: 'DELETE_GALLERY',
      entityType: 'GALLERY',
      entityId: mediaId,
      details: `Deleted gallery item: ${existing.titleEn || mediaId}`,
      req,
    });

    return res.status(200).json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllGallery,
  uploadMedia,
  updateMedia,
  togglePublishMedia,
  deleteMedia,
};
