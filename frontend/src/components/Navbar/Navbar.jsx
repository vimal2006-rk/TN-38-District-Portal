import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { key: 'nav.home',           label: 'Home',           path: '/' },
  { key: 'nav.districts',      label: 'Districts',      path: '/districts' },
  { key: 'nav.membership',     label: 'Membership',     path: '/membership' },
  { key: 'nav.whatsapp',       label: 'WhatsApp',       path: '/whatsapp-groups' },
  { key: 'nav.news',           label: 'News',           path: '/news' },
  { key: 'nav.events',         label: 'Events',         path: '/events' },
  { key: 'nav.gallery',        label: 'Gallery',        path: '/gallery' },
  { key: 'nav.administration', label: 'Administration', path: '/office-bearers' },
  { key: 'nav.contact',        label: 'Contact',        path: '/contact' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [menuOpen]);

  return (
    <header style={{ backgroundColor: '#123DAA' }} className="shadow-md sticky top-0 z-50 w-full">
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">

          {/* Logo + Brand */}
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2.5 hover:opacity-90 transition-opacity flex-shrink min-w-0"
          >
            <img
              src="/logo.jpg"
              alt="TMSSA Logo"
              className="h-8 w-8 xs:h-9 xs:w-9 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-white font-bold text-[11px] xs:text-xs sm:text-sm xl:text-base tracking-tight truncate max-w-[145px] xs:max-w-[185px] sm:max-w-[260px] md:max-w-none">
                தமிழ்நாடு மொபைல் கடைகள் சங்கம்
              </span>
              <span className="hidden xs:block text-blue-200 text-[9px] sm:text-[10px] xl:text-xs tracking-wide truncate max-w-[140px] xs:max-w-[175px] sm:max-w-[260px] md:max-w-none">
                Tamil Nadu Mobile Shops Association
              </span>
            </div>
          </Link>

          {/* Desktop Navigation (1024px and above) */}
          <nav className="hidden laptop:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 flex-nowrap justify-center">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `text-[11px] xl:text-xs 2xl:text-sm font-medium transition-all duration-200 px-1.5 xl:px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                    isActive
                      ? 'text-white font-bold bg-white/20 border-b-2 border-[#F07818] shadow-inner'
                      : 'text-blue-100 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {t(link.key, link.label)}
              </NavLink>
            ))}

            {isAuthenticated && (
              <NavLink
                to="/admin/dashboard"
                className="text-[11px] xl:text-xs font-semibold transition-all duration-200 px-2 py-1.5 rounded-lg bg-[#F07818] text-white hover:bg-[#d4660f] flex items-center gap-1 ml-1 flex-shrink-0"
              >
                <Shield size={13} />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right Section: Language Switcher + Mobile Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <LanguageSwitcher />

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="laptop:hidden p-1.5 xs:p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 flex-shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Below 1024px) */}
      {menuOpen && (
        <div className="laptop:hidden fixed inset-0 top-16 bg-black/60 backdrop-blur-sm z-50">
          <div
            style={{ backgroundColor: '#09246B' }}
            className="border-t-2 border-[#F07818] shadow-2xl px-4 py-5 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            {/* Logo in mobile drawer */}
            <div className="flex items-center gap-3 px-3 pb-4 mb-3 border-b border-blue-700/60">
              <img
                src="/logo.jpg"
                alt="TMSSA Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-[#F07818]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div>
                <p className="text-white font-bold text-sm">தமிழ்நாடு மொபைல் கடைகள் சங்கம்</p>
                <p className="text-blue-200 text-xs">Tamil Nadu Mobile Shops Association</p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-blue-300 uppercase tracking-widest px-3 mb-2">
              Navigation / வழிசெலுத்தல்
            </p>

            <div className="space-y-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between text-base font-semibold px-4 py-3 rounded-xl transition-colors min-h-[46px] ${
                      isActive
                        ? 'bg-[#123DAA] text-white border-l-4 border-[#F07818]'
                        : 'text-blue-100 hover:bg-[#123DAA]/70 hover:text-white active:bg-[#123DAA]'
                    }`
                  }
                >
                  <span>{t(link.key, link.label)}</span>
                  <ArrowRight size={16} className="text-[#F07818]" />
                </NavLink>
              ))}

              {isAuthenticated && (
                <NavLink
                  to="/admin/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 text-base font-bold px-4 py-3 rounded-xl bg-[#F07818] text-white mt-3 min-h-[46px] hover:bg-[#d4660f]"
                >
                  <Shield size={18} />
                  <span>Admin Console / நிர்வாக பலகம்</span>
                </NavLink>
              )}
            </div>

            <div className="pt-4 border-t border-blue-700/60 mt-4 px-3 text-xs text-blue-300 text-center">
              © 2025 Tamil Nadu 38 District Organization Portal
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
