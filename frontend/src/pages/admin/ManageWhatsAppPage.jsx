import { useState } from 'react';
import { TN_DISTRICTS } from '../../utils/districtsData';
import { MessageCircle, ExternalLink, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageWhatsAppPage() {
  const [districts, setDistricts] = useState(
    TN_DISTRICTS.map(d => ({
      ...d,
      inviteLink: d.whatsappLink || `https://chat.whatsapp.com/invite-${d.slug}`,
      inviteLinks: d.whatsappLinks || (d.whatsappLink ? [{ name: `${d.nameEn} Group`, url: d.whatsappLink }] : []),
    }))
  );
  const [editing, setEditing] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setDistricts(districts.map(d => d.id === editing.id ? editing : d));
    setEditing(null);
    toast.success('WhatsApp link updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Manage District WhatsApp Group Links</h2>
        <p className="text-xs text-gray-400">Update official invite links for all 38 districts</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 min-w-[500px]">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">WhatsApp Invite URL</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {districts.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-gray-400">{d.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{d.nameEn} ({d.nameTa})</td>
                  <td className="py-3 px-4 font-mono text-blue-600 max-w-xs">
                    {d.inviteLinks.length > 1 ? (
                      <div className="space-y-1">
                        {d.inviteLinks.map((grp) => (
                          <a key={grp.url} href={grp.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 truncate">
                            <span className="text-green-700 font-semibold flex-shrink-0">{grp.name}:</span>
                            <span className="truncate">{grp.url}</span>
                            <ExternalLink size={12} className="flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <a href={d.inviteLink} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 truncate">
                        <span className="truncate">{d.inviteLink}</span>
                        <ExternalLink size={12} className="flex-shrink-0" />
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditing(d)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                    >
                      <Edit2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Edit WhatsApp Link: {editing.nameEn}</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">WhatsApp Group Invite URL</label>
                <input
                  type="url"
                  required
                  value={editing.inviteLink}
                  onChange={(e) => setEditing({ ...editing, inviteLink: e.target.value })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
