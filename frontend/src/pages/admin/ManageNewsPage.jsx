import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { clearCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import {
  Newspaper,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  FileEdit,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EMPTY_FORM = {
  titleEn: '',
  titleTa: '',
  contentEn: '',
  contentTa: '',
  publishedAt: new Date().toISOString().split('T')[0],
  isPublished: false,
  imageUrl: '',
};

export default function ManageNewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  // Preview & Delete modals
  const [previewItem, setPreviewItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const previewBlobRef = useRef(null);

  const revokePreviewBlob = useCallback(() => {
    if (previewBlobRef.current) {
      URL.revokeObjectURL(previewBlobRef.current);
      previewBlobRef.current = null;
    }
  }, []);

  useEffect(() => revokePreviewBlob, [revokePreviewBlob]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/admin/news', { params });
      setItems(res.data?.data || []);
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const openCreateModal = useCallback(() => {
    revokePreviewBlob();
    setEditingId(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const openEditModal = useCallback((item) => {
    revokePreviewBlob();
    setEditingId(item.id);
    setForm({
      titleEn: item.titleEn || '',
      titleTa: item.titleTa || '',
      contentEn: item.contentEn || '',
      contentTa: item.contentTa || '',
      publishedAt: item.publishedAt
        ? new Date(item.publishedAt).toISOString().split('T')[0]
        : new Date(item.createdAt).toISOString().split('T')[0],
      isPublished: Boolean(item.isPublished),
      imageUrl: item.imageUrl || '',
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || '');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }
    revokePreviewBlob();
    const url = URL.createObjectURL(file);
    previewBlobRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  }, [revokePreviewBlob]);

  const handleSave = useCallback(async (publishOverride = null) => {
    if (!form.titleEn.trim() && !form.titleTa.trim()) {
      toast.error('Please enter a news title.');
      return;
    }
    if (!form.contentEn.trim() && !form.contentTa.trim()) {
      toast.error('Please enter news content.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titleEn', form.titleEn.trim() || form.titleTa.trim());
      fd.append('titleTa', form.titleTa.trim() || form.titleEn.trim());
      fd.append('contentEn', form.contentEn.trim() || form.contentTa.trim());
      fd.append('contentTa', form.contentTa.trim() || form.contentEn.trim());
      if (form.publishedAt) fd.append('publishedAt', form.publishedAt);
      const isPub = publishOverride !== null ? publishOverride : form.isPublished;
      fd.append('isPublished', String(isPub));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (form.imageUrl) {
        fd.append('imageUrl', form.imageUrl);
      }

      if (editingId) {
        await api.put(`/admin/news/${editingId}`, fd);
        clearCachedData(`news_${editingId}`);
        toast.success('News updated successfully!');
      } else {
        await api.post('/admin/news', fd);
        toast.success(isPub ? 'News published!' : 'News saved as draft!');
      }

      clearCachedData('news');
      revokePreviewBlob();
      setModalOpen(false);
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save news');
    } finally {
      setSaving(false);
    }
  }, [form, imageFile, editingId, fetchNews, revokePreviewBlob]);

  const handleTogglePublish = useCallback(async (item) => {
    try {
      await api.patch(`/admin/news/${item.id}/publish`);
      clearCachedData('news');
      clearCachedData(`news_${item.id}`);
      toast.success(item.isPublished ? 'Moved to Draft' : 'Published to live website!');
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  }, [fetchNews]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/news/${deleteTarget.id}`);
      clearCachedData('news');
      clearCachedData(`news_${deleteTarget.id}`);
      toast.success('News deleted');
      setDeleteTarget(null);
      fetchNews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete news');
    }
  }, [deleteTarget, fetchNews]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper size={22} className="text-[#123DAA]" />
            <span>Manage News & Announcements</span>
          </h2>
          <p className="text-xs text-gray-500">
            Create, preview, publish, or archive news — live synced to tnmssa.com/news
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          style={{ backgroundColor: '#123DAA' }}
        >
          <Plus size={16} />
          <span>Create News</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search news title or content..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#123DAA]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'published', 'draft'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? 'bg-[#123DAA] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[680px]">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">News Item</th>
                <th className="py-3 px-4">Publish Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-gray-400">
                    Loading news...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-xs text-gray-400">
                    No news articles found. Click "Create News" to publish your first update.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <img
                            src={optimizeImageUrl(item.imageUrl, { width: 160 })}
                            alt={item.titleEn}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0">
                            <Newspaper size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{item.titleEn}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">{item.titleTa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">
                      {new Date(item.publishedAt || item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          item.isPublished
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {item.isPublished ? <CheckCircle2 size={12} /> : <FileEdit size={12} />}
                        <span>{item.isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewItem(item)}
                          title="Preview"
                          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleTogglePublish(item)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            item.isPublished
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {item.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit"
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          title="Delete"
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {pagination.totalPages} ({pagination.total} items)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit News Article' : 'Create News Article'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title (English) *</label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    placeholder="Enter English headline"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title (Tamil)</label>
                  <input
                    type="text"
                    value={form.titleTa}
                    onChange={(e) => setForm({ ...form, titleTa: e.target.value })}
                    placeholder="தமிழ் தலைப்பு"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Publication Date</label>
                  <input
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">News Image (Max 10MB)</label>
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 text-xs font-medium text-gray-600">
                    <Upload size={15} className="text-[#123DAA]" />
                    <span>{imageFile ? imageFile.name : 'Choose image file...'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-44 bg-gray-50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Content (English) *</label>
                <textarea
                  rows={4}
                  value={form.contentEn}
                  onChange={(e) => setForm({ ...form, contentEn: e.target.value })}
                  placeholder="Write full news details in English..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Content (Tamil)</label>
                <textarea
                  rows={4}
                  value={form.contentTa}
                  onChange={(e) => setForm({ ...form, contentTa: e.target.value })}
                  placeholder="தமிழில் செய்தி விவரங்களை உள்ளிடவும்..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() =>
                  setPreviewItem({
                    titleEn: form.titleEn || 'Preview Headline',
                    titleTa: form.titleTa || form.titleEn,
                    contentEn: form.contentEn,
                    contentTa: form.contentTa,
                    imageUrl: imagePreview,
                    publishedAt: form.publishedAt,
                  })
                }
                className="px-3.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-semibold flex items-center gap-1.5"
              >
                <Eye size={14} />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold hover:bg-gray-100 disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSave(true)}
                  className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: '#16A34A' }}
                >
                  {saving ? 'Saving...' : 'Publish Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase text-orange-600">News Preview</span>
              <button onClick={() => setPreviewItem(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            {previewItem.imageUrl && (
              <img src={previewItem.imageUrl} alt="News" className="w-full h-56 object-cover rounded-2xl" />
            )}
            <p className="text-xs text-gray-400 font-mono">
              {new Date(previewItem.publishedAt || previewItem.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <h3 className="text-xl font-extrabold text-gray-900">{previewItem.titleEn}</h3>
            {previewItem.titleTa && <p className="text-sm font-bold text-[#123DAA]">{previewItem.titleTa}</p>}
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{previewItem.contentEn}</p>
            {previewItem.contentTa && (
              <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed border-t pt-3">
                {previewItem.contentTa}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete News Article?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to permanently delete <strong>{deleteTarget.titleEn}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
