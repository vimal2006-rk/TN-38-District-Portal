import { useState } from 'react';
import { Camera, Plus } from 'lucide-react';

export default function ManageGalleryPage() {
  const [items] = useState([
    { id: 1, title: 'State Assembly 2026', category: 'Events', type: 'IMAGE' },
    { id: 2, title: 'Madurai Office Opening', category: 'Inauguration', type: 'IMAGE' },
    { id: 3, title: 'Coimbatore Youth Meet', category: 'Youth', type: 'IMAGE' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Media Gallery</h2>
          <p className="text-xs text-gray-400">Upload and curate images and videos across districts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Media Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">{i.title}</td>
                <td className="py-3 px-4">{i.category}</td>
                <td className="py-3 px-4 font-mono text-orange-600">{i.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
