import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-6xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('contact.title', 'Contact Us')}
        </h1>
        <p className="text-gray-500 text-sm">
          {isTa
            ? 'அமைப்பின் தலைமை அலுவலகம் மற்றும் மாவட்ட அலுவலகங்களை தொடர்பு கொள்ளவும்.'
            : 'Get in touch with our central headquarters or your local district team.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
            <MapPin size={22} />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{t('contact.address', 'Headquarters')}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            State Central Office, Anna Salai, Chennai, Tamil Nadu – 600002
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Phone size={22} />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{t('contact.phone', 'Phone Numbers')}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            <a href="tel:+919944773668" className="hover:text-blue-600 transition-colors font-semibold">
              +91 99447 73668
            </a>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Mail size={22} />
          </div>
          <h3 className="font-bold text-gray-900 text-base">{t('contact.email', 'Email')}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            contact@tn38portal.com<br />support@tn38portal.com
          </p>
        </div>
      </div>
    </div>
  );
}
