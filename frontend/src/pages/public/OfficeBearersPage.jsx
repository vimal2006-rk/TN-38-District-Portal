import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Filter } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';

export default function OfficeBearersPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const sampleBearers = [
    { id: 1, district: 'Chennai', districtTa: 'சென்னை', nameEn: 'R. Senthil Kumar', nameTa: 'ஆர். செந்தில் குமார்', roleEn: 'District President', roleTa: 'மாவட்ட தலைவர்', phone: '+91 98400 12345' },
    { id: 2, district: 'Chennai', districtTa: 'சென்னை', nameEn: 'M. Anand', nameTa: 'எம். ஆனந்த்', roleEn: 'District Secretary', roleTa: 'மாவட்ட செயலாளர்', phone: '+91 98400 23456' },
    { id: 3, district: 'Madurai', districtTa: 'மதுரை', nameEn: 'K. Murugan', nameTa: 'கே. முருகன்', roleEn: 'District President', roleTa: 'மாவட்ட தலைவர்', phone: '+91 98400 34567' },
    { id: 4, district: 'Coimbatore', districtTa: 'கோயம்புத்தூர்', nameEn: 'S. Rajesh', nameTa: 'எஸ். ராஜேஷ்', roleEn: 'District President', roleTa: 'மாவட்ட தலைவர்', phone: '+91 98400 45678' },
    { id: 5, district: 'Salem', districtTa: 'சேலம்', nameEn: 'P. Karuppiah', nameTa: 'பி. கருப்பையா', roleEn: 'District President', roleTa: 'மாவட்ட தலைவர்', phone: '+91 98400 56789' },
    { id: 6, district: 'Tiruchirappalli', districtTa: 'திருச்சிராப்பள்ளி', nameEn: 'V. Ramanathan', nameTa: 'வி. ராமநாதன்', roleEn: 'District President', roleTa: 'மாவட்ட தலைவர்', phone: '+91 98400 67890' },
  ];

  const filtered = selectedDistrict === 'all'
    ? sampleBearers
    : sampleBearers.filter((b) => b.district.toLowerCase() === selectedDistrict.toLowerCase());

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
            onChange={(e) => setSelectedDistrict(e.target.value)}
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

      <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
              {isTa ? b.districtTa : b.district}
            </span>
            <h3 className="text-base font-bold text-gray-900">{isTa ? b.nameTa : b.nameEn}</h3>
            <p className="text-xs text-gray-500 font-medium">{isTa ? b.roleTa : b.roleEn}</p>
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-50">{b.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
