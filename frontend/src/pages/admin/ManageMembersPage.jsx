import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import api, { getAccessToken } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { clearCachedData } from '../../utils/clientCache';
import {
  Users,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  QrCode,
  Upload,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PAYMENT_BADGE = {
  PENDING: 'bg-gray-100 text-gray-700',
  PAYMENT_SUBMITTED: 'bg-amber-100 text-amber-800',
  VERIFIED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

const MEMBER_BADGE = {
  PENDING: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

const ApplicationRow = memo(function ApplicationRow({
  app,
  onOpenDetail,
  onDownloadPdf,
  onVerifyPayment,
  onApproveMembership,
  onRequestDelete,
}) {
  const pay = app.payments?.[0] || {};
  return (
    <tr className="hover:bg-gray-50">
      <td className="py-3 px-4 font-mono font-bold text-[#09246B]">
        {app.serialNumber}
      </td>
      <td className="py-3 px-4">
        <p className="font-bold text-gray-900">{app.applicantName}</p>
        <p className="text-[11px] text-gray-400">{app.shopName}</p>
      </td>
      <td className="py-3 px-4">
        <p className="font-mono font-semibold text-gray-800">{app.phone}</p>
        <p className="text-[11px] text-gray-400">{app.email}</p>
      </td>
      <td className="py-3 px-4 font-mono">
        {new Date(app.registrationDate || app.createdAt).toLocaleDateString('en-IN')}
      </td>
      <td className="py-3 px-4">
        <p className="font-mono font-bold text-gray-800">{pay.upiTransactionId || '—'}</p>
        <p className="text-[11px] text-gray-500">₹{pay.amount || 1200}</p>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            PAYMENT_BADGE[pay.paymentStatus] || PAYMENT_BADGE.PENDING
          }`}
        >
          {pay.paymentStatus === 'PAYMENT_SUBMITTED' ? 'PENDING VERIFICATION' : pay.paymentStatus}
        </span>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            MEMBER_BADGE[app.membershipStatus] || MEMBER_BADGE.PENDING
          }`}
        >
          {app.membershipStatus}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            onClick={() => onOpenDetail(app.id)}
            title="View Full Application"
            className="p-1.5 rounded-lg text-[#123DAA] hover:bg-blue-50"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => onDownloadPdf(app.serialNumber, 'application')}
            title="Download Application PDF"
            className="p-1.5 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <FileText size={15} />
          </button>
          {pay.paymentStatus !== 'VERIFIED' && (
            <button
              onClick={() => onVerifyPayment(app.id, 'VERIFIED')}
              className="px-2 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold"
            >
              Verify Pay
            </button>
          )}
          {pay.paymentStatus === 'VERIFIED' && app.membershipStatus !== 'APPROVED' && (
            <button
              onClick={() => onApproveMembership(app.id, 'APPROVED')}
              className="px-2 py-1 rounded-lg bg-[#09246B] text-white text-[11px] font-semibold"
            >
              Approve
            </button>
          )}
          <button
            onClick={() => onRequestDelete(app)}
            title="Delete Application"
            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
});

export default function ManageMembersPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newApplications: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0,
    approvedMembers: 0,
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [memberFilter, setMemberFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rejectModal, setRejectModal] = useState(null); // { id, type: 'payment'|'membership', serialNumber }
  const [rejectionReason, setRejectionReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processing, setProcessing] = useState(false);

  // QR & Fee Settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    annualFee: 1200,
    halfYearlyFee: 600,
    upiId: 'tnmssa@upi',
    helpline1: '+91 99447 73668',
    helpline2: '+91 97879 75782',
    address: '',
    termsText: '',
    qrCodeUrl: '/tmssa-qr.png',
  });
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const qrObjectUrlRef = useRef(null);

  const revokeQrBlob = useCallback(() => {
    if (qrObjectUrlRef.current) {
      URL.revokeObjectURL(qrObjectUrlRef.current);
      qrObjectUrlRef.current = null;
    }
  }, []);

  useEffect(() => revokeQrBlob, [revokeQrBlob]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sortOrder,
        ...(debouncedSearch.trim() && { search: debouncedSearch.trim() }),
        ...(paymentFilter !== 'ALL' && { paymentStatus: paymentFilter }),
        ...(memberFilter !== 'ALL' && { membershipStatus: memberFilter }),
      };

      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/membership/stats'),
        api.get('/admin/membership/applications', { params }),
      ]);

      if (statsRes.data?.stats) setStats(statsRes.data.stats);
      setApplications(listRes.data?.data || []);
      if (listRes.data?.pagination) setPagination(listRes.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load membership data');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, paymentFilter, memberFilter, sortOrder]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openDetail = useCallback(async (id) => {
    setLoadingDetail(true);
    try {
      const res = await api.get(`/admin/membership/applications/${id}`);
      setSelectedDetail(res.data?.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load application details');
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleDownloadPdf = useCallback(async (serialNumber, type) => {
    try {
      const token = getAccessToken();
      const base = import.meta.env.VITE_API_BASE_URL || '/api';
      const res = await fetch(`${base}/membership/${serialNumber}/pdf/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${serialNumber}-${type === 'receipt' ? 'Receipt' : 'Application'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Could not download PDF');
    }
  }, []);

  const handlePaymentAction = useCallback(async (id, paymentStatus, reason = '') => {
    setProcessing(true);
    try {
      await api.patch(`/admin/membership/applications/${id}/payment`, {
        paymentStatus,
        rejectionReason: reason,
      });
      toast.success(`Payment marked as ${paymentStatus}`);
      setRejectModal(null);
      setRejectionReason('');
      fetchAll();
      if (selectedDetail?.id === id) openDetail(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment update failed');
    } finally {
      setProcessing(false);
    }
  }, [fetchAll, selectedDetail?.id, openDetail]);

  const handleMembershipAction = useCallback(async (id, membershipStatus, reason = '') => {
    setProcessing(true);
    try {
      await api.patch(`/admin/membership/applications/${id}/status`, {
        membershipStatus,
        rejectionReason: reason,
      });
      toast.success(`Membership ${membershipStatus}`);
      setRejectModal(null);
      setRejectionReason('');
      fetchAll();
      if (selectedDetail?.id === id) openDetail(id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed');
    } finally {
      setProcessing(false);
    }
  }, [fetchAll, selectedDetail?.id, openDetail]);

  const handleDeleteApplication = useCallback(async () => {
    if (!deleteTarget) return;
    setProcessing(true);
    try {
      await api.delete(`/admin/membership/applications/${deleteTarget.id}`);
      toast.success(`Deleted ${deleteTarget.serialNumber}`);
      clearCachedData('membership_config');
      if (selectedDetail?.id === deleteTarget.id) setSelectedDetail(null);
      setDeleteTarget(null);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setProcessing(false);
    }
  }, [deleteTarget, selectedDetail?.id, fetchAll]);

  const statCards = useMemo(() => [
    { label: 'Total Applications', value: stats.totalMembers, icon: Users, color: '#123DAA', bg: '#EEF2FF' },
    { label: 'New Pending Apps', value: stats.newApplications, icon: UserPlus, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Pending Payments', value: stats.pendingPayments, icon: Clock, color: '#F07818', bg: '#FFF7ED' },
    { label: 'Verified Payments', value: stats.verifiedPayments, icon: ShieldCheck, color: '#16A34A', bg: '#DCFCE7' },
    { label: 'Rejected Payments', value: stats.rejectedPayments, icon: XCircle, color: '#DC2626', bg: '#FEE2E2' },
    { label: 'Approved Members', value: stats.approvedMembers, icon: CheckCircle2, color: '#0284C7', bg: '#E0F2FE' },
  ], [stats]);

  const openSettingsModal = useCallback(async () => {
    setSettingsOpen(true);
    try {
      const res = await api.get('/admin/membership/settings');
      if (res.data?.data) {
        revokeQrBlob();
        setSettingsForm(res.data.data);
        setQrPreview(res.data.data.qrCodeUrl || '/tmssa-qr.png');
        setQrFile(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load QR & fee settings');
    }
  }, [revokeQrBlob]);

  const handleSaveSettings = useCallback(async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const fd = new FormData();
      fd.append('annualFee', String(settingsForm.annualFee));
      fd.append('halfYearlyFee', String(settingsForm.halfYearlyFee));
      fd.append('upiId', settingsForm.upiId || '');
      fd.append('helpline1', settingsForm.helpline1 || '');
      fd.append('helpline2', settingsForm.helpline2 || '');
      fd.append('address', settingsForm.address || '');
      fd.append('termsText', settingsForm.termsText || '');
      if (qrFile) {
        fd.append('image', qrFile);
      } else if (settingsForm.qrCodeUrl) {
        fd.append('qrCodeUrl', settingsForm.qrCodeUrl);
      }

      await api.put('/admin/membership/settings', fd);
      clearCachedData('membership_config');
      toast.success('QR Code & Fee settings updated! Live on /membership');
      revokeQrBlob();
      setSettingsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }, [settingsForm, qrFile, revokeQrBlob]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Membership & Payment Verification</h2>
          <p className="text-xs text-gray-500">
            Verify UPI transactions, inspect uploaded photos/screenshots, approve memberships, and configure QR & fees
          </p>
        </div>

        <button
          onClick={openSettingsModal}
          className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          style={{ backgroundColor: '#09246B' }}
        >
          <QrCode size={16} className="text-[#F07818]" />
          <span>QR Code & Fee Settings</span>
        </button>
      </div>

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl" style={{ backgroundColor: c.bg, color: c.color }}>
                  <Icon size={16} />
                </div>
                <span className="text-xl font-extrabold text-gray-900">{c.value}</span>
              </div>
              <p className="text-[11px] font-semibold text-gray-500">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search Serial No, Name, Mobile, Email, or UTR..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
          >
            <option value="ALL">All Payments</option>
            <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={memberFilter}
            onChange={(e) => {
              setMemberFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white font-semibold"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600 min-w-[920px]">
            <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Serial No</th>
                <th className="py-3 px-4">Applicant</th>
                <th className="py-3 px-4">Mobile / Email</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">UPI Txn ID & Amt</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Membership</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    Loading membership applications...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-400">
                    No membership applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <ApplicationRow
                    key={app.id}
                    app={app}
                    onOpenDetail={openDetail}
                    onDownloadPdf={handleDownloadPdf}
                    onVerifyPayment={handlePaymentAction}
                    onApproveMembership={handleMembershipAction}
                    onRequestDelete={setDeleteTarget}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {pagination.totalPages} ({pagination.total} applications)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Application Detail Modal */}
      {(selectedDetail || loadingDetail) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#09246B] text-white">
              <div>
                <h3 className="font-bold text-base">
                  {selectedDetail ? `Application ${selectedDetail.serialNumber}` : 'Loading...'}
                </h3>
                <p className="text-xs text-blue-200">Complete Membership & Payment Verification</p>
              </div>
              <button
                onClick={() => setSelectedDetail(null)}
                className="p-1.5 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading details...</div>
            ) : (
              selectedDetail && (
                <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto text-xs sm:text-sm">
                  {/* Top Info + Photo */}
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    {selectedDetail.documents?.find((d) => d.docType === 'PHOTO')?.fileUrl && (
                      <img
                        src={optimizeImageUrl(selectedDetail.documents.find((d) => d.docType === 'PHOTO').fileUrl, { width: 400 })}
                        alt={selectedDetail.applicantName}
                        loading="lazy"
                        decoding="async"
                        className="w-28 h-36 rounded-2xl object-cover border-2 border-[#09246B] flex-shrink-0"
                      />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-1 text-xs">
                      <p><strong>Applicant:</strong> {selectedDetail.applicantName}</p>
                      <p><strong>Age / DOB:</strong> {selectedDetail.age} Yrs ({new Date(selectedDetail.dob).toLocaleDateString('en-IN')})</p>
                      <p><strong>Father's Name:</strong> {selectedDetail.fatherName}</p>
                      <p><strong>Blood Group:</strong> {selectedDetail.bloodGroup}</p>
                      <p><strong>Qualification:</strong> {selectedDetail.educationalQualification}</p>
                      <p><strong>Aadhaar (Masked):</strong> {selectedDetail.aadhaarMasked || 'Not Provided'}</p>
                      <p><strong>Experience:</strong> {selectedDetail.experience}</p>
                      <p><strong>Area RTO No:</strong> {selectedDetail.areaRtoNo}</p>
                      <p><strong>Shop Name:</strong> {selectedDetail.shopName}</p>
                      <p><strong>District:</strong> {selectedDetail.district?.nameEn || '—'}</p>
                      <p className="sm:col-span-2"><strong>Shop Address:</strong> {selectedDetail.shopAddress}</p>
                      <p><strong>Mobile:</strong> {selectedDetail.phone}</p>
                      <p><strong>Alt Mobile:</strong> {selectedDetail.alternateMobile || '—'}</p>
                      <p><strong>Email:</strong> {selectedDetail.email}</p>
                      <p><strong>Insta/FB:</strong> {selectedDetail.socialId || '—'}</p>
                      <p><strong>Refer Name:</strong> {selectedDetail.referName || '—'}</p>
                    </div>
                  </div>

                  {/* Signature & Payment Screenshot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
                      <p className="text-xs font-bold text-gray-700">Payment Evidence</p>
                      {selectedDetail.payments?.[0] && (
                        <div className="space-y-1 text-xs">
                          <p><strong>Plan:</strong> {selectedDetail.payments[0].planType}</p>
                          <p><strong>Amount:</strong> ₹{selectedDetail.payments[0].amount}</p>
                          <p><strong>UTR / Txn ID:</strong> <span className="font-mono font-bold">{selectedDetail.payments[0].upiTransactionId}</span></p>
                          <p><strong>Status:</strong> {selectedDetail.payments[0].paymentStatus}</p>
                          {selectedDetail.payments[0].rejectionReason && (
                            <p className="text-red-600"><strong>Reason:</strong> {selectedDetail.payments[0].rejectionReason}</p>
                          )}
                        </div>
                      )}
                      {selectedDetail.payments?.[0]?.paymentScreenshotUrl && (
                        <a
                          href={selectedDetail.payments[0].paymentScreenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-2"
                        >
                          <img
                            src={optimizeImageUrl(selectedDetail.payments[0].paymentScreenshotUrl, { width: 800 })}
                            alt="Payment Screenshot"
                            loading="lazy"
                            decoding="async"
                            className="max-h-40 rounded-xl border object-contain"
                          />
                        </a>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 space-y-2">
                      <p className="text-xs font-bold text-gray-700">Signature & PDFs</p>
                      {selectedDetail.documents?.find((d) => d.docType === 'SIGNATURE')?.fileUrl ? (
                        <img
                          src={optimizeImageUrl(selectedDetail.documents.find((d) => d.docType === 'SIGNATURE').fileUrl, { width: 500 })}
                          alt="Signature"
                          loading="lazy"
                          decoding="async"
                          className="h-16 bg-white border rounded-xl p-2 object-contain"
                        />
                      ) : (
                        <p className="text-xs text-gray-400">No signature uploaded</p>
                      )}

                      <div className="flex flex-col gap-2 pt-2">
                        <button
                          onClick={() => handleDownloadPdf(selectedDetail.serialNumber, 'application')}
                          className="px-3 py-2 rounded-xl bg-[#09246B] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <FileText size={14} />
                          <span>Download Application PDF</span>
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(selectedDetail.serialNumber, 'receipt')}
                          className="px-3 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Download size={14} />
                          <span>Download Payment Receipt PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Admin Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={processing}
                        onClick={() => handlePaymentAction(selectedDetail.id, 'VERIFIED')}
                        className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold"
                      >
                        Verify Payment
                      </button>
                      <button
                        disabled={processing}
                        onClick={() =>
                          setRejectModal({
                            id: selectedDetail.id,
                            type: 'payment',
                            serialNumber: selectedDetail.serialNumber,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
                      >
                        Reject Payment
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        disabled={processing || selectedDetail.payments?.[0]?.paymentStatus !== 'VERIFIED'}
                        onClick={() => handleMembershipAction(selectedDetail.id, 'APPROVED')}
                        className="px-3.5 py-2 rounded-xl bg-[#09246B] text-white text-xs font-bold disabled:opacity-40"
                        title="Verify payment first before approving"
                      >
                        Approve Membership
                      </button>
                      <button
                        disabled={processing}
                        onClick={() =>
                          setRejectModal({
                            id: selectedDetail.id,
                            type: 'membership',
                            serialNumber: selectedDetail.serialNumber,
                          })
                        }
                        className="px-3.5 py-2 rounded-xl border border-red-300 text-red-700 text-xs font-bold"
                      >
                        Reject Application
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              Reject {rejectModal.type === 'payment' ? 'Payment' : 'Membership'} ({rejectModal.serialNumber})
            </h3>
            <textarea
              rows={3}
              required
              placeholder="Enter rejection reason (required)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={processing || !rejectionReason.trim()}
                onClick={() =>
                  rejectModal.type === 'payment'
                    ? handlePaymentAction(rejectModal.id, 'REJECTED', rejectionReason)
                    : handleMembershipAction(rejectModal.id, 'REJECTED', rejectionReason)
                }
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold disabled:opacity-50"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete Membership Application?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to permanently delete{' '}
              <strong>{deleteTarget.serialNumber}</strong> ({deleteTarget.applicantName})? This will also remove its payment and document records.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={processing}
                onClick={handleDeleteApplication}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {processing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & Fee Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-[#09246B] text-white">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-[#F07818]" />
                <h3 className="font-bold text-base">Membership QR Code & Fee Settings</h3>
              </div>
              <button type="button" onClick={() => setSettingsOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
                <img
                  src={qrPreview || '/tmssa-qr.png'}
                  alt="Association UPI QR"
                  className="w-28 h-28 rounded-xl object-contain bg-white border p-1.5"
                />
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs font-bold text-gray-800">Official Association UPI QR Code</p>
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-[#09246B]/40 bg-white cursor-pointer hover:bg-gray-50 text-xs font-semibold text-[#09246B]">
                    <Upload size={14} />
                    <span>{qrFile ? qrFile.name : 'Upload New QR Code Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        revokeQrBlob();
                        const blobUrl = URL.createObjectURL(f);
                        qrObjectUrlRef.current = blobUrl;
                        setQrFile(f);
                        setQrPreview(blobUrl);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Annual Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.annualFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, annualFee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Half-Yearly Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={settingsForm.halfYearlyFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, halfYearlyFee: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official UPI ID</label>
                <input
                  type="text"
                  value={settingsForm.upiId || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Helpline 1</label>
                  <input
                    type="text"
                    value={settingsForm.helpline1 || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, helpline1: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Helpline 2</label>
                  <input
                    type="text"
                    value={settingsForm.helpline2 || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, helpline2: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  rows={2}
                  value={settingsForm.termsText || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, termsText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border text-xs"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm disabled:opacity-50"
                style={{ backgroundColor: '#16A34A' }}
              >
                {savingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
