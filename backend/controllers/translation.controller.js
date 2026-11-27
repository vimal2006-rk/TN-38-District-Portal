const prisma = require('../config/database');
const { getCache, setCache, invalidateCache } = require('../utils/cache');

const getTranslations = async (req, res, next) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ta'].includes(lang)) {
      return res.status(400).json({ success: false, message: 'Lang must be "en" or "ta"' });
    }

    const cacheKey = `translations:${lang}`;
    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
      return res.status(200).json(cached);
    }

    const translations = await prisma.translation.findMany({
      select: { key: true, valueEn: true, valueTa: true },
    });

    const result = {};
    for (const t of translations) {
      result[t.key] = lang === 'en' ? t.valueEn : t.valueTa;
    }

    const payload = { success: true, lang, data: result };
    setCache(cacheKey, payload, 60000);
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
};

const updateTranslation = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { valueEn, valueTa, section } = req.body;

    const translation = await prisma.translation.upsert({
      where: { key },
      update: {
        ...(valueEn !== undefined && { valueEn }),
        ...(valueTa !== undefined && { valueTa }),
        ...(section !== undefined && { section }),
      },
      create: { key, valueEn: valueEn || '', valueTa: valueTa || '', section },
    });
    invalidateCache('translations:');

    return res.status(200).json({ success: true, data: translation });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTranslations, updateTranslation };
