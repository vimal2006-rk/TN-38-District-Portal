import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Shield, ArrowRight, Phone } from 'lucide-react';
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
    <header className="w-full sticky top-0 z-50 shadow-md">
      {/* ── Tier 1: Association Brand Header ──────────────────────── */}
      <div style={{ backgroundColor: '#09246B' }} className="border-b border-white/10 text-white">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Logo + Full Brand Name (Zero Truncation) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-4 hover:opacity-95 transition-opacity min-w-0 flex-1 sm:flex-initial"
          >
            <img
              src="/logo.jpg"
              alt="TMSSA Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full object-cover border-2 border-[#F07818] shadow-md flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="flex flex-col leading-tight min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-extrabold text-[12px] xs:text-sm sm:text-base md:text-lg lg:text-xl tracking-tight leading-snug">
                  தமிழ்நாடு மொபைல் சேல்ஸ் அண்டு சர்வீஸ் அசோசியேஷன்
                </span>
                <span
                  className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full font-mono font-bold text-white shadow-xs flex-shrink-0"
                  style={{ backgroundColor: '#16A34A' }}
                >
                  Reg: 23/2025
                </span>
              </div>
              <span
                className="text-[10px] xs:text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide leading-tight mt-0.5"
                style={{ color: '#F07818' }}
              >
                Tamilnadu Mobile Sales and Service Association
              </span>
            </div>
          </Link>

          {/* Right Controls: Helpline + Language + Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Official Helpline on Desktop */}
            <a
              href="tel:+919944773668"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white text-xs font-semibold border border-white/15 transition-all shadow-xs"
              title="Official Helpline"
            >
              <Phone size={13} style={{ color: '#F07818' }} />
              <span>+91 99447 73668</span>
            </a>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Mobile Toggle Button (Below 1024px) */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="laptop:hidden p-1.5 xs:p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 flex-shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* ── Tier 2: Dedicated Navigation Bar ──────────────────────── */}
      <nav
        style={{ backgroundColor: '#123DAA' }}
        className="w-full border-t border-b border-blue-900/60 shadow-md"
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-11 sm:h-12">
            
            {/* Desktop Navigation Links (Full Width Available) */}
            <div className="hidden laptop:flex items-center gap-1 xl:gap-2 flex-nowrap w-full justify-between">
              <div className="flex items-center gap-0.5 xl:gap-1.5 flex-nowrap">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({ isActive }) =>
                      `text-xs xl:text-[13px] 2xl:text-sm font-semibold transition-all duration-200 px-2.5 xl:px-3 py-1.5 rounded-lg whitespace-nowrap ${
                        isActive
                          ? 'text-white font-bold bg-white/20 border-b-2 border-[#F07818] shadow-inner'
                          : 'text-blue-100 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {t(link.key, link.label)}
                  </NavLink>
                ))}
              </div>

              {/* Action: Quick Join / Admin */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to="/membership"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: '#16A34A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#15803d')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16A34A')}
                >
                  <span>{t('home.joinNow', 'Join Now / உறுப்பினர்')}</span>
                </Link>

                {isAuthenticated && (
                  <NavLink
                    to="/admin/dashboard"
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-[#F07818] text-white hover:bg-[#d4660f] flex items-center gap-1"
                  >
                    <Shield size={13} />
                    <span>Admin</span>
                  </NavLink>
                )}
              </div>
            </div>

            {/* Mobile Nav Bar Strip */}
            <div className="laptop:hidden flex items-center justify-between w-full text-xs">
              <a href="tel:+919944773668" className="flex items-center gap-1.5 text-blue-200 hover:text-white font-medium">
                <Phone size={13} style={{ color: '#F07818' }} />
                <span>+91 99447 73668</span>
              </a>
              <Link
                to="/membership"
                className="px-3 py-1 rounded-md text-[11px] font-bold text-white shadow-xs"
                style={{ backgroundColor: '#F07818' }}
              >
                {t('home.joinNow', 'Join Now / உறுப்பினர்')}
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Mobile Drawer (Below 1024px) ─────────────────────────── */}
      {menuOpen && (
        <div className="laptop:hidden fixed inset-0 top-[96px] xs:top-[104px] sm:top-[115px] bg-black/60 backdrop-blur-sm z-50">
          <div
            style={{ backgroundColor: '#09246B' }}
            className="border-t-2 border-[#F07818] shadow-2xl px-4 py-5 max-h-[calc(100vh-6rem)] overflow-y-auto"
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
                <p className="text-white font-bold text-sm">தமிழ்நாடு மொபைல் சேல்ஸ் அண்டு சர்வீஸ் அசோசியேஷன்</p>
                <p className="text-[#F07818] text-xs font-semibold">Tamilnadu Mobile Sales and Service Association</p>
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
              © {new Date().getFullYear()} Tamilnadu Mobile Sales and Service Association
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
