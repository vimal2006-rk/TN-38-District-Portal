import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';
import api from '../../services/api';
import { getCachedData, setCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';

const BearerCard = memo(function BearerCard({ b, isTa }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
          {isTa ? b.district?.nameTa || b.district?.nameEn : b.district?.nameEn || 'District'}
        </span>
        {b.photoUrl && (
          <img
            src={optimizeImageUrl(b.photoUrl, { width: 160 })}
            alt={b.nameEn}
            width={44}
            height={44}
            loading="lazy"
            decoding="async"
            className="w-11 h-11 rounded-full object-cover border"
          />
        )}
      </div>
      <h3 className="text-base font-bold text-gray-900">
        {isTa ? b.nameTa || b.nameEn : b.nameEn}
      </h3>
      <p className="text-xs text-gray-500 font-medium">
        {isTa ? b.roleTa || b.roleEn : b.roleEn}
      </p>
      {b.phone && (
        <a
          href={`tel:${b.phone}`}
          className="text-xs text-gray-500 hover:text-orange-600 pt-2 border-t border-gray-50 flex items-center gap-1.5"
        >
          <Phone size={12} />
          <span>{b.phone}</span>
        </a>
      )}
    </div>
  );
});

export default function OfficeBearersPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const initialCached = getCachedData('bearers');
  const [bearers, setBearers] = useState(initialCached || []);
  const [loading, setLoading] = useState(!initialCached);

  const handleDistrictChange = useCallback((e) => setSelectedDistrict(e.target.value), []);

  useEffect(() => {
    let active = true;
    api
      .get('/office-bearers')
      .then((res) => {
        if (!active) return;
        const data = res.data?.data || [];
        setBearers(data);
        setCachedData('bearers', data);
      })
      .catch(() => {
        if (active && !initialCached) setBearers([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (selectedDistrict === 'all') return bearers;
    return bearers.filter(
      (b) => (b.district?.nameEn || '').toLowerCase() === selectedDistrict.toLowerCase()
    );
  }, [bearers, selectedDistrict]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('nav.officeBearers', 'District Office Bearers')}
        </h1>
        <p className="text-gray-500 text-sm">
          {isTa
            ? 'அனைத்து மாவட்டங்களின் பொறுப்பாளர்கள் மற்றும் தலைவர்கள் பட்டியல்.'
            : 'Directory of appointed leadership and coordinators across Tamil Nadu districts.'}
        </p>

        {/* Filter */}
        <div className="pt-4 max-w-xs mx-auto">
          <select
            value={selectedDistrict}
            onChange={handleDistrictChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="all">{isTa ? 'அனைத்து மாவட்டங்களும்' : 'All Districts'}</option>
            {TN_DISTRICTS.map((d) => (
              <option key={d.id} value={d.nameEn}>
                {isTa ? d.nameTa : d.nameEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 h-44 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-500 text-sm">
          {isTa ? 'நிர்வாகிகள் விவரங்கள் எதுவும் இல்லை.' : 'No administration members found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((b) => (
            <BearerCard key={b.id} b={b} isTa={isTa} />
          ))}
        </div>
      )}
    </div>
  );
}
