import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { getCachedData, setCachedData } from '../../utils/clientCache';

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const initialCached = getCachedData('news');
  const [newsList, setNewsList] = useState(initialCached || []);
  const [loading, setLoading] = useState(!initialCached);

  useEffect(() => {
    let active = true;
    api
      .get('/news')
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || [];
        setNewsList(data);
        setCachedData('news', data);
      })
      .catch(() => {
        if (active && !initialCached) setNewsList([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1">
          <Newspaper size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('news.title', 'News & Announcements')}
        </h1>
        <p className="text-gray-500 text-sm">
          {isTa
            ? 'அமைப்பின் அதிகாரப்பூர்வ செய்திகள் மற்றும் அறிவிப்புகள்.'
            : 'Latest organizational press releases, district news, and circulars.'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse" />
          ))}
        </div>
      ) : newsList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-500 text-sm">
          {isTa ? 'தற்போது வெளியிடப்பட்ட செய்திகள் இல்லை.' : 'No published news articles yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
          {newsList.map((item) => {
            const dateStr = new Date(item.publishedAt || item.createdAt).toLocaleDateString();
            const districtLabel = item.district
              ? isTa
                ? item.district.nameTa
                : item.district.nameEn
              : isTa
              ? 'மாநிலம் முழுவதும்'
              : 'Statewide';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={isTa ? item.titleTa : item.titleEn}
                    loading="lazy"
                    decoding="async"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white">
                    <Newspaper size={40} className="opacity-70" />
                  </div>
                )}

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <Calendar size={13} />
                      <span>{dateStr}</span>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">{districtLabel}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {isTa ? item.titleTa || item.titleEn : item.titleEn}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                      {isTa ? item.contentTa || item.contentEn : item.contentEn}
                    </p>
                  </div>

                  <Link
                    to={`/news/${item.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 pt-3"
                  >
                    <span>{isTa ? 'மேலும் வாசிக்க' : 'Read Full Story'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
