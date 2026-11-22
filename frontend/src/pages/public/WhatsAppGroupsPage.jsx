import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, ExternalLink, Search } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';

export default function WhatsAppGroupsPage() {
  const { t, i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return TN_DISTRICTS;
    return TN_DISTRICTS.filter((d) =>
      d.nameEn.toLowerCase().includes(q) || d.nameTa.includes(q)
    );
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-green-100 text-green-600 mb-1">
          <MessageCircle size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          {t('whatsapp.title', 'District WhatsApp Groups')}
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          {isTa
            ? 'உங்கள் மாவட்டத்தின் அதிகாரப்பூர்வ வாட்ஸ்அப் குழுவில் இணைந்து உடனுக்குடன் செய்திகளைப் பெறுங்கள்.'
            : 'Join your district official WhatsApp community group for verified updates and notifications.'}
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto mt-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isTa ? 'மாவட்டம் தேடுங்கள்...' : 'Filter districts...'}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 phablet:grid-cols-2 md:grid-cols-3 laptop:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((d) => {
          const name = isTa ? d.nameTa : d.nameEn;
          const link = `https://chat.whatsapp.com/invite-${d.slug}`;

          return (
            <div
              key={d.id}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>District #{d.id}</span>
                  <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-mono text-[10px]">
                    ACTIVE
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-800">{name}</h3>
                <p className="text-xs text-gray-400">{d.nameEn} District Group</p>
              </div>

              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink size={14} />
                <span>{isTa ? 'குழுவில் இணையவும்' : 'Join WhatsApp Group'}</span>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
