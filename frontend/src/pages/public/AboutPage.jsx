import { useTranslation } from 'react-i18next';
import { Target, Eye, Users, Shield } from 'lucide-react';

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('about.title', 'About Our Organization')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          {isTa
            ? 'தமிழ்நாட்டின் அனைத்து 38 மாவட்டங்களையும் ஒருமுகப்படுத்தி சமுதாய வளர்ச்சி மற்றும் மக்கள் நலப் பணிகளை ஒருங்கிணைக்கும் தலைமை அமைப்பு.'
            : 'A centralized organization connecting all 38 districts of Tamil Nadu for unified community development, leadership, and public service.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('about.mission', 'Our Mission')}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isTa
              ? 'தமிழ்நாட்டின் ஒவ்வொரு மாவட்டத்திலும் உள்ள மக்களை தொழில்நுட்பத்தின் மூலம் இணைத்து, வெளிப்படையான நிர்வாகம் மற்றும் வேகமான தகவல் பரிமாற்றத்தை வழங்குவதே எங்கள் நோக்கம்.'
              : 'To empower citizens and community workers across all 38 districts of Tamil Nadu by leveraging digital infrastructure for transparent governance, rapid collaboration, and unified administration.'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-600">
            <Eye size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('about.vision', 'Our Vision')}</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            {isTa
              ? 'மாநில அளவிலும் மாவட்ட அளவிலும் ஒருமித்த நோக்கத்தோடு செயல்படும் மாதிரி அமைப்பாக திகழ்வது மற்றும் அனைத்து மாவட்ட மக்களுக்கும் சமமான வாய்ப்புகளை உறுதி செய்வது.'
              : 'To become the premier model organization uniting grassroots leadership across every district with state administration, ensuring equitable opportunities and support for every member.'}
          </p>
        </div>
      </div>
    </div>
  );
}
