import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Newspaper, Calendar, ArrowRight } from 'lucide-react';

const SAMPLE_NEWS = [
  {
    id: 1,
    titleEn: 'State Annual General Meeting Announced for All 38 Districts',
    titleTa: 'அனைத்து 38 மாவட்டங்களுக்கான மாநில பொதுக்குழுக் கூட்டம் அறிவிப்பு',
    date: '2026-11-20',
    district: 'Statewide',
    excerptEn: 'The state executive committee has finalized the schedule for the upcoming annual general assembly.',
    excerptTa: 'வரவிருக்கும் மாநில பொதுக்குழுக் கூட்டத்திற்கான தேதியை மாநில செயற்குழு அதிகாரப்பூர்வமாக அறிவித்துள்ளது.'
  },
  {
    id: 2,
    titleEn: 'New District Office Inauguration in Madurai',
    titleTa: 'மதுரையில் புதிய மாவட்ட தலைமை அலுவலகம் திறப்பு விழா',
    date: '2026-11-15',
    district: 'Madurai',
    excerptEn: 'The new administrative office for Madurai district was successfully inaugurated today.',
    excerptTa: 'மதுரை மாவட்டத்திற்கான நவீன நிர்வாக அலுவலகம் இன்று சிறப்பாக திறக்கப்பட்டது.'
  },
  {
    id: 3,
    titleEn: 'Youth Leadership Training Camp in Coimbatore',
    titleTa: 'கோயம்புத்தூரில் இளைஞர் தலைமைப் பண்பு பயிற்சி முகாம்',
    date: '2026-11-10',
    district: 'Coimbatore',
    excerptEn: 'Over 500 youth members participated in the district leadership development camp.',
    excerptTa: 'கோயம்புத்தூர் மாவட்டத்தில் நடைபெற்ற இளைஞர் தலைமைத்துவ பயிற்சி முகாமில் 500-க்கும் மேற்பட்டோர் பங்கேற்றனர்.'
  }
];

export default function NewsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

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
          {isTa ? 'அமைப்பின் அதிகாரப்பூர்வ செய்திகள் மற்றும் அறிவிப்புகள்.' : 'Latest organizational press releases, district news, and circulars.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
        {SAMPLE_NEWS.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="h-44 bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white">
              <Newspaper size={40} className="opacity-70" />
            </div>
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <Calendar size={13} />
                  <span>{item.date}</span>
                  <span>•</span>
                  <span className="text-orange-600 font-medium">{item.district}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {isTa ? item.titleTa : item.titleEn}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {isTa ? item.excerptTa : item.excerptEn}
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
        ))}
      </div>
    </div>
  );
}
