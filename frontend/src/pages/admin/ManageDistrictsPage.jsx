import { useState } from 'react';
import { TN_DISTRICTS } from '../../utils/districtsData';
import { Search, Edit2, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageDistrictsPage() {
  const [districts, setDistricts] = useState(TN_DISTRICTS);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);

  const filtered = districts.filter(d =>
    d.nameEn.toLowerCase().includes(search.toLowerCase()) ||
    d.nameTa.includes(search)
  );

  const handleSave = (e) => {
    e.preventDefault();
    setDistricts(districts.map(d => d.id === editing.id ? editing : d));
    setEditing(null);
    toast.success('District updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Tamil Nadu Districts (38)</h2>
          <p className="text-xs text-gray-400">View and update district administration settings</p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search districts..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 min-w-[540px]">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">District (English)</th>
                <th className="py-3 px-4">District (Tamil)</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-gray-400">{d.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{d.nameEn}</td>
                  <td className="py-3 px-4 text-gray-700">{d.nameTa}</td>
                  <td className="py-3 px-4 font-mono text-gray-400">{d.slug}</td>
                  <td className="py-3 px-4 font-medium text-orange-600">{d.members}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setEditing(d)}
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
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
            <h3 className="text-base font-bold text-gray-900">Edit District: {editing.nameEn}</h3>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Name (English)</label>
                <input
                  type="text"
                  value={editing.nameEn}
                  onChange={(e) => setEditing({ ...editing, nameEn: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="font-semibold block mb-1">Name (Tamil)</label>
                <input
                  type="text"
                  value={editing.nameTa}
                  onChange={(e) => setEditing({ ...editing, nameTa: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
