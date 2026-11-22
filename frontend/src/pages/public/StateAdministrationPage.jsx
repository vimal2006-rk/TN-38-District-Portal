import { useTranslation } from 'react-i18next';
import { ShieldCheck, Phone, Mail, Award } from 'lucide-react';

const STATE_LEADERS = [
  { id: 1, nameEn: 'State President', nameTa: 'மாநில தலைவர்', designationEn: 'State President', designationTa: 'மாநில தலைவர்', phone: '+91 94440 10001' },
  { id: 2, nameEn: 'State General Secretary', nameTa: 'மாநில பொதுச் செயலாளர்', designationEn: 'General Secretary', designationTa: 'பொதுச் செயலாளர்', phone: '+91 94440 10002' },
  { id: 3, nameEn: 'State Treasurer', nameTa: 'மாநில பொருளாளர்', designationEn: 'Treasurer', designationTa: 'பொருளாளர்', phone: '+91 94440 10003' },
  { id: 4, nameEn: 'State Vice President', nameTa: 'மாநில துணைத் தலைவர்', designationEn: 'Vice President', designationTa: 'துணைத் தலைவர்', phone: '+91 94440 10004' },
  { id: 5, nameEn: 'State Joint Secretary', nameTa: 'மாநில இணைச் செயலாளர்', designationEn: 'Joint Secretary', designationTa: 'இணைச் செயலாளர்', phone: '+91 94440 10005' },
  { id: 6, nameEn: 'State Youth Wing Secretary', nameTa: 'மாநில இளைஞரணி செயலாளர்', designationEn: 'Youth Wing Secretary', designationTa: 'இளைஞரணி செயலாளர்', phone: '+91 94440 10006' },
];

export default function StateAdministrationPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1">
          <Award size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('nav.stateAdmin', 'State Administration')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          {isTa
            ? 'தமிழ்நாடு மாநில அளவிலான தலைமை நிர்வாகிகள் மற்றும் பொறுப்பாளர்கள் விவரங்கள்.'
            : 'Key state-level executive leadership and central committee administrators.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {STATE_LEADERS.map((leader) => (
          <div
            key={leader.id}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition text-center space-y-4"
          >
            <div className="w-20 h-20 rounded-full bg-orange-50 text-orange-600 border-2 border-orange-200 mx-auto flex items-center justify-center font-bold text-xl">
              {leader.nameEn.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{isTa ? leader.nameTa : leader.nameEn}</h3>
              <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mt-0.5">
                {isTa ? leader.designationTa : leader.designationEn}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-50 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Phone size={14} className="text-gray-400" />
              <span>{leader.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
