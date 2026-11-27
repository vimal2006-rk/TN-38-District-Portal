import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { getCachedData, setCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import SafeImage from '../../components/common/SafeImage';

const EventCard = memo(function EventCard({ event, isTa }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
      {event.imageUrl && (
        <SafeImage
          src={optimizeImageUrl(event.imageUrl, { width: 640 })}
          alt={isTa ? event.titleTa : event.titleEn}
          loading="lazy"
          decoding="async"
          className="h-44 w-full object-cover"
          fallback={null}
        />
      )}

      <div className="p-6 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
            {new Date(event.eventDate).toLocaleDateString()}
          </span>
          <span className="text-xs text-gray-400 font-medium">
            {event.eventTime || event.status || 'UPCOMING'}
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold text-gray-900 leading-snug">
            {isTa ? event.titleTa || event.titleEn : event.titleEn}
          </h3>
          {(event.descriptionEn || event.descriptionTa) && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
              {isTa ? event.descriptionTa || event.descriptionEn : event.descriptionEn}
            </p>
          )}
        </div>

        {event.location && (
          <div className="flex items-start gap-2 text-xs text-gray-500 pt-3 border-t border-gray-50">
            <MapPin size={14} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <span>{event.location}</span>
          </div>
        )}
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
  );
});

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const initialCached = getCachedData('events');
  const [events, setEvents] = useState(initialCached || []);
  const [loading, setLoading] = useState(!initialCached);
  const [filter, setFilter] = useState('ALL');

  const fetchEvents = useCallback((isActive = () => true) => {
    api
      .get('/events', { skipDedupe: true })
      .then((res) => {
        if (!isActive()) return;
        const data = res.data?.data || [];
        setEvents(data);
        setCachedData('events', data);
      })
      .catch(() => {
        if (isActive() && !getCachedData('events')) setEvents([]);
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });
  }, []);

  useEffect(() => {
    let active = true;
    fetchEvents(() => active);
    return () => {
      active = false;
    };
  }, [fetchEvents]);

  useAutoRefresh('events', fetchEvents);

  const tabs = useMemo(
    () => [
      { key: 'ALL', label: isTa ? 'அனைத்தும்' : 'All Events' },
      { key: 'UPCOMING', label: isTa ? 'வரவிருக்கும்' : 'Upcoming' },
      { key: 'COMPLETED', label: isTa ? 'நிறைவடைந்தவை' : 'Completed' },
    ],
    [isTa]
  );

  const filtered = useMemo(() => {
    if (filter === 'ALL') return events;
    return events.filter((ev) => (ev.status || 'UPCOMING') === filter);
  }, [events, filter]);

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
          {isTa
            ? 'அமைப்பின் வரவிருக்கும் மாநாடுகள், முகாம்கள் மற்றும் நிகழ்ச்சிகள்.'
            : 'Stay updated with scheduled state and district-level events.'}
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
                filter === tab.key
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-2xl border border-gray-100 h-72 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 text-gray-500 text-sm">
          {isTa ? 'நிகழ்ச்சிகள் எதுவும் இல்லை.' : 'No events found in this category.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 laptop:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} isTa={isTa} />
          ))}
        </div>
      )}
    </div>
  );
}
