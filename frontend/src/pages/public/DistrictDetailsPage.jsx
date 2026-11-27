import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, ExternalLink, ArrowLeft, ShieldCheck } from 'lucide-react';
import { findLocalDistrict } from '../../utils/districtsData';
import { getCachedData, setCachedData } from '../../utils/clientCache';
import { useAutoRefresh } from '../../hooks/useAutoRefresh';
import api from '../../services/api';

const DEFAULT_ADMINS = [
  { nameEn: 'District President', nameTa: 'மாவட்ட தலைவர்', role: 'President' },
  { nameEn: 'District Secretary', nameTa: 'மாவட்ட செயலாளர்', role: 'Secretary' },
  { nameEn: 'District Treasurer', nameTa: 'மாவட்ட பொருளாளர்', role: 'Treasurer' },
  { nameEn: 'District Coordinator', nameTa: 'மாவட்ட ஒருங்கிணைப்பாளர்', role: 'Coordinator' },
];

const buildLocalFallback = (slug) => {
  const found = findLocalDistrict(slug);
  if (!found) return null;
  return {
    ...found,
    officeAddress: `${found.nameEn} District Office, Tamil Nadu`,
    contactNumber: '+91 94440 00000',
    whatsappGroup: { inviteLink: found.whatsappLink || `https://chat.whatsapp.com/invite-${found.slug}` },
    administrators: [
      { nameEn: 'District President', nameTa: 'மாவட்ட தலைவர்', role: 'President', phone: '+91 98400 11111' },
      { nameEn: 'District Secretary', nameTa: 'மாவட்ட செயலாளர்', role: 'Secretary', phone: '+91 98400 22222' },
      { nameEn: 'District Treasurer', nameTa: 'மாவட்ட பொருளாளர்', role: 'Treasurer', phone: '+91 98400 33333' }
    ],
  };
};

export default function DistrictDetailsPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const cached = useMemo(() => getCachedData(`district_${slug}`), [slug]);
  const [district, setDistrict] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  const fetchDistrict = useCallback((isActive = () => true) => {
    api.get(`/districts/${slug}`, { skipDedupe: true })
      .then((res) => {
        if (!isActive()) return;
        if (res.data?.data) {
          setDistrict(res.data.data);
          setCachedData(`district_${slug}`, res.data.data);
        } else {
          setDistrict(buildLocalFallback(slug));
        }
      })
      .catch(() => {
        if (isActive() && !getCachedData(`district_${slug}`)) {
          setDistrict(buildLocalFallback(slug));
        }
      })
      .finally(() => {
        if (isActive()) setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    let active = true;
    if (!cached) setLoading(true);
    fetchDistrict(() => active);
    return () => {
      active = false;
    };
  }, [cached, fetchDistrict]);

  useAutoRefresh([`district_${slug}`, 'districts', 'bearers'], fetchDistrict);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center" style={{ backgroundColor: '#F4F7FC' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#123DAA] mx-auto mb-4"></div>
        <p style={{ color: '#123DAA' }} className="font-semibold text-sm">Loading district details...</p>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 text-center space-y-4" style={{ backgroundColor: '#F4F7FC' }}>
        <p className="text-lg font-semibold" style={{ color: '#64748B' }}>District not found.</p>
        <Link to="/districts" className="inline-flex items-center gap-2 font-semibold hover:underline" style={{ color: '#123DAA' }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    );
  }

  const name = isTa ? district.nameTa : district.nameEn;
  const altName = isTa ? district.nameEn : district.nameTa;

  return (
    <div className="min-h-screen py-8 sm:py-12" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">

        {/* Back navigation */}
        <Link
          to="/districts"
          className="inline-flex items-center gap-2 text-sm font-medium hover:underline transition-colors"
          style={{ color: '#123DAA' }}
        >
          <ArrowLeft size={16} /> {isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}
        </Link>

        {/* Header Card */}
        <div
          className="bg-white rounded-2xl shadow-sm border p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div>
            <span
              className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block"
              style={{ backgroundColor: '#EEF2FF', color: '#123DAA' }}
            >
              District / மாவட்டம்
            </span>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold mt-2" style={{ color: '#172554' }}>
              {name}
            </h1>
            <p className="text-xs sm:text-sm mt-0.5 font-medium" style={{ color: '#64748B' }}>
              {altName}
            </p>
          </div>

          <div className="flex flex-col xs:flex-row flex-wrap gap-3 w-full md:w-auto">
            {district.whatsappGroup?.inviteLink && (
              <a
                href={district.whatsappGroup.inviteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition text-xs sm:text-sm w-full xs:w-auto bg-[#16A34A] hover:bg-[#15803d]"
              >
                <ExternalLink size={16} />
                <span>WhatsApp Group</span>
              </a>
            )}
            <Link
              to="/membership"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition text-xs sm:text-sm w-full xs:w-auto bg-[#F07818] hover:bg-[#d4660f]"
            >
              <span>{isTa ? 'உறுப்பினராக இணையுங்கள்' : 'Join as Member'}</span>
            </Link>
          </div>
        </div>

        {/* District Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-white p-6 rounded-2xl shadow-sm border space-y-4"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h2 className="text-base font-bold border-b pb-2" style={{ color: '#172554', borderColor: '#E2E8F0' }}>
              {isTa ? 'அலுவலக முகவரி & தொடர்பு' : 'Office & Contact'}
            </h2>
            <div className="space-y-3 text-sm" style={{ color: '#64748B' }}>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} style={{ color: '#123DAA' }} className="flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{district.officeAddress || `${district.nameEn} District Office, Tamil Nadu`}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} style={{ color: '#123DAA' }} className="flex-shrink-0" />
                <span className="text-gray-700">{district.contactNumber || '+91 94440 00000'}</span>
              </div>
            </div>
          </div>

          {/* Leadership List */}
          <div
            className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border space-y-4"
            style={{ borderColor: '#E2E8F0' }}
          >
            <h2 className="text-base font-bold border-b pb-2 flex items-center justify-between" style={{ color: '#172554', borderColor: '#E2E8F0' }}>
              <span>{isTa ? 'மாவட்ட நிர்வாகிகள் & பதவியாளர்கள்' : 'District Leadership & Office Bearers'}</span>
              <ShieldCheck size={18} style={{ color: '#123DAA' }} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(district.administrators || DEFAULT_ADMINS).map((admin, idx) => (
                <div
                  key={admin.id || idx}
                  className="p-3.5 rounded-xl border text-sm"
                  style={{ backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }}
                >
                  <p className="font-semibold text-gray-900">{isTa ? admin.nameTa : admin.nameEn}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#123DAA' }}>{admin.role}</p>
                  {admin.phone && <p className="text-xs text-gray-500 mt-1">{admin.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
