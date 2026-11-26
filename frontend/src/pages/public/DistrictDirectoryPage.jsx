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
          // Merge API data with local whatsappLink so real links are preserved
          const merged = res.data.data.map((d) => {
            const local = TN_DISTRICTS.find(
              (ld) => ld.slug === d.slug || String(ld.id) === String(d.id)
            );
            return { ...d, whatsappLink: local?.whatsappLink || d.whatsappLink };
          });
          setDistricts(merged);
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
    <div className="min-h-screen py-10" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#EEF2FF', color: '#123DAA' }}
          >
            <MapPin size={14} /> Tamil Nadu Districts
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: '#172554' }}>
            {t('districts.title', 'District Directory')}
          </h1>

          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#64748B' }}>
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
              className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none shadow-sm text-sm transition-all"
              style={{
                borderColor: '#E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#172554'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#123DAA';
                e.target.style.boxShadow = '0 0 0 3px rgba(18, 61, 170, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E2E8F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* Counter */}
        <div
          className="flex items-center justify-between text-xs pb-3 border-b"
          style={{ borderColor: '#E2E8F0', color: '#64748B' }}
        >
          <span className="font-medium">
            {isTa ? `மொத்த மாவட்டங்கள்: ${filtered.length} / 38` : `Showing ${filtered.length} of 38 Districts`}
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="font-medium hover:underline"
              style={{ color: '#F07818' }}
            >
              {isTa ? 'அனைத்தையும் காட்டு' : 'Clear search'}
            </button>
          )}
        </div>

        {/* District Cards Grid */}
        <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((district) => (
            <DistrictCard key={district.id || district.slug} district={district} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16" style={{ color: '#64748B' }}>
            <MapPin size={40} className="mx-auto mb-2 opacity-50 text-blue-500" />
            <p className="font-medium">
              {isTa ? 'மாவட்டங்கள் எதுவும் கிடைக்கவில்லை.' : 'No districts found matching your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
