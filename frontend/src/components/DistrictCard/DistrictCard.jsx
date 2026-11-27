import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { findLocalDistrict } from '../../utils/districtsData';

function DistrictCard({ district }) {
  const { i18n } = useTranslation();
  const isTamil = i18n.language === 'ta';
  const name = isTamil ? district.nameTa : district.nameEn;

  const { hasRealLink, whatsappLink } = useMemo(() => {
    const localData = findLocalDistrict(district);
    const realLink = localData?.whatsappLink || null;
    return {
      hasRealLink: Boolean(realLink),
      whatsappLink:
        realLink ||
        district.whatsappGroup?.inviteLink ||
        `https://chat.whatsapp.com/invite-${district.slug}`,
    };
  }, [district]);

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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Primary View Details Button: Royal Blue */}
          <Link
            to={`/districts/${district.slug}`}
            className="text-center text-sm font-semibold rounded-lg py-2 transition-all shadow-sm flex items-center justify-center bg-[#123DAA] hover:bg-[#09246B] text-white"
          >
            View Details
          </Link>

          {/* Secondary Join WhatsApp Button: Green */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1.5 text-sm font-semibold rounded-lg py-2 transition-all shadow-sm text-white ${
              hasRealLink ? 'bg-[#16A34A] hover:bg-[#15803d]' : 'bg-[#94a3b8] hover:bg-[#64748b]'
            }`}
          >
            <ExternalLink size={14} />
            <span>Join WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default memo(DistrictCard);
