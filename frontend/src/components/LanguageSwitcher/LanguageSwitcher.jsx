import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  return (
    <div className="flex items-center gap-1 bg-orange-700 rounded-full p-0.5">
      <button
        onClick={() => i18n.changeLanguage('ta')}
        className={`px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
          current === 'ta'
            ? 'bg-white text-orange-700 shadow-sm font-bold'
            : 'text-white hover:bg-orange-600'
        }`}
        aria-label="Switch to Tamil"
      >
        தமிழ்
      </button>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className={`px-2 xs:px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium transition-colors ${
          current === 'en'
            ? 'bg-white text-orange-700 shadow-sm font-bold'
            : 'text-white hover:bg-orange-600'
        }`}
        aria-label="Switch to English"
      >
        English
      </button>
    </div>
  );
}
