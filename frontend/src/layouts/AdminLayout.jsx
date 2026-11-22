import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  Users,
  UserCheck,
  Award,
  Newspaper,
  Calendar,
  Image,
  MessageCircle,
  Globe,
  LogOut,
  Home,
  Menu,
  X
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Districts', path: '/admin/districts', icon: MapPin },
  { label: 'Members', path: '/admin/members', icon: Users },
  { label: 'State Admins', path: '/admin/state-admins', icon: UserCheck },
  { label: 'District Admins', path: '/admin/district-admins', icon: Users },
  { label: 'Office Bearers', path: '/admin/office-bearers-admin', icon: Award },
  { label: 'News & Updates', path: '/admin/news', icon: Newspaper },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Gallery', path: '/admin/gallery', icon: Image },
  { label: 'WhatsApp Groups', path: '/admin/whatsapp', icon: MessageCircle },
  { label: 'Translations', path: '/admin/translations', icon: Globe },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-orange-400 font-bold text-base hover:text-orange-300">
          <Home size={18} />
          <span>TN 38 Portal</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="laptop:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-2 bg-gray-800/50 text-xs text-gray-400 flex items-center justify-between">
        <span>Admin Console</span>
        <span className="bg-orange-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
          {user?.role || 'ADMIN'}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-orange-600 text-white font-semibold shadow-md'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 flex items-center justify-between">
        <div className="text-xs text-gray-400 truncate pr-2">
          <p className="font-semibold text-gray-200 truncate">{user?.name || 'Administrator'}</p>
          <p className="truncate text-[11px]">{user?.email || 'admin@tn38portal.com'}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-100 overflow-x-hidden">
      {/* Desktop Sidebar (1024px+) */}
      <aside className="hidden laptop:flex w-64 flex-col flex-shrink-0 shadow-lg z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer (Below 1024px) */}
      {sidebarOpen && (
        <div className="laptop:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] flex flex-col z-50 shadow-2xl">
            {navContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="laptop:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
              Admin Portal
            </h1>
          </div>

          <Link
            to="/"
            target="_blank"
            className="text-xs sm:text-sm text-orange-600 hover:underline flex items-center gap-1 font-semibold whitespace-nowrap"
          >
            <span>Public Site &rarr;</span>
          </Link>
        </header>

        {/* Scrollable Main View with Horizontal Scroll Protection */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 max-w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
