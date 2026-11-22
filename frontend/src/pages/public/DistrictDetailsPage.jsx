import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Users, ExternalLink, ArrowLeft, Mail, Calendar } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';
import api from '../../services/api';

export default function DistrictDetailsPage() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';

  const [district, setDistrict] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/districts/${slug}`)
      .then((res) => {
        if (res.data?.data) {
          setDistrict(res.data.data);
        } else {
          fallback();
        }
      })
      .catch(() => {
        fallback();
      })
      .finally(() => setLoading(false));

    function fallback() {
      const found = TN_DISTRICTS.find((d) => d.slug === slug || String(d.id) === slug);
      if (found) {
        setDistrict({
          ...found,
          officeAddress: `${found.nameEn} District Office, Collectorate Complex, Tamil Nadu`,
          contactNumber: '+91 94440 00000',
          whatsappGroup: { inviteLink: `https://chat.whatsapp.com/invite-${found.slug}` },
          administrators: [
            { nameEn: 'District President', nameTa: 'மாவட்ட தலைவர்', role: 'President', phone: '+91 98400 11111' },
            { nameEn: 'District Secretary', nameTa: 'மாவட்ட செயலாளர்', role: 'Secretary', phone: '+91 98400 22222' },
            { nameEn: 'District Treasurer', nameTa: 'மாவட்ட பொருளாளர்', role: 'Treasurer', phone: '+91 98400 33333' }
          ]
        });
      }
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-gray-500">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p>Loading district details...</p>
      </div>
    );
  }

  if (!district) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
        <p className="text-gray-500 text-lg">District not found.</p>
        <Link to="/districts" className="inline-flex items-center gap-2 text-orange-600 font-semibold hover:underline">
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>
    );
  }

  const name = isTa ? district.nameTa : district.nameEn;
  const altName = isTa ? district.nameEn : district.nameTa;

  return (
    <div className="max-w-5xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <Link to="/districts" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {isTa ? 'அனைத்து மாவட்டங்கள்' : 'All Districts'}
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 xs:p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
            District / மாவட்டம்
          </span>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">{name}</h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">{altName}</p>
        </div>

        <div className="flex flex-col xs:flex-row flex-wrap gap-2.5 sm:gap-3 w-full md:w-auto">
          {district.whatsappGroup?.inviteLink && (
            <a
              href={district.whatsappGroup.inviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow transition text-xs sm:text-sm w-full xs:w-auto"
            >
              <ExternalLink size={16} />
              <span>WhatsApp Group</span>
            </a>
          )}
          <Link
            to="/membership"
            className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-xl shadow transition text-xs sm:text-sm w-full xs:w-auto"
          >
            <span>{isTa ? 'உறுப்பினராக இணையுங்கள்' : 'Join as Member'}</span>
          </Link>
        </div>
      </div>

      {/* District Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">
            {isTa ? 'அலுவலக முகவரி & தொடர்பு' : 'Office & Contact'}
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-orange-600 flex-shrink-0 mt-0.5" />
              <span>{district.officeAddress || `${district.nameEn} District Office, Tamil Nadu`}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-orange-600 flex-shrink-0" />
              <span>{district.contactNumber || '+91 94440 00000'}</span>
            </div>
          </div>
        </div>

        {/* Leadership List */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-bold text-gray-800 border-b pb-2">
            {isTa ? 'மாவட்ட நிர்வாகிகள் & பதவியாளர்கள்' : 'District Leadership & Office Bearers'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(district.administrators || [
              { nameEn: 'District President', nameTa: 'மாவட்ட தலைவர்', role: 'President' },
              { nameEn: 'District Secretary', nameTa: 'மாவட்ட செயலாளர்', role: 'Secretary' },
              { nameEn: 'District Treasurer', nameTa: 'மாவட்ட பொருளாளர்', role: 'Treasurer' },
              { nameEn: 'District Coordinator', nameTa: 'மாவட்ட ஒருங்கிணைப்பாளர்', role: 'Coordinator' },
            ]).map((admin, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                <p className="font-semibold text-gray-800">{isTa ? admin.nameTa : admin.nameEn}</p>
                <p className="text-xs text-orange-600 font-medium">{admin.role}</p>
                {admin.phone && <p className="text-xs text-gray-400 mt-1">{admin.phone}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
