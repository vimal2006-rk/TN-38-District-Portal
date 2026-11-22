import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ExternalLink } from 'lucide-react';

export default function DistrictCard({ district }) {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const name = isTamil ? district.nameTa : district.nameEn;

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 group">
      {/* Top color strip */}
      <div className="h-2 bg-gradient-to-r from-orange-500 to-orange-600" />

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors mb-1">
          {name}
        </h3>
        {isTamil && (
          <p className="text-xs text-gray-400 mb-3">{district.nameEn}</p>
        )}
        {!isTamil && district.nameTa && (
          <p className="text-xs text-gray-400 mb-3">{district.nameTa}</p>
        )}

        {/* Member count */}
        {district._count?.members !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Users size={15} />
            <span>{district._count.members} Members</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            to={`/districts/${district.slug}`}
            className="text-center text-sm font-medium text-orange-600 border border-orange-600 rounded-lg py-1.5 hover:bg-orange-600 hover:text-white transition-colors"
          >
            View Details
          </Link>

          <a
            href={district.whatsappGroup?.inviteLink || `https://chat.whatsapp.com/invite-${district.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm font-medium bg-green-500 text-white rounded-lg py-1.5 hover:bg-green-600 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Join WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
