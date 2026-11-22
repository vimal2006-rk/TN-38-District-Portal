import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Shield, ArrowRight } from 'lucide-react';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { key: 'nav.home', label: 'Home', path: '/' },
  { key: 'nav.districts', label: 'Districts', path: '/districts' },
  { key: 'nav.membership', label: 'Membership', path: '/membership' },
  { key: 'nav.whatsapp', label: 'WhatsApp', path: '/whatsapp-groups' },
  { key: 'nav.news', label: 'News', path: '/news' },
  { key: 'nav.events', label: 'Events', path: '/events' },
  { key: 'nav.gallery', label: 'Gallery', path: '/gallery' },
  { key: 'nav.administration', label: 'Administration', path: '/office-bearers' },
  { key: 'nav.contact', label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <header className="bg-orange-600 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo Brand */}
          <Link
            to="/"
            className="flex flex-col leading-tight hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <span className="text-white font-bold text-base xs:text-lg sm:text-xl tracking-tight">
              TN 38 மாவட்ட போர்டல்
            </span>
            <span className="text-orange-200 text-[10px] xs:text-xs tracking-wide">
              TN 38 District Portal
            </span>
          </Link>

          {/* Desktop Navigation (1024px and above: laptop+) */}
          <nav className="hidden laptop:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `text-xs xl:text-sm font-medium transition-colors px-2.5 py-1.5 rounded-lg whitespace-nowrap ${
                    isActive
                      ? 'bg-orange-700 text-yellow-300 font-bold shadow-inner'
                      : 'text-white hover:text-yellow-200 hover:bg-orange-700/60'
                  }`
                }
              >
                {t(link.key, link.label)}
              </NavLink>
            ))}

            {isAuthenticated && (
              <NavLink
                to="/admin/dashboard"
                className="text-xs xl:text-sm font-semibold transition-colors px-2.5 py-1.5 rounded-lg bg-orange-800 text-white hover:bg-orange-900 flex items-center gap-1 ml-1"
              >
                <Shield size={14} />
                <span>Admin</span>
              </NavLink>
            )}
          </nav>

          {/* Right Area: Language Switcher + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {/* Mobile Hamburger Button (visible below 1024px / laptop) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="laptop:hidden p-2 rounded-xl text-white hover:bg-orange-700 active:bg-orange-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Below 1024px / below 768px) */}
      {menuOpen && (
        <div className="laptop:hidden fixed inset-0 top-16 bg-black/50 backdrop-blur-sm z-50 flex flex-col justify-start">
          <div className="bg-orange-700 border-t border-orange-500 shadow-2xl px-4 py-6 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-1">
            <p className="text-[11px] font-bold text-orange-200 uppercase tracking-widest px-3 mb-2">
              Navigation Menu / வழிசெலுத்தல்
            </p>

            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between text-base font-semibold px-4 py-3 rounded-xl transition-colors min-h-[44px] ${
                    isActive
                      ? 'bg-orange-900 text-yellow-300 font-bold border-l-4 border-yellow-300 shadow-inner'
                      : 'text-white hover:bg-orange-800 active:bg-orange-900'
                  }`
                }
              >
                <span>{t(link.key, link.label)}</span>
                <ArrowRight size={16} className="text-orange-300" />
              </NavLink>
            ))}

            {isAuthenticated && (
              <NavLink
                to="/admin/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-base font-bold px-4 py-3 rounded-xl bg-orange-900 text-yellow-300 mt-2 min-h-[44px]"
              >
                <Shield size={18} />
                <span>Admin Console / நிர்வாக பலகம்</span>
              </NavLink>
            )}

            <div className="pt-4 border-t border-orange-600 mt-4 px-3 text-xs text-orange-200 text-center">
              Tamil Nadu 38 District Organization Portal
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
