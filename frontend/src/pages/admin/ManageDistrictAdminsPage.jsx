import { useState } from 'react';
import { Users, Plus } from 'lucide-react';

export default function ManageDistrictAdminsPage() {
  const [admins] = useState([
    { id: 1, district: 'Madurai', name: 'K. Murugan', email: 'madurai.admin@tn38portal.com', status: 'ACTIVE' },
    { id: 2, district: 'Chennai', name: 'R. Senthil Kumar', email: 'chennai.admin@tn38portal.com', status: 'ACTIVE' },
    { id: 3, district: 'Coimbatore', name: 'S. Rajesh', email: 'cbe.admin@tn38portal.com', status: 'ACTIVE' },
    { id: 4, district: 'Salem', name: 'P. Karuppiah', email: 'salem.admin@tn38portal.com', status: 'ACTIVE' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage District Administrators</h2>
          <p className="text-xs text-gray-400">Assign and manage admin logins for each of the 38 districts</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">District</th>
              <th className="py-3 px-4">Administrator Name</th>
              <th className="py-3 px-4">Login Email</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-bold text-orange-600">{a.district}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{a.name}</td>
                <td className="py-3 px-4 font-mono">{a.email}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 font-bold text-[10px]">
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
