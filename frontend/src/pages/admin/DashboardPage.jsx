import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Newspaper,
  CheckCircle2,
  Calendar,
  Clock,
  Image as ImageIcon,
  Video,
  Plus,
  Activity,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalNews: 0,
    publishedNews: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalGalleryPhotos: 0,
    totalGalleryVideos: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.stats) setStats(res.data.stats);
      if (res.data?.recentActivities) setActivities(res.data.recentActivities);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    {
      label: 'Total News',
      value: stats.totalNews,
      sub: `${stats.publishedNews} Published`,
      icon: Newspaper,
      color: '#123DAA',
      bg: '#EEF2FF',
      link: '/admin/news',
    },
    {
      label: 'Published News',
      value: stats.publishedNews,
      sub: 'Live on website',
      icon: CheckCircle2,
      color: '#16A34A',
      bg: '#DCFCE7',
      link: '/admin/news',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      sub: `${stats.upcomingEvents} Upcoming`,
      icon: Calendar,
      color: '#F07818',
      bg: '#FFF7ED',
      link: '/admin/events',
    },
    {
      label: 'Upcoming Events',
      value: stats.upcomingEvents,
      sub: 'Scheduled ahead',
      icon: Clock,
      color: '#D97706',
      bg: '#FEF3C7',
      link: '/admin/events',
    },
    {
      label: 'Gallery Photos',
      value: stats.totalGalleryPhotos,
      sub: 'Cloud-hosted images',
      icon: ImageIcon,
      color: '#0284C7',
      bg: '#E0F2FE',
      link: '/admin/gallery',
    },
    {
      label: 'Gallery Videos',
      value: stats.totalGalleryVideos,
      sub: 'Cloud-hosted videos',
      icon: Video,
      color: '#7C3AED',
      bg: '#F3E8FF',
      link: '/admin/gallery',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Centralized control for News, Events, and Gallery — changes sync live to tnmssa.com
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/news"
            className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#123DAA' }}
          >
            <Plus size={14} />
            <span>Add News</span>
          </Link>
          <Link
            to="/admin/events"
            className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#F07818' }}
          >
            <Plus size={14} />
            <span>Add Event</span>
          </Link>
          <Link
            to="/admin/gallery"
            className="px-3.5 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            style={{ backgroundColor: '#16A34A' }}
          >
            <Plus size={14} />
            <span>Upload Media</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.link}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                  {loading ? '—' : card.value}
                </h3>
                <span className="text-xs font-medium mt-1 inline-block" style={{ color: card.color }}>
                  {card.sub}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl" style={{ backgroundColor: card.bg, color: card.color }}>
                <Icon size={24} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Public Links + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#123DAA]" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Admin Activities</h3>
                <p className="text-xs text-gray-400">Audit log of logins and content updates</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading recent activities...</div>
            ) : activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No activity logs recorded yet. Create or update News, Events, or Gallery items to see logs here.
              </div>
            ) : (
              activities.map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-start justify-between gap-3 hover:bg-gray-50">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#123DAA]">
                        {log.action}
                      </span>
                      <span className="text-xs font-semibold text-gray-800 truncate">
                        {log.details || `${log.entityType} #${log.entityId || ''}`}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      By {log.user?.name || 'Admin'} ({log.user?.email || 'system'})
                    </p>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Website Sync Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h3 className="text-base font-bold text-gray-900">Live Public Pages</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Every published News, Event, and Gallery item is saved directly to PostgreSQL and synced immediately to these public pages:
          </p>
          <div className="space-y-2.5">
            <a
              href="/news"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-800"
            >
              <span>Public News Page</span>
              <ExternalLink size={14} className="text-[#123DAA]" />
            </a>
            <a
              href="/events"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-800"
            >
              <span>Public Events Page</span>
              <ExternalLink size={14} className="text-[#F07818]" />
            </a>
            <a
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 text-xs font-semibold text-gray-800"
            >
              <span>Public Gallery Page</span>
              <ExternalLink size={14} className="text-[#16A34A]" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
