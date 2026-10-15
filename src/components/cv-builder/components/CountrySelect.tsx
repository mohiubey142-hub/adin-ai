// src/components/cv-builder/components/CountrySelect.tsx
// =====================================================
// Premium country dropdown (flag images + search) — same UI as the
// Cover Letter's Step1Details phone country picker.
// =====================================================

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check } from 'lucide-react';
import { countryCodes, findCountry } from '../constants/cvDefaults';

type Country = (typeof countryCodes)[number];

// Dial code (e.g. +92): use dialCode if the constants have it, else fall back to code
export const getDialCode = (c: { code: string; dialCode?: string }): string =>
  c.dialCode || c.code;

// Flag emoji -> ISO-2 ("🇵🇰" -> "pk"). Windows can't render flag emojis,
// so we draw real flag images and fall back to the emoji only if the image fails.
const flagToIso = (flag?: string): string => {
  if (!flag) return '';
  const cps = Array.from(flag).map((ch) => ch.codePointAt(0) as number);
  if (cps.length < 2 || cps.slice(0, 2).some((cp) => cp < 0x1f1e6 || cp > 0x1f1ff)) return '';
  return cps
    .slice(0, 2)
    .map((cp) => String.fromCharCode(cp - 0x1f1e6 + 97))
    .join('');
};

const FlagIcon: React.FC<{ flag?: string; country?: string }> = ({ flag, country }) => {
  const [failed, setFailed] = useState(false);
  const iso = flagToIso(flag);

  if (!iso || failed) {
    return (
      <span className="inline-flex items-center justify-center w-6 h-4 text-sm leading-none flex-shrink-0">
        {flag || '🌍'}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${iso}.png`}
      srcSet={`https://flagcdn.com/w80/${iso}.png 2x`}
      alt={country ? `${country} flag` : ''}
      width={24}
      height={16}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-6 h-4 rounded-[3px] object-cover flex-shrink-0 ring-1 ring-slate-900/10"
    />
  );
};

const COUNTRY_SCROLL_CSS = `
.cc-scroll { scrollbar-width: thin; scrollbar-color: #a855f7 #faf5ff; overscroll-behavior: contain; }
.cc-scroll::-webkit-scrollbar { width: 10px; }
.cc-scroll::-webkit-scrollbar-track { background: #faf5ff; border-radius: 9999px; }
.cc-scroll::-webkit-scrollbar-thumb { background: #a855f7; border-radius: 9999px; border: 2px solid #faf5ff; }
.cc-scroll::-webkit-scrollbar-thumb:hover { background: #9333ea; }
`;

const CountrySelect: React.FC<{ value: string; onChange: (code: string) => void }> = ({
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState<{
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxH: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = findCountry(value);

  // Panel is rendered in a portal with fixed positioning, so parent containers
  // (accordion overflow, scroll areas, sticky footers) can never clip it.
  // It opens upward automatically when there is more room above the button.
  const updatePos = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vh = window.innerHeight;
    const gap = 8;
    const margin = 12;
    const spaceBelow = vh - r.bottom - gap - margin;
    const spaceAbove = r.top - gap - margin;
    const openUp = spaceBelow < 280 && spaceAbove > spaceBelow;
    const maxH = Math.max(160, Math.min(340, openUp ? spaceAbove : spaceBelow));
    setPos(
      openUp
        ? { left: r.left, width: r.width, bottom: vh - r.top + gap, maxH }
        : { left: r.left, width: r.width, top: r.bottom + gap, maxH }
    );
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
      setQuery('');
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    searchRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const list: Country[] = q
    ? countryCodes.filter(
        (c) =>
          c.country.toLowerCase().includes(q) ||
          getDialCode(c).includes(q) ||
          c.code.includes(q)
      )
    : countryCodes;

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={rootRef} className="relative">
      <style>{COUNTRY_SCROLL_CSS}</style>

      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`relative w-full flex items-center gap-2.5 rounded-xl bg-white border text-slate-900 text-sm font-medium outline-none transition-all duration-200 pl-4 pr-10 py-3 ${
          open
            ? 'border-purple-500 ring-4 ring-purple-500/10'
            : 'border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10'
        }`}
      >
        <FlagIcon flag={selected?.flag} country={selected?.country} />
        <span className="font-semibold tabular-nums flex-shrink-0">{selected ? getDialCode(selected) : value}</span>
        {selected && <span className="flex-1 min-w-0 text-left text-slate-500 font-normal truncate">{selected.country}</span>}
        <ChevronDown
          size={16}
          className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={panelRef}
            data-portal-root="country-select"
            style={{
              position: 'fixed',
              left: pos.left,
              width: pos.width,
              top: pos.top,
              bottom: pos.bottom,
              maxHeight: pos.maxH,
            }}
            className="z-[1000] flex flex-col rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 flex-shrink-0">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search country or code"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
                />
              </div>
            </div>

            <ul role="listbox" className="cc-scroll flex-1 min-h-0 overflow-y-auto p-1.5 pb-2">
              {list.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-slate-400">No country found</li>
              )}
              {list.map((c) => {
                const isSelected = c.code === selected?.code;
                return (
                  <li key={`${c.code}-${c.country}`} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(c.code);
                        close();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors duration-150 ${
                        isSelected ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <FlagIcon flag={c.flag} country={c.country} />
                      <span className="flex-1 min-w-0 truncate font-medium">{c.country}</span>
                      <span
                        className={`text-xs tabular-nums flex-shrink-0 ${
                          isSelected ? 'text-purple-500' : 'text-slate-400'
                        }`}
                      >
                        {getDialCode(c)}
                      </span>
                      {isSelected && <Check size={14} className="text-purple-600 flex-shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
};


export default CountrySelect;
