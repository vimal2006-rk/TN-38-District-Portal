import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const SAMPLE_EVENTS = [
  {
    id: 1,
    titleEn: 'State Level Leadership Conclave 2026',
    titleTa: 'மாநில அளவிலான தலைமைத்துவ மாநாடு 2026',
    date: '2026-12-15',
    time: '10:00 AM',
    location: 'Chennai Trade Centre, Nandambakkam',
    descEn: 'Annual gathering of office bearers from all 38 districts.',
    descTa: 'அனைத்து 38 மாவட்டங்களின் நிர்வாகிகள் பங்கேற்கும் வருடாந்திர மாநாடு.'
  },
  {
    id: 2,
    titleEn: 'District Membership Drive & Awareness Camp',
    titleTa: 'மாவட்ட உறுப்பினர் சேர்க்கை & விழிப்புணர்வு முகாம்',
    date: '2026-12-20',
    time: '09:30 AM',
    location: 'Madurai District Central Hall',
    descEn: 'Public outreach and member verification session in Madurai.',
    descTa: 'மதுரை மாவட்டத்திற்கான உறுப்பினர் சேர்க்கை மற்றும் விழிப்புணர்வு முகாம்.'
  },
  {
    id: 3,
    titleEn: 'Youth Skill Development Workshop',
    titleTa: 'இளைஞர் திறன் மேம்பாட்டுப் பயிலரங்கம்',
    date: '2026-12-28',
    time: '11:00 AM',
    location: 'Coimbatore District Convention Hall',
    descEn: 'Career and leadership development workshop for young members.',
    descTa: 'இளம் உறுப்பினர்களுக்கான வேலைவாய்ப்பு மற்றும் திறன் மேம்பாட்டுப் பயிலரங்கம்.'
  }
];

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-orange-100 text-orange-600 mb-1">
          <Calendar size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('events.title', 'Upcoming Events & Programs')}
        </h1>
        <p className="text-gray-500 text-sm">
          {isTa ? 'அமைப்பின் வரவிருக்கும் மாநாடுகள், முகாம்கள் மற்றும் நிகழ்ச்சிகள்.' : 'Stay updated with scheduled state and district-level events.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
        {SAMPLE_EVENTS.map((event) => (
          <div key={event.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
                  {event.date}
                </span>
                <span className="text-xs text-gray-400 font-medium">{event.time}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 leading-snug">
                  {isTa ? event.titleTa : event.titleEn}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {isTa ? event.descTa : event.descEn}
                </p>
              </div>

              <div className="flex items-start gap-2 text-xs text-gray-500 pt-3 border-t border-gray-50">
                <MapPin size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <Link
                to={`/events/${event.id}`}
                className="w-full py-2.5 rounded-xl border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>{isTa ? 'நிகழ்ச்சி விவரங்கள்' : 'View Event Details'}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
