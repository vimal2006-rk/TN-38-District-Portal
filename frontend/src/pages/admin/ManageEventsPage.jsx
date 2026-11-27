import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { clearCachedData } from '../../utils/clientCache';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { convertImageToWebp } from '../../utils/imageCompressor';
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  CheckCircle2,
  FileEdit,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EMPTY_EVENT = {
  titleEn: '',
  titleTa: '',
  descriptionEn: '',
  descriptionTa: '',
  eventDate: new Date().toISOString().split('T')[0],
  eventTime: '10:00 AM',
  location: '',
  status: 'UPCOMING',
  isPublished: false,
  imageUrl: '',
};

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_EVENT);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
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

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 8 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await api.get('/admin/events', { params });
      setEvents(res.data?.data || []);
      if (res.data?.pagination) setPagination(res.data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const openCreateModal = useCallback(() => {
    revokePreviewBlob();
    setEditingId(null);
    setForm(EMPTY_EVENT);
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const openEditModal = useCallback((ev) => {
    revokePreviewBlob();
    setEditingId(ev.id);
    setForm({
      titleEn: ev.titleEn || '',
      titleTa: ev.titleTa || '',
      descriptionEn: ev.descriptionEn || '',
      descriptionTa: ev.descriptionTa || '',
      eventDate: ev.eventDate ? new Date(ev.eventDate).toISOString().split('T')[0] : '',
      eventTime: ev.eventTime || '',
      location: ev.location || '',
      status: ev.status || 'UPCOMING',
      isPublished: Boolean(ev.isPublished),
      imageUrl: ev.imageUrl || '',
    });
    setImageFile(null);
    setImagePreview(ev.imageUrl || '');
    setModalOpen(true);
  }, [revokePreviewBlob]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner image must be smaller than 10MB');
      return;
    }
    try {
      const webpFile = await convertImageToWebp(file, { maxDim: 1200, quality: 0.85 });
      revokePreviewBlob();
      const url = URL.createObjectURL(webpFile);
      previewBlobRef.current = url;
      setImageFile(webpFile);
      setImagePreview(url);
    } catch (err) {
      toast.error(err?.message || 'Could not convert banner image to WebP');
    }
  }, [revokePreviewBlob]);

  const handleSave = useCallback(async (publishOverride = null) => {
    if (!form.titleEn.trim() && !form.titleTa.trim()) {
      toast.error('Please enter an event title.');
      return;
    }
    if (!form.eventDate) {
      toast.error('Please select an event date.');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('titleEn', form.titleEn.trim() || form.titleTa.trim());
      fd.append('titleTa', form.titleTa.trim() || form.titleEn.trim());
      fd.append('descriptionEn', form.descriptionEn.trim());
      fd.append('descriptionTa', form.descriptionTa.trim());
      fd.append('eventDate', form.eventDate);
      fd.append('eventTime', form.eventTime.trim());
      fd.append('location', form.location.trim());
      fd.append('status', form.status);
      const isPub = publishOverride !== null ? publishOverride : form.isPublished;
      fd.append('isPublished', String(isPub));

      if (imageFile) {
        fd.append('image', imageFile);
      } else if (form.imageUrl) {
        fd.append('imageUrl', form.imageUrl);
      }

      if (editingId) {
        await api.put(`/admin/events/${editingId}`, fd);
        clearCachedData(`event_${editingId}`);
        toast.success('Event updated successfully!');
      } else {
        await api.post('/admin/events', fd);
        toast.success(isPub ? 'Event published!' : 'Event saved as draft!');
      }

      clearCachedData('events');
      revokePreviewBlob();
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  }, [form, imageFile, editingId, fetchEvents, revokePreviewBlob]);

  const handleTogglePublish = useCallback(async (ev) => {
    try {
      await api.patch(`/admin/events/${ev.id}/publish`);
      clearCachedData('events');
      clearCachedData(`event_${ev.id}`);
      toast.success(ev.isPublished ? 'Event unpublished' : 'Event published!');
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  }, [fetchEvents]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/admin/events/${deleteTarget.id}`);
      clearCachedData('events');
      clearCachedData(`event_${deleteTarget.id}`);
      toast.success('Event deleted');
      setDeleteTarget(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  }, [deleteTarget, fetchEvents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={22} className="text-[#F07818]" />
            <span>Manage Events & Programs</span>
          </h2>
          <p className="text-xs text-gray-500">
            Schedule upcoming or completed events — live synced to tnmssa.com/events
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm self-start sm:self-auto"
          style={{ backgroundColor: '#F07818' }}
        >
          <Plus size={16} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filters */}
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
            placeholder="Search event title or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#F07818]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'UPCOMING', label: 'Upcoming' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'published', label: 'Published' },
            { key: 'draft', label: 'Draft' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === f.key
                  ? 'bg-[#F07818] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-600 min-w-[720px]">
            <thead className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wider border-b">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-400">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-gray-400">
                    No events found. Click "Create Event" to add one.
                  </td>
                </tr>
              ) : (
                events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {ev.imageUrl ? (
                          <img
                            src={optimizeImageUrl(ev.imageUrl, { width: 160 })}
                            alt={ev.titleEn}
                            loading="lazy"
                            decoding="async"
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F07818] flex items-center justify-center flex-shrink-0">
                            <Calendar size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-xs">{ev.titleEn}</p>
                          <p className="text-[11px] text-gray-400 truncate max-w-xs">{ev.titleTa}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-mono font-semibold text-gray-800">
                        {new Date(ev.eventDate).toLocaleDateString()}
                      </div>
                      {ev.eventTime && (
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} />
                          <span>{ev.eventTime}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="flex items-center gap-1 text-gray-600 max-w-[180px] truncate">
                        <MapPin size={13} className="text-orange-500 flex-shrink-0" />
                        <span className="truncate">{ev.location || 'TBA'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.status === 'COMPLETED'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-50 text-[#123DAA]'
                          }`}
                        >
                          {ev.status || 'UPCOMING'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ev.isPublished
                              ? 'bg-green-100 text-green-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ev.isPublished ? <CheckCircle2 size={10} /> : <FileEdit size={10} />}
                          <span>{ev.isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleTogglePublish(ev)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            ev.isPublished
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {ev.isPublished ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => openEditModal(ev)}
                          className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(ev)}
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

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {page} of {pagination.totalPages} ({pagination.total} events)
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title (English) *</label>
                  <input
                    type="text"
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Title (Tamil)</label>
                  <input
                    type="text"
                    value={form.titleTa}
                    onChange={(e) => setForm({ ...form, titleTa: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:00 AM - 05:00 PM"
                    value={form.eventTime}
                    onChange={(e) => setForm({ ...form, eventTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai Trade Centre"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Event Banner Image</label>
                  <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 text-xs font-medium text-gray-600">
                    <Upload size={15} className="text-[#F07818]" />
                    <span>{imageFile ? imageFile.name : 'Choose banner image...'}</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {imagePreview && (
                <div className="rounded-2xl overflow-hidden border border-gray-200 h-44 bg-gray-50">
                  <img src={imagePreview} alt="Event Banner Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (English)</label>
                <textarea
                  rows={3}
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Tamil)</label>
                <textarea
                  rows={3}
                  value={form.descriptionTa}
                  onChange={(e) => setForm({ ...form, descriptionTa: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs font-bold"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => handleSave(true)}
                className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-sm"
                style={{ backgroundColor: '#16A34A' }}
              >
                {saving ? 'Saving...' : 'Publish Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Delete Event?</h3>
            <p className="text-xs text-gray-500">
              Permanently delete <strong>{deleteTarget.titleEn}</strong>?
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
