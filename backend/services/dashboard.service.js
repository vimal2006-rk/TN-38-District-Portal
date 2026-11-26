const prisma = require('../config/database');

const getDashboardStats = async () => {
  const now = new Date();

  const [
    totalNews,
    publishedNews,
    totalEvents,
    upcomingEvents,
    totalGalleryPhotos,
    totalGalleryVideos,
    recentActivities,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { isPublished: true } }),
    prisma.event.count(),
    prisma.event.count({
      where: {
        OR: [
          { status: 'UPCOMING', eventDate: { gte: now } },
          { eventDate: { gte: now } },
        ],
      },
    }),
    prisma.gallery.count({ where: { mediaType: 'IMAGE' } }),
    prisma.gallery.count({ where: { mediaType: 'VIDEO' } }),
    prisma.adminActivityLog.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return {
    stats: {
      totalNews,
      publishedNews,
      totalEvents,
      upcomingEvents,
      totalGalleryPhotos,
      totalGalleryVideos,
    },
    recentActivities,
  };
};

module.exports = { getDashboardStats };
