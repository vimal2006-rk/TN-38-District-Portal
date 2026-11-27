import { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ExternalLink, Search } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';

const WhatsappGroupCard = memo(function WhatsappGroupCard({ d, isTa }) {
  const name = isTa ? d.nameTa : d.nameEn;
  const link = d.whatsappLink || `https://chat.whatsapp.com/invite-${d.slug}`;

  return (
    <div
      className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
      style={{ borderColor: '#E2E8F0' }}
    >
      <div>
        <div className="flex items-center justify-between text-xs mb-1" style={{ color: '#64748B' }}>
          <span className="font-mono flex items-center gap-1.5">
            #{d.id < 10 ? `0${d.id}` : d.id}
            {d.whatsappLink && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ring-2 ring-green-200"
                style={{ backgroundColor: '#16A34A' }}
                title={isTa ? 'WhatsApp இணைப்பு சேர்க்கப்பட்டது' : 'WhatsApp Link Integrated'}
              />
            )}
          </span>
          <span
            className="px-2 py-0.5 rounded-full font-bold text-[10px]"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            OFFICIAL
          </span>
        </div>
        <h3 className="text-base font-bold" style={{ color: '#172554' }}>{name}</h3>
        <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{d.nameEn} District Group</p>
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full py-2.5 px-3 rounded-xl text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm bg-[#16A34A] hover:bg-[#15803d]"
      >
        <ExternalLink size={14} />
        <span>{isTa ? 'குழுவில் இணையவும்' : 'Join WhatsApp Group'}</span>
      </a>
    </div>
  );
});

export default function WhatsAppGroupsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [search, setSearch] = useState('');

  const handleSearchChange = useCallback((e) => setSearch(e.target.value), []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return TN_DISTRICTS;
    return TN_DISTRICTS.filter((d) =>
      d.nameEn.toLowerCase().includes(q) || d.nameTa.includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen py-10" style={{ backgroundColor: '#F4F7FC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div
            className="inline-flex p-3 rounded-2xl shadow-sm mb-1"
            style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}
          >
            <MessageCircle size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: '#172554' }}>
            {t('whatsapp.title', 'District WhatsApp Groups')}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed" style={{ color: '#64748B' }}>
            {isTa
              ? 'உங்கள் மாவட்டத்தின் அதிகாரப்பூர்வ வாட்ஸ்அப் குழுவில் இணைந்து உடனுக்குடன் செய்திகளைப் பெறுங்கள்.'
              : 'Join your district official WhatsApp community group for verified updates, B2B inventory, and association announcements.'}
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder={isTa ? 'மாவட்டம் தேடுங்கள்...' : 'Filter districts...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white text-[#172554] text-sm shadow-sm focus:outline-none focus:border-[#16A34A] focus:ring-[3px] focus:ring-[#16A34A]/15 transition-all"
            />
          </div>
        </div>

        {/* Counter */}
        <div className="flex items-center justify-between text-xs pb-2 border-b" style={{ borderColor: '#E2E8F0', color: '#64748B' }}>
          <span>{isTa ? `மொத்த குழுக்கள்: ${filtered.length} / 38` : `Showing ${filtered.length} of 38 District Groups`}</span>
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 phone:grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map((d) => (
            <WhatsappGroupCard key={d.id} d={d} isTa={isTa} />
          ))}
        </div>

      </div>
    </div>
  );
}
