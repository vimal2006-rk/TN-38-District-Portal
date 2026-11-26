import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';

export default function EventDetailPage() {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get(`/events/${id}`)
      .then((res) => {
        if (active) setEvent(res.data?.data || null);
      })
      .catch(() => {
        if (active) setEvent(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-gray-400">
        {isTa ? 'ஏற்றுகிறது...' : 'Loading event details...'}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-gray-500">{isTa ? 'நிகழ்ச்சி கிடைக்கவில்லை.' : 'Event not found.'}</p>
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold">
          <ArrowLeft size={16} /> {isTa ? 'நிகழ்வுகள் பக்கத்திற்குத் திரும்பு' : 'Back to Events'}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {isTa ? 'நிகழ்வுகள் பக்கத்திற்குத் திரும்பு' : 'Back to Events'}
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm space-y-6">
        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold inline-block">
          {event.status || 'UPCOMING'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
          {isTa ? event.titleTa || event.titleEn : event.titleEn}
        </h1>

        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={isTa ? event.titleTa : event.titleEn}
            className="w-full max-h-[420px] object-cover rounded-2xl"
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-gray-50 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} className="text-orange-600" />
            <span>{new Date(event.eventDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-orange-600" />
            <span>{event.eventTime || 'TBA'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-orange-600" />
            <span>{event.location || 'TBA'}</span>
          </div>
        </div>

        {(event.descriptionEn || event.descriptionTa) && (
          <div className="prose max-w-none text-gray-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {isTa ? event.descriptionTa || event.descriptionEn : event.descriptionEn}
          </div>
        )}
      </div>
    </div>
  );
}
