import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';

export default function EventDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {isTa ? 'நிகழ்வுகள் பக்கத்திற்குத் திரும்பு' : 'Back to Events'}
      </Link>

      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm space-y-6">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
          {isTa ? 'மாநில மாநாடு' : 'State Conclave'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {isTa ? 'மாநில அளவிலான தலைமைத்துவ மாநாடு 2026' : 'State Level Leadership Conclave 2026'}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} className="text-orange-600" />
            <span>2026-12-15</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-orange-600" />
            <span>10:00 AM - 05:00 PM</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-orange-600" />
            <span>Chennai Trade Centre</span>
          </div>
        </div>

        <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed space-y-4">
          <p>
            {isTa
              ? 'தமிழ்நாட்டின் அனைத்து 38 மாவட்டங்களிலிருந்தும் நிர்வாகிகள் மற்றும் பிரதிநிதிகள் கலந்துகொள்ளும் வரலாற்றுச் சிறப்புமிக்க தலைமைத்துவ மாநாடு.'
              : 'Grand gathering of leaders and district coordinators from all 38 districts of Tamil Nadu.'}
          </p>
        </div>
      </div>
    </div>
  );
}
