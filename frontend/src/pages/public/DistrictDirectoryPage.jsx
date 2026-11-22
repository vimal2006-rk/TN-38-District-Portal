import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin } from 'lucide-react';
import DistrictCard from '../../components/DistrictCard/DistrictCard';
import { TN_DISTRICTS } from '../../utils/districtsData';
import api from '../../services/api';

export default function DistrictDirectoryPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [districts, setDistricts] = useState(TN_DISTRICTS);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/districts')
      .then((res) => {
        if (res.data?.data?.length > 0) {
          setDistricts(res.data.data);
        }
      })
      .catch(() => {
        setDistricts(TN_DISTRICTS);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return districts;
    return districts.filter((d) =>
      d.nameEn?.toLowerCase().includes(q) ||
      d.nameTa?.includes(q) ||
      d.slug?.toLowerCase().includes(q)
    );
  }, [districts, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('districts.title', 'District Directory')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          {isTa
            ? 'தமிழ்நாட்டின் 38 மாவட்டங்களின் அதிகாரப்பூர்வ விவரங்கள் மற்றும் வாட்ஸ்அப் இணைப்பு வழிகள்.'
            : 'Access official contact information, leadership details, and community links for all 38 districts.'}
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTa ? 'மாவட்டம் தேடுங்கள் (எ.கா: Madurai, சென்னை)...' : 'Search district (e.g. Chennai, Madurai)...'}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-100 pb-3">
        <span>{isTa ? `மொத்த மாவட்டங்கள்: ${filtered.length}` : `Showing ${filtered.length} of 38 Districts`}</span>
      </div>

      <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-3 sm:gap-5">
        {filtered.map((district) => (
          <DistrictCard key={district.id || district.slug} district={district} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <MapPin size={40} className="mx-auto mb-2 opacity-50" />
          <p>{isTa ? 'மாவட்டங்கள் எதுவும் கிடைக்கவில்லை.' : 'No districts found matching your search.'}</p>
        </div>
      )}
    </div>
  );
}
