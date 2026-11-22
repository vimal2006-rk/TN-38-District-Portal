import { useState } from 'react';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ManageMembersPage() {
  const [members, setMembers] = useState([
    { id: 1, name: 'S. Ramanathan', mobile: '98401 11111', district: 'Chennai', category: 'General', status: 'APPROVED', date: '2026-11-20' },
    { id: 2, name: 'K. Meenakshi', mobile: '98402 22222', district: 'Madurai', category: 'Senior', status: 'PENDING', date: '2026-11-21' },
    { id: 3, name: 'A. Dinesh', mobile: '98403 33333', district: 'Coimbatore', category: 'Student', status: 'PENDING', date: '2026-11-22' },
    { id: 4, name: 'M. Sangeetha', mobile: '98404 44444', district: 'Salem', category: 'General', status: 'REJECTED', date: '2026-11-19' },
  ]);

  const updateStatus = (id, status) => {
    setMembers(members.map(m => m.id === id ? { ...m, status } : m));
    toast.success(`Member status updated to ${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Members & Applications</h2>
          <p className="text-xs text-gray-400">Review, verify, approve, or reject district member applications</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 min-w-[560px]">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-800">{m.name}</td>
                  <td className="py-3 px-4 font-mono">{m.mobile}</td>
                  <td className="py-3 px-4">{m.district}</td>
                  <td className="py-3 px-4">{m.category}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        m.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : m.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {m.status !== 'APPROVED' && (
                      <button
                        onClick={() => updateStatus(m.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {m.status !== 'REJECTED' && (
                      <button
                        onClick={() => updateStatus(m.id, 'REJECTED')}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
