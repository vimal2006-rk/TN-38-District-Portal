const prisma = require('../config/database');

const getDashboardStats = async () => {
  const now = new Date();

  const [
    newsGroups,
    totalEvents,
    upcomingEvents,
    galleryGroups,
    recentActivities,
  ] = await Promise.all([
    prisma.news.groupBy({
      by: ['isPublished'],
      _count: { _all: true },
    }),
    prisma.event.count(),
    prisma.event.count({
      where: {
        OR: [
          { status: 'UPCOMING', eventDate: { gte: now } },
          { eventDate: { gte: now } },
        ],
      },
    }),
    prisma.gallery.groupBy({
      by: ['mediaType'],
      _count: { _all: true },
    }),
    prisma.adminActivityLog.findMany({
      take: 12,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  let totalNews = 0;
  let publishedNews = 0;
  for (const g of newsGroups) {
    totalNews += g._count._all;
    if (g.isPublished) publishedNews = g._count._all;
  }

  let totalGalleryPhotos = 0;
  let totalGalleryVideos = 0;
  for (const g of galleryGroups) {
    if (g.mediaType === 'IMAGE') totalGalleryPhotos = g._count._all;
    else if (g.mediaType === 'VIDEO') totalGalleryVideos = g._count._all;
  }

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
