import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Image,
  Award,
  Users,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const ADMIN_LINKS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Membership', path: '/admin/members', icon: Users },
  { label: 'News & Updates', path: '/admin/news', icon: Newspaper },
  { label: 'Events', path: '/admin/events', icon: Calendar },
  { label: 'Gallery', path: '/admin/gallery', icon: Image },
  { label: 'Administration', path: '/admin/office-bearers-admin', icon: Award },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navContent = (
    <div style={{ backgroundColor: '#09246B' }} className="flex flex-col h-full text-white">
      {/* Brand */}
      <div className="p-4 border-b border-blue-900/60 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-base hover:opacity-90 transition">
          <img
            src="/logo.jpg"
            alt="TMSSA Logo"
            className="h-8 w-8 rounded-full object-cover border border-[#F07818]"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className="flex flex-col leading-tight">
            <span className="text-white text-sm font-bold">TMSSA Admin</span>
            <span style={{ color: '#F07818' }} className="text-[10px]">Management Console</span>
          </div>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="laptop:hidden p-1.5 rounded-lg text-blue-300 hover:text-white hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* Role Badge */}
      <div className="px-4 py-2.5 bg-[#071d57] text-xs flex items-center justify-between border-b border-blue-900/40">
        <span className="text-blue-300 text-[11px]">Access Level</span>
        <span
          className="text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold shadow-xs"
          style={{ backgroundColor: '#F07818' }}
        >
          {user?.role || 'ADMIN'}
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {ADMIN_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all min-h-[44px] ${
                  isActive
                    ? 'text-white font-semibold shadow-sm'
                    : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive ? { backgroundColor: '#123DAA' } : {}
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-blue-900/60 flex items-center justify-between bg-[#071d57]">
        <div className="text-xs text-blue-300 truncate pr-2">
          <p className="font-semibold text-white truncate">{user?.name || 'Administrator'}</p>
          <p className="truncate text-[11px] text-blue-400">{user?.email || 'admin@tnmssa.com'}</p>
        </div>
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 text-blue-300 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ backgroundColor: '#F4F7FC' }}>
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
        <header
          className="bg-white border-b px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xs"
          style={{ borderColor: '#E2E8F0' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="laptop:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="text-base sm:text-lg font-bold truncate" style={{ color: '#172554' }}>
              Admin Portal
            </h1>
          </div>

          <Link
            to="/"
            target="_blank"
            className="text-xs sm:text-sm hover:underline flex items-center gap-1 font-semibold whitespace-nowrap transition-colors"
            style={{ color: '#123DAA' }}
          >
            <span>Public Site &rarr;</span>
          </Link>
        </header>

        {/* Scrollable Main View */}
        <main className="flex-1 p-3 xs:p-4 sm:p-6 max-w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
