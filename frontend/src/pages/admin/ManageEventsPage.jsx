import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';

export default function ManageEventsPage() {
  const [events] = useState([
    { id: 1, title: 'State Level Leadership Conclave 2026', date: '2026-12-15', location: 'Chennai Trade Centre' },
    { id: 2, title: 'District Membership Drive & Awareness Camp', date: '2026-12-20', location: 'Madurai Central Hall' },
    { id: 3, title: 'Youth Skill Development Workshop', date: '2026-12-28', location: 'Coimbatore Hall' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Events & Programs</h2>
          <p className="text-xs text-gray-400">Schedule and configure state and district-level events</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">Event Title</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">{e.title}</td>
                <td className="py-3 px-4 font-mono text-orange-600">{e.date}</td>
                <td className="py-3 px-4">{e.location}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
