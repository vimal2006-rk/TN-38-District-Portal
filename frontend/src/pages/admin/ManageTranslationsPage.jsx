import { useState } from 'react';
import { Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageTranslationsPage() {
  const [translations] = useState([
    { key: 'home.heroTitle', en: 'Tamil Nadu 38 District Organization Portal', ta: 'தமிழ்நாடு 38 மாவட்ட அமைப்பு போர்டல்' },
    { key: 'districts.title', en: 'District Directory', ta: 'மாவட்ட அடைவு' },
    { key: 'membership.title', en: 'Membership Registration', ta: 'உறுப்பினர் பதிவு' },
    { key: 'whatsapp.title', en: 'District WhatsApp Groups', ta: 'வாட்ஸ்அப் குழுக்கள்' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Tamil & English Translations</h2>
          <p className="text-xs text-gray-400">Manage bilingual strings and content overrides across portal</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">Translation Key</th>
              <th className="py-3 px-4">English String</th>
              <th className="py-3 px-4">Tamil String</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {translations.map((t, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-gray-400">{t.key}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{t.en}</td>
                <td className="py-3 px-4 text-orange-700 font-medium">{t.ta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
