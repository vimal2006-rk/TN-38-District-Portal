const prisma = require('../config/database');

const getAllGallery = async (req, res, next) => {
  try {
    const { districtId } = req.query;
    const where = { isPublished: true };
    if (districtId) where.districtId = parseInt(districtId);

    const gallery = await prisma.gallery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { district: { select: { nameEn: true, nameTa: true } } },
    });

    return res.status(200).json({ success: true, data: gallery });
  } catch (err) {
    next(err);
  }
};

const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { districtId, titleEn, titleTa, caption, mediaType, isPublished } = req.body;
    const mediaUrl = req.file.path; // Cloudinary returns path as secure URL

    const media = await prisma.gallery.create({
      data: {
        districtId: districtId ? parseInt(districtId) : null,
        titleEn: titleEn || null,
        titleTa: titleTa || null,
        mediaUrl,
        mediaType: mediaType || 'IMAGE',
        caption: caption || null,
        isPublished: isPublished === 'false' ? false : true,
      },
    });

    return res.status(201).json({ success: true, data: media });
  } catch (err) {
    next(err);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.gallery.delete({ where: { id: parseInt(id) } });
    return res.status(200).json({ success: true, message: 'Media deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllGallery, uploadMedia, deleteMedia };
