import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import {
  Camera,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  FileEdit,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_CATEGORIES = ['Events', 'Inauguration', 'Meeting', 'Youth', 'Training', 'General'];

export default function ManageGalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Upload modal
  const [uploadOpen, setUploadOpen] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploadForm, setUploadForm] = useState({
    titleEn: '',
    titleTa: '',
    description: '',
    category: 'Events',
    album: '',
    isPublished: true,
  });
  const [uploading, setUploading] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (typeFilter !== 'ALL') params.mediaType = typeFilter;
      const res = await api.get('/admin/gallery', { params });
      setItems(res.data?.data || []);
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, typeFilter]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const handleFilesSelected = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 10) {
      toast.error('You can upload up to 10 files at once.');
      return;
    }
    const oversized = selected.find((f) => f.size > 50 * 1024 * 1024);
    if (oversized) {
      toast.error(`File ${oversized.name} exceeds 50MB limit.`);
      return;
    }
    setFiles(selected);
    setPreviews(
      selected.map((f) => ({
        name: f.name,
        isVideo: f.type.startsWith('video/'),
        url: URL.createObjectURL(f),
      }))
    );
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one image or video file.');
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      fd.append('titleEn', uploadForm.titleEn.trim());
      fd.append('titleTa', uploadForm.titleTa.trim());
      fd.append('description', uploadForm.description.trim());
      fd.append('category', uploadForm.category.trim() || 'General');
      fd.append('album', uploadForm.album.trim());
      fd.append('isPublished', String(uploadForm.isPublished));

      await api.post('/admin/gallery', fd);
      toast.success(`Uploaded ${files.length} file(s) to cloud storage!`);
      setUploadOpen(false);
      setFiles([]);
      setPreviews([]);
      setUploadForm({
        titleEn: '',
        titleTa: '',
        description: '',
        category: 'Events',
        album: '',
        isPublished: true,
      });
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/gallery/${editTarget.id}`, {
        titleEn: editTarget.titleEn || '',
        titleTa: editTarget.titleTa || '',
        description: editTarget.description || '',
        category: editTarget.category || 'General',
        album: editTarget.album || '',
        isPublished: editTarget.isPublished,
      });
      toast.success('Gallery item updated!');
      setEditTarget(null);
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleTogglePublish = async (item) => {
    try {
      await api.patch(`/admin/gallery/${item.id}/publish`);
      toast.success(item.isPublished ? 'Unpublished from gallery' : 'Published to gallery!');
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle publish status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/gallery/${deleteTarget.id}`);
      toast.success('Media deleted');
      setDeleteTarget(null);
      fetchGallery();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera size={22} className="text-[#16A34A]" />
            <span>Manage Photo & Video Gallery</span>
          </h2>
          <p className="text-xs text-gray-500">
            Upload multiple photos & videos to Cloudinary — live synced to tnmssa.com/gallery
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          style={{ backgroundColor: '#16A34A' }}
        >
          <Plus size={16} />
          <span>Upload Photos / Videos</span>
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
            placeholder="Search by title, category, or album..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
          />
        </div>

        <div className="flex items-center gap-2">
          {[
            { key: 'ALL', label: 'All Media' },
            { key: 'IMAGE', label: 'Photos' },
            { key: 'VIDEO', label: 'Videos' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setTypeFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                typeFilter === f.key
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 border border-gray-100">
          Loading gallery media...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 border border-gray-100">
          No media items yet. Click "Upload Photos / Videos" to add gallery items.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 bg-gray-100">
                {item.mediaType === 'VIDEO' ? (
                  <video src={item.mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <img
                    src={item.mediaUrl}
                    alt={item.titleEn || 'Gallery item'}
                    className="w-full h-full object-cover"
                  />
                )}
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-white flex items-center gap-1">
                  {item.mediaType === 'VIDEO' ? <Video size={11} /> : <ImageIcon size={11} />}
                  <span>{item.mediaType}</span>
                </span>
                <span
                  className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    item.isPublished ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {item.isPublished ? <CheckCircle2 size={10} /> : <FileEdit size={10} />}
                  <span>{item.isPublished ? 'LIVE' : 'HIDDEN'}</span>
                </span>
              </div>

              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded uppercase">
                      {item.category || 'General'}
                    </span>
                    {item.album && (
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {item.album}
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm mt-1.5 truncate">
                    {item.titleEn || 'Untitled Media'}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleTogglePublish(item)}
                    className="text-xs font-semibold text-[#123DAA] hover:underline"
                  >
                    {item.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditTarget({ ...item })}
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500 bg-white px-4 py-3 rounded-xl border border-gray-100">
          <span>
            Page {page} of {pagination.totalPages} ({pagination.total} items)
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

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Upload Gallery Photos / Videos</h3>
              <button type="button" onClick={() => setUploadOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 text-center">
                <Upload size={26} className="text-[#16A34A]" />
                <span className="text-sm font-semibold text-gray-700">
                  Click to select multiple images or videos
                </span>
                <span className="text-xs text-gray-400">
                  JPG, PNG, WebP, GIF, MP4, WebM, MOV (Max 50MB per file, up to 10 files)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {previews.map((p, idx) => (
                    <div key={idx} className="relative h-24 rounded-xl overflow-hidden border bg-gray-100">
                      {p.isVideo ? (
                        <video src={p.url} className="w-full h-full object-cover" />
                      ) : (
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title (English)</label>
                  <input
                    type="text"
                    value={uploadForm.titleEn}
                    onChange={(e) => setUploadForm({ ...uploadForm, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title (Tamil)</label>
                  <input
                    type="text"
                    value={uploadForm.titleTa}
                    onChange={(e) => setUploadForm({ ...uploadForm, titleTa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    {DEFAULT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Album Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. State Conclave 2026"
                    value={uploadForm.album}
                    onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={uploadForm.isPublished}
                  onChange={(e) => setUploadForm({ ...uploadForm, isPublished: e.target.checked })}
                />
                <span>Publish immediately to public Gallery page</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                onClick={() => setUploadOpen(false)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-gray-600 bg-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-sm disabled:opacity-50"
                style={{ backgroundColor: '#16A34A' }}
              >
                {uploading ? 'Uploading to Cloud...' : 'Upload Media'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Metadata Modal */}
      {editTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Edit Gallery Details</h3>
              <button type="button" onClick={() => setEditTarget(null)}>
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Title (English)"
              value={editTarget.titleEn || ''}
              onChange={(e) => setEditTarget({ ...editTarget, titleEn: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <input
              type="text"
              placeholder="Title (Tamil)"
              value={editTarget.titleTa || ''}
              onChange={(e) => setEditTarget({ ...editTarget, titleTa: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <input
              type="text"
              placeholder="Category"
              value={editTarget.category || ''}
              onChange={(e) => setEditTarget({ ...editTarget, category: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <input
              type="text"
              placeholder="Album"
              value={editTarget.album || ''}
              onChange={(e) => setEditTarget({ ...editTarget, album: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <textarea
              rows={2}
              placeholder="Description"
              value={editTarget.description || ''}
              onChange={(e) => setEditTarget({ ...editTarget, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditTarget(null)} className="px-4 py-2 rounded-xl border text-xs font-semibold">
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 rounded-xl bg-[#123DAA] text-white text-xs font-bold"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete Media Item?</h3>
            <p className="text-xs text-gray-500">
              Permanently delete <strong>{deleteTarget.titleEn || 'this media item'}</strong> from cloud storage and database?
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
