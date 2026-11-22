import { useState } from 'react';
import { Award, Plus } from 'lucide-react';

export default function ManageOfficeBearersPage() {
  const [bearers] = useState([
    { id: 1, district: 'Chennai', name: 'R. Senthil Kumar', role: 'District President', phone: '+91 98400 12345' },
    { id: 2, district: 'Chennai', name: 'M. Anand', role: 'District Secretary', phone: '+91 98400 23456' },
    { id: 3, district: 'Madurai', name: 'K. Murugan', role: 'District President', phone: '+91 98400 34567' },
    { id: 4, district: 'Coimbatore', name: 'S. Rajesh', role: 'District President', phone: '+91 98400 45678' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Office Bearers</h2>
          <p className="text-xs text-gray-400">Leadership details and appointment roster across districts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Role / Designation</th>
              <th className="py-3 px-4">Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bearers.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-gray-800">{b.district}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">{b.name}</td>
                <td className="py-3 px-4 text-orange-600 font-medium">{b.role}</td>
                <td className="py-3 px-4 font-mono">{b.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
