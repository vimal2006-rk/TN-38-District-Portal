import { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, X } from 'lucide-react';

const MOBILE_BREAKPOINT = 640;

const ACCENT_STYLES = {
  orange: {
    ring: 'focus:ring-2 focus:ring-orange-500 border-gray-200',
    activeOpen: 'border-orange-500 ring-2 ring-orange-500/20',
    rowActive: 'bg-orange-50/90 text-orange-700 font-semibold',
    radioBorder: 'border-orange-600',
    radioDot: 'bg-orange-600',
    searchFocus: 'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15',
  },
  blue: {
    ring: 'focus:ring-2 focus:ring-[#123DAA] border-gray-200',
    activeOpen: 'border-[#123DAA] ring-2 ring-[#123DAA]/15',
    rowActive: 'bg-blue-50/90 text-[#09246B] font-semibold',
    radioBorder: 'border-[#123DAA]',
    radioDot: 'bg-[#123DAA]',
    searchFocus: 'focus:border-[#123DAA] focus:ring-2 focus:ring-[#123DAA]/15',
  },
};

function ResponsiveSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  title = 'Select Option',
  searchable,
  searchPlaceholder = 'Search...',
  accent = 'orange',
  className = '',
  minMenuWidth = 210,
  disabled = false,
  id,
  'aria-label': ariaLabel,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const [desktopPos, setDesktopPos] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const selectedRowRef = useRef(null);

  const theme = ACCENT_STYLES[accent] || ACCENT_STYLES.orange;
  const shouldShowSearch = searchable !== undefined ? searchable : options.length > 8;

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => {
      const hay = `${opt.label || ''} ${opt.subLabel || ''} ${opt.searchText || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, search]);

  const updateViewportAndPosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mobile = vw < MOBILE_BREAKPOINT;
    setIsMobile(mobile);

    if (mobile || !triggerRef.current) {
      setDesktopPos(null);
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, minMenuWidth), vw - 24);
    const left = Math.max(12, Math.min(rect.left, vw - width - 12));
    const spaceBelow = vh - rect.bottom - 12;
    const spaceAbove = rect.top - 12;

    if (spaceBelow >= 240 || spaceBelow >= spaceAbove) {
      setDesktopPos({
        left,
        width,
        top: rect.bottom + 6,
        bottom: 'auto',
        maxHeight: Math.max(160, Math.min(320, spaceBelow)),
      });
    } else {
      setDesktopPos({
        left,
        width,
        top: 'auto',
        bottom: vh - rect.top + 6,
        maxHeight: Math.max(160, Math.min(320, spaceAbove)),
      });
    }
  }, [minMenuWidth]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setSearch('');
    setHighlightIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (opt) => {
      if (opt.disabled) return;
      onChange?.(opt.value);
      closeMenu();
      requestAnimationFrame(() => triggerRef.current?.focus());
    },
    [onChange, closeMenu]
  );

  useEffect(() => {
    if (!open) return undefined;

    updateViewportAndPosition();

    const onResize = () => updateViewportAndPosition();
    const onScroll = (e) => {
      if (menuRef.current && menuRef.current.contains(e.target)) return;
      if (!isMobile) {
        updateViewportAndPosition();
      }
    };
    const onPointerDown = (e) => {
      if (triggerRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      closeMenu();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        triggerRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          filteredOptions.length ? (prev + 1) % filteredOptions.length : -1
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex((prev) =>
          filteredOptions.length
            ? prev <= 0
              ? filteredOptions.length - 1
              : prev - 1
            : -1
        );
      } else if (e.key === 'Enter' && highlightIndex >= 0 && filteredOptions[highlightIndex]) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightIndex]);
      }
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, isMobile, filteredOptions, highlightIndex, handleSelect, closeMenu, updateViewportAndPosition]);

  // Lock background scroll on mobile bottom sheet & scroll active item into view on open
  useEffect(() => {
    if (!open) return undefined;

    const rafId = requestAnimationFrame(() => {
      selectedRowRef.current?.scrollIntoView({ block: 'nearest' });
    });

    if (!isMobile) {
      return () => cancelAnimationFrame(rafId);
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(rafId);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, isMobile]);

  const listContent = (
    <>
      {shouldShowSearch && (
        <div className="p-2.5 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightIndex(0);
              }}
              placeholder={searchPlaceholder}
              className={`w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none ${theme.searchFocus}`}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      <div
        role="listbox"
        aria-label={ariaLabel || title}
        className="overflow-y-auto overscroll-contain flex-1 divide-y divide-gray-100/80"
      >
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-6 text-center text-xs sm:text-sm text-gray-400">
            No matching options
          </div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = idx === highlightIndex;
            return (
              <button
                key={`${opt.value}-${idx}`}
                ref={isSelected ? selectedRowRef : undefined}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-4 py-3 sm:py-2.5 flex items-center justify-between gap-3 transition-colors touch-manipulation ${
                  isSelected
                    ? theme.rowActive
                    : isHighlighted
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="min-w-0 flex-1">
                  <span className="block text-sm truncate">{opt.label}</span>
                  {opt.subLabel && (
                    <span className="block text-[11px] text-gray-500 truncate mt-0.5">
                      {opt.subLabel}
                    </span>
                  )}
                </div>
                <span
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? theme.radioBorder : 'border-gray-300'
                  }`}
                >
                  {isSelected && <span className={`w-2.5 h-2.5 rounded-full ${theme.radioDot}`} />}
                </span>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel || title}
        onClick={() => {
          if (disabled) return;
          if (open) {
            closeMenu();
          } else {
            updateViewportAndPosition();
            setOpen(true);
          }
        }}
        className={`flex items-center justify-between gap-2 text-left transition-all focus:outline-none ${
          open ? theme.activeOpen : theme.ring
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      >
        <span className="truncate flex-1">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          isMobile ? (
            <div
              className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-[1px] flex items-end justify-center animate-fade-in"
              onClick={closeMenu}
            >
              <div
                ref={menuRef}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl border-t border-gray-200 max-h-[75dvh] flex flex-col overflow-hidden animate-sheet-up safe-padding-bottom"
              >
                <div className="pt-2.5 pb-1 flex justify-center">
                  <span className="w-10 h-1 rounded-full bg-gray-300" />
                </div>
                <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-gray-900 truncate">{title}</span>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 active:bg-gray-200"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>
                {listContent}
              </div>
            </div>
          ) : (
            desktopPos && (
              <div
                ref={menuRef}
                style={{
                  position: 'fixed',
                  left: desktopPos.left,
                  width: desktopPos.width,
                  top: desktopPos.top,
                  bottom: desktopPos.bottom,
                  maxHeight: desktopPos.maxHeight,
                  zIndex: 9999,
                }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in"
              >
                {listContent}
              </div>
            )
          ),
          document.body
        )}
    </>
  );
}

export default memo(ResponsiveSelect);
