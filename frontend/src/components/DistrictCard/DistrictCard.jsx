import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, ExternalLink } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';

export default function DistrictCard({ district }) {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const name = isTamil ? district.nameTa : district.nameEn;

  // Always look up real WhatsApp link from local data (API data doesn't carry it)
  const localData = TN_DISTRICTS.find(
    (ld) => ld.slug === district.slug || String(ld.id) === String(district.id)
  );
  // hasRealLink = ONLY true for 25 districts that have whatsappLink in TN_DISTRICTS
  const realWhatsappLink = localData?.whatsappLink || null;
  const hasRealLink = !!realWhatsappLink;
  // Button uses real link if available, otherwise API/fallback link
  const whatsappLink =
    realWhatsappLink ||
    district.whatsappGroup?.inviteLink ||
    `https://chat.whatsapp.com/invite-${district.slug}`;

  return (
    <div
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border group flex flex-col justify-between"
      style={{ borderColor: '#E2E8F0' }}
    >
      {/* Top Royal Blue accent strip */}
      <div
        className="h-1.5 w-full"
        style={{ background: 'linear-gradient(90deg, #123DAA 0%, #2463D4 100%)' }}
      />

      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3
            className="text-lg font-bold transition-colors mb-0.5 flex items-center gap-2"
            style={{ color: '#172554' }}
          >
            {name}
            {hasRealLink && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-green-200 flex-shrink-0"
                style={{ backgroundColor: '#16A34A' }}
                title="WhatsApp link integrated"
              />
            )}
          </h3>
          {isTamil && (
            <p className="text-xs mb-3 font-medium" style={{ color: '#64748B' }}>
              {district.nameEn}
            </p>
          )}
          {!isTamil && district.nameTa && (
            <p className="text-xs mb-3 font-medium" style={{ color: '#64748B' }}>
              {district.nameTa}
            </p>
          )}

          {/* Member count */}
          {district._count?.members !== undefined && (
            <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: '#64748B' }}>
              <Users size={14} style={{ color: '#123DAA' }} />
              <span>{district._count.members} Members</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary View Details Button: Royal Blue */}
          <Link
            to={`/districts/${district.slug}`}
            className="text-center text-sm font-semibold rounded-lg py-2 transition-all shadow-sm flex items-center justify-center"
            style={{ backgroundColor: '#123DAA', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#09246B')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#123DAA')}
          >
            View Details
          </Link>

          {/* Secondary Join WhatsApp Button: Green */}
          <a
            href={whatsappLink || `https://chat.whatsapp.com/invite-${district.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 text-sm font-semibold rounded-lg py-2 transition-all shadow-sm"
            style={{ backgroundColor: hasRealLink ? '#16A34A' : '#94a3b8', color: '#FFFFFF' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hasRealLink ? '#15803d' : '#64748b')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = hasRealLink ? '#16A34A' : '#94a3b8')}
          >
            <ExternalLink size={14} />
            <span>Join WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
