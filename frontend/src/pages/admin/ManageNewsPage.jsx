import { useState } from 'react';
import { Newspaper, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageNewsPage() {
  const [news, setNews] = useState([
    { id: 1, title: 'State Annual General Meeting Announced for All 38 Districts', date: '2026-11-20', published: true },
    { id: 2, title: 'New District Office Inauguration in Madurai', date: '2026-11-15', published: true },
    { id: 3, title: 'Youth Leadership Training Camp in Coimbatore', date: '2026-11-10', published: true },
  ]);

  const togglePublish = (id) => {
    setNews(news.map(n => n.id === id ? { ...n, published: !n.published } : n));
    toast.success('Publish status toggled');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage News & Announcements</h2>
          <p className="text-xs text-gray-400">Publish, update, or archive organizational news items</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {news.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">{item.title}</td>
                <td className="py-3 px-4 font-mono">{item.date}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => togglePublish(item.id)}
                    className="text-xs text-orange-600 hover:underline font-semibold"
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
