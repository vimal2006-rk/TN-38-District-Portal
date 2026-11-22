import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Camera } from 'lucide-react';

const GALLERY_ITEMS = [
  { id: 1, title: 'State Assembly 2026', titleTa: 'மாநில மாநாடு 2026', category: 'Events' },
  { id: 2, title: 'Madurai Office Opening', titleTa: 'மதுரை அலுவலக திறப்பு', category: 'Inauguration' },
  { id: 3, title: 'Coimbatore Youth Meet', titleTa: 'கோவை இளைஞர் சந்திப்பு', category: 'Youth' },
  { id: 4, title: 'Chennai Executive Meeting', titleTa: 'சென்னை செயற்குழு கூட்டம்', category: 'Meeting' },
  { id: 5, title: 'Salem District Rally', titleTa: 'சேலம் பேரணி', category: 'Events' },
  { id: 6, title: 'Tiruchirappalli Convention', titleTa: 'திருச்சி மாநாடு', category: 'Events' },
];

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1">
          <Camera size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('gallery.title', 'Photo & Media Gallery')}
        </h1>
        <p className="text-gray-500 text-sm">
          {isTa ? 'அமைப்பின் முக்கிய நிகழ்வுகள் மற்றும் புகைப்படத் தொகுப்புகள்.' : 'Visual memories from state conventions, rallies, and district initiatives.'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-3 sm:gap-6">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="h-32 xs:h-40 sm:h-52 bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white/90">
              <ImageIcon size={36} className="group-hover:scale-110 transition-transform duration-300 sm:w-12 sm:h-12" />
            </div>
            <div className="p-3 sm:p-4">
              <span className="text-[9px] sm:text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                {item.category}
              </span>
              <h3 className="font-bold text-gray-800 text-xs sm:text-sm mt-1 truncate">{isTa ? item.titleTa : item.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
