import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div
      className="flex items-center gap-1 rounded-full p-0.5 border"
      style={{ backgroundColor: '#09246B', borderColor: 'rgba(255, 255, 255, 0.25)' }}
    >
      <button
        onClick={() => i18n.changeLanguage('ta')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          current === 'ta'
            ? 'text-white shadow-sm font-bold'
            : 'text-blue-200 hover:text-white hover:bg-white/10'
        }`}
        style={current === 'ta' ? { backgroundColor: '#F07818' } : {}}
        aria-label="Switch to Tamil"
      >
        தமிழ்
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${
          current === 'en'
            ? 'text-white shadow-sm font-bold'
            : 'text-blue-200 hover:text-white hover:bg-white/10'
        }`}
        style={current === 'en' ? { backgroundColor: '#F07818' } : {}}
        aria-label="Switch to English"
      >
        English
      </button>
    </div>
  );
}
