import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, UserPlus, Calendar, MessageCircle, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';
import { TN_DISTRICTS } from '../../utils/districtsData';

export default function DashboardPage() {
  const [requests, setRequests] = useState([
    { id: 101, name: 'K. Rajendran', mobile: '98401 23456', district: 'Madurai', status: 'PENDING', date: '2026-11-22' },
    { id: 102, name: 'S. Priya', mobile: '98402 34567', district: 'Chennai', status: 'PENDING', date: '2026-11-22' },
    { id: 103, name: 'M. Vignesh', mobile: '98403 45678', district: 'Coimbatore', status: 'APPROVED', date: '2026-11-21' },
    { id: 104, name: 'T. Kavitha', mobile: '98404 56789', district: 'Salem', status: 'PENDING', date: '2026-11-21' },
  ]);

  const handleAction = (id, newStatus) => {
    setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Districts</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">38</h3>
            <span className="text-xs text-green-600 font-medium mt-1 inline-block">100% Configured</span>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <MapPin size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Members</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">10,845</h3>
            <span className="text-xs text-green-600 font-medium mt-1 inline-block">+142 this week</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Apps</p>
            <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
              {requests.filter(r => r.status === 'PENDING').length}
            </h3>
            <span className="text-xs text-amber-600 font-medium mt-1 inline-block">Action Required</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <UserPlus size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Groups</p>
            <h3 className="text-2xl font-extrabold text-green-600 mt-1">38</h3>
            <span className="text-xs text-green-600 font-medium mt-1 inline-block">All Active</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <MessageCircle size={24} />
          </div>
        </div>
      </div>

      {/* Pending Membership Applications */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-800">Recent Membership Applications</h2>
            <p className="text-xs text-gray-400">Review, verify, and approve district registrations</p>
          </div>
          <Link to="/admin/members" className="text-xs font-semibold text-orange-600 hover:underline">
            View All &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[560px]">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-semibold text-gray-800">{r.name}</td>
                  <td className="py-3 px-4">{r.mobile}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                      {r.district}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-400">{r.date}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleAction(r.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(r.id, 'REJECTED')}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Reject
                        </button>
                      </>
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
