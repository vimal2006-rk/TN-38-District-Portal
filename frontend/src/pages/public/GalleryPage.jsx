import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Image as ImageIcon, Camera, Video, X } from 'lucide-react';
import api from '../../services/api';
import { getCachedData, setCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SafeImage from '../../components/common/SafeImage';

const GalleryCard = memo(function GalleryCard({ item, isTa, onSelect }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer"
    >
      <div className="relative h-32 xs:h-40 sm:h-52 bg-gray-100 flex items-center justify-center overflow-hidden">
        {item.mediaType === 'VIDEO' ? (
          <>
            <video src={item.mediaUrl} preload="metadata" className="w-full h-full object-cover" />
            <span className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white">
              <Video size={14} />
            </span>
          </>
        ) : item.mediaUrl ? (
          <SafeImage
            src={optimizeImageUrl(item.mediaUrl, { width: 600 })}
            alt={isTa ? item.titleTa || item.titleEn : item.titleEn || 'Gallery'}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fallback={<ImageIcon size={36} className="text-orange-400" />}
          />
        ) : (
          <ImageIcon size={36} className="text-orange-400" />
        )}
      </div>
      <div className="p-3 sm:p-4">
        <span className="text-[9px] sm:text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
          {item.category || 'General'}
        </span>
        <h3 className="font-bold text-gray-800 text-xs sm:text-sm mt-1 truncate">
          {isTa ? item.titleTa || item.titleEn || 'Media' : item.titleEn || 'Media'}
        </h3>
      </div>
    </div>
  );
});

export default function GalleryPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const initialCached = getCachedData('gallery');
  const [items, setItems] = useState(initialCached || []);
  const [loading, setLoading] = useState(!initialCached);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null);

  const closeModal = useCallback(() => setSelectedItem(null), []);

  const fetchGallery = useCallback((isActive = () => true) => {
    api
      .get('/gallery', { skipDedupe: true })
      .then((res) => {
        if (!isActive()) return;
        const data = res.data?.data || [];
        setItems(data);
        setCachedData('gallery', data);
      })
      .catch(() => {
        if (isActive() && !getCachedData('gallery')) setItems([]);
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    fetchGallery(() => active);
    return () => {
      active = false;
    };
  }, [fetchGallery]);

  useAutoRefresh('gallery', fetchGallery);

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category || 'General'));
    return ['ALL', ...Array.from(cats)];
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === 'ALL') return items;
    return items.filter((i) => (i.category || 'General') === activeCategory);
  }, [items, activeCategory]);

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
          {isTa
            ? 'அமைப்பின் முக்கிய நிகழ்வுகள் மற்றும் புகைப்படத் தொகுப்புகள்.'
            : 'Visual memories from state conventions, rallies, and district initiatives.'}
        </p>

        {categories.length > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'ALL' ? (isTa ? 'அனைத்தும்' : 'All') : cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 h-56 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-500 text-sm">
          {isTa ? 'தற்போது படங்கள் எதுவும் இல்லை.' : 'No published gallery media yet.'}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-3 sm:gap-6">
          {filtered.map((item) => (
            <GalleryCard key={item.id} item={item} isTa={isTa} onSelect={setSelectedItem} />
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {isTa ? selectedItem.titleTa || selectedItem.titleEn : selectedItem.titleEn || 'Media'}
                </h3>
                <p className="text-xs text-gray-400">{selectedItem.category}</p>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <div className="bg-black flex items-center justify-center max-h-[70vh]">
              {selectedItem.mediaType === 'VIDEO' ? (
                <video src={selectedItem.mediaUrl} controls autoPlay className="max-h-[70vh] w-full" />
              ) : (
                <img
                  src={optimizeImageUrl(selectedItem.mediaUrl, { width: 1400 })}
                  alt={selectedItem.titleEn || 'Gallery'}
                  decoding="async"
                  className="max-h-[70vh] object-contain"
                />
              )}
            </div>
            {selectedItem.description && (
              <p className="p-4 text-xs sm:text-sm text-gray-600">{selectedItem.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
