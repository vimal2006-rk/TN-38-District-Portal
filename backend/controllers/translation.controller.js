const prisma = require('../config/database');

const getTranslations = async (req, res, next) => {
  try {
    const { lang } = req.params;

    if (!['en', 'ta'].includes(lang)) {
      return res.status(400).json({ success: false, message: 'Lang must be "en" or "ta"' });
    }

    const translations = await prisma.translation.findMany();

    const result = {};
    translations.forEach((t) => {
      result[t.key] = lang === 'en' ? t.valueEn : t.valueTa;
    });

    return res.status(200).json({ success: true, lang, data: result });
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

    return res.status(200).json({ success: true, data: translation });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTranslations, updateTranslation };
