import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { TN_DISTRICTS } from '../../utils/districtsData';
import { clearCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { convertImageToWebp } from '../../utils/imageCompressor';
import SafeImage from '../../components/common/SafeImage';
import ResponsiveSelect from '../../components/common/ResponsiveSelect';
import { Award, Plus, Search, Edit2, Trash2, Upload, X, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EMPTY_FORM = {
  districtId: '1',
  nameEn: '',
  nameTa: '',
  roleEn: 'District President',
  roleTa: 'மாவட்ட தலைவர்',
  phone: '',
  sortOrder: 0,
  photoUrl: '',
};

export default function ManageOfficeBearersPage() {
  const [bearers, setBearers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [districtFilter, setDistrictFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const previewBlobRef = useRef(null);

  const revokePreviewBlob = useCallback(() => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
  }, []);

  useEffect(() => revokePreviewBlob, [revokePreviewBlob]);

  const fetchBearers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (districtFilter !== 'all') params.districtId = districtFilter;
      const res = await api.get('/admin/administration', { params });
      setBearers(res.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load administration members');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, districtFilter]);

  useEffect(() => {
    fetchBearers();
  }, [fetchBearers]);

  const openCreateModal = useCallback(() => {
    revokePreviewBlob();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPhotoFile(null);
    setPhotoPreview('');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const openEditModal = useCallback((b) => {
    revokePreviewBlob();
    setEditingId(b.id);
    setForm({
      districtId: String(b.districtId || b.district?.id || '1'),
      nameEn: b.nameEn || '',
      nameTa: b.nameTa || '',
      roleEn: b.roleEn || '',
      roleTa: b.roleTa || '',
      phone: b.phone || '',
      sortOrder: b.sortOrder || 0,
      photoUrl: b.photoUrl || '',
    });
    setPhotoFile(null);
    setPhotoPreview(b.photoUrl || '');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const webpFile = await convertImageToWebp(file, { maxDim: 600, quality: 0.86 });
      revokePreviewBlob();
      const url = URL.createObjectURL(webpFile);
      previewBlobRef.current = url;
      setPhotoFile(webpFile);
      setPhotoPreview(url);
    } catch (err) {
      toast.error(err?.message || 'Could not convert photo to WebP');
    }
  }, [revokePreviewBlob]);

  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    if (!form.nameEn.trim() && !form.nameTa.trim()) {
      toast.error('Please enter member name.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('districtId', form.districtId);
      fd.append('nameEn', form.nameEn.trim() || form.nameTa.trim());
      fd.append('nameTa', form.nameTa.trim() || form.nameEn.trim());
      fd.append('roleEn', form.roleEn.trim() || form.roleTa.trim());
      fd.append('roleTa', form.roleTa.trim() || form.roleEn.trim());
      fd.append('phone', form.phone.trim());
      fd.append('sortOrder', String(form.sortOrder || 0));

      if (photoFile) {
        fd.append('image', photoFile);
      } else if (form.photoUrl) {
        fd.append('photoUrl', form.photoUrl);
      }

      if (editingId) {
        await api.put(`/admin/administration/${editingId}`, fd);
        toast.success('Administration member updated!');
      } else {
        await api.post('/admin/administration', fd);
        toast.success('Administration member added!');
      }

      clearCachedData('bearers');
      clearCachedData('districts');
      revokePreviewBlob();
      setModalOpen(false);
      fetchBearers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  }, [form, photoFile, editingId, fetchBearers, revokePreviewBlob]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/administration/${deleteTarget.id}`);
      clearCachedData('bearers');
      clearCachedData('districts');
      toast.success('Administration member deleted');
      setDeleteTarget(null);
      fetchBearers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  }, [deleteTarget, fetchBearers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award size={22} className="text-[#123DAA]" />
            <span>Manage Administration & Office Bearers</span>
          </h2>
          <p className="text-xs text-gray-500">
            Add, edit, or remove district leaders — live synced to tnmssa.com/office-bearers
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          style={{ backgroundColor: '#123DAA' }}
        >
          <Plus size={16} />
          <span>Add Office Bearer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, designation, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
          />
        </div>

        <ResponsiveSelect
          value={districtFilter}
          onChange={(val) => setDistrictFilter(val)}
          options={[
            { value: 'all', label: 'All 38 Districts', searchText: 'all 38 districts' },
            ...TN_DISTRICTS.map((d) => ({
              value: String(d.id),
              label: d.nameEn,
              subLabel: d.nameTa,
              searchText: `${d.nameEn} ${d.nameTa} ${d.slug}`,
            })),
          ]}
          title="Filter by District"
          searchPlaceholder="Search district..."
          accent="blue"
          className="w-full sm:w-52 px-3.5 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm bg-white"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[640px]">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-400">
                    Loading administration members...
                  </td>
                </tr>
              ) : bearers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-400">
                    No administration members yet. Click "Add Office Bearer" to add one.
                  </td>
                </tr>
              ) : (
                bearers.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={optimizeImageUrl(b.photoUrl, { width: 160 })}
                          alt={b.nameEn}
                          width={40}
                          height={40}
                          loading="lazy"
                          decoding="async"
                          className="w-10 h-10 rounded-full object-cover border flex-shrink-0"
                          fallback={
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#123DAA] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {(b.nameEn || 'A')[0]}
                            </div>
                          }
                        />
                        <div>
                          <p className="font-bold text-gray-900">{b.nameEn}</p>
                          <p className="text-[11px] text-gray-400">{b.nameTa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {b.district?.nameEn || `District #${b.districtId}`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
                        {b.roleEn}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {b.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {b.phone}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-8"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Administration Member' : 'Add Administration Member'}
              </h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">District *</label>
                  <ResponsiveSelect
                    value={String(form.districtId || '')}
                    onChange={(val) => setForm({ ...form, districtId: String(val) })}
                    options={TN_DISTRICTS.map((d) => ({
                      value: String(d.id),
                      label: `${d.nameEn} (${d.nameTa})`,
                      searchText: `${d.nameEn} ${d.nameTa} ${d.slug}`,
                    }))}
                    title="Select District"
                    searchPlaceholder="Search district..."
                    accent="blue"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98400 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name (Tamil)</label>
                  <input
                    type="text"
                    value={form.nameTa}
                    onChange={(e) => setForm({ ...form, nameTa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    value={form.roleEn}
                    onChange={(e) => setForm({ ...form, roleEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Designation (Tamil)</label>
                  <input
                    type="text"
                    value={form.roleTa}
                    onChange={(e) => setForm({ ...form, roleTa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Profile Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  {photoPreview && (
                    <SafeImage
                      src={photoPreview.startsWith('blob:') ? photoPreview : optimizeImageUrl(photoPreview, { width: 160 })}
                      alt="Preview"
                      className="w-14 h-14 rounded-full object-cover border flex-shrink-0"
                      fallback={
                        <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(form.nameEn || 'A')[0]}
                        </div>
                      }
                    />
                  )}
                  <label className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 text-xs font-medium text-gray-600">
                    <Upload size={15} className="text-[#123DAA]" />
                    <span>{photoFile ? photoFile.name : 'Choose photo...'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600 bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm disabled:opacity-50"
                style={{ backgroundColor: '#123DAA' }}
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete Member?</h3>
            <p className="text-xs text-gray-500">
              Remove <strong>{deleteTarget.nameEn}</strong> from Administration?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl border text-xs font-semibold">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
