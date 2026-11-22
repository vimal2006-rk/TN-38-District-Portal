import { useState } from 'react';
import { ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageStateAdminsPage() {
  const [admins, setAdmins] = useState([
    { id: 1, name: 'State President', designation: 'State President', phone: '+91 94440 10001' },
    { id: 2, name: 'State General Secretary', designation: 'General Secretary', phone: '+91 94440 10002' },
    { id: 3, name: 'State Treasurer', designation: 'Treasurer', phone: '+91 94440 10003' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage State Administrators</h2>
          <p className="text-xs text-gray-400">Add, edit, or configure state-level organizational leadership</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-gray-600">
          <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Contact Phone</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {admins.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-gray-400">{a.id}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{a.name}</td>
                <td className="py-3 px-4 text-orange-600 font-medium">{a.designation}</td>
                <td className="py-3 px-4 font-mono">{a.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
