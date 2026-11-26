import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Shield, Lock, User, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/admin/auth/change-password', { oldPassword, newPassword });
      toast.success(res.data?.message || 'Password updated! Please sign in again.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await logout();
    } catch (err) {
      const errMsg =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to update password.';
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Account & Security Settings</h2>
        <p className="text-xs text-gray-500">Manage your authenticated session and security credentials</p>
      </div>

      {/* Profile Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-50 text-[#123DAA]">
            <User size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{user?.name || 'Administrator'}</h3>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <span
            className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#F07818' }}
          >
            {user?.role || 'ADMIN'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-green-600" />
            <span>JWT Access Token + HttpOnly Refresh Rotation Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} className="text-green-600" />
            <span>Account Status: Active</span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={18} className="text-[#123DAA]" />
          <h3 className="text-base font-bold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              New Password (min 8 chars, 1 uppercase, 1 number)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-sm disabled:opacity-60"
            style={{ backgroundColor: '#09246B' }}
          >
            {saving ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
