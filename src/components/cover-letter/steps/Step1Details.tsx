// src/components/cover-letter/steps/Step1Details.tsx
// =====================================================
// ✅ Labels simplified & shortened for better UX
// ✅ Target Job Title moved to Personal Section
// ✅ Last section renamed to "Job Details"
// ✅ NEW: Generate button is ALWAYS visible & clickable
// ✅ NEW: Click with missing required fields → closed sections open,
//         empty fields turn red with messages, first one is scrolled into view + focused
// =====================================================

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  User, Mail, Phone, MapPin, Linkedin,
  Briefcase, FileText, Building, ChevronDown, Search, Check,
  CheckCircle2, AlertCircle, SendHorizontal,
  Award, Clock, UserCheck, Zap,
} from 'lucide-react';
import { countryCodes } from '../constants/cvDefaults';

import SkillsSection from '../../cv-builder/sections/SkillsSection';
import AccordionSection from '../components/AccordionSection';

// ============================================================
// COUNTRY SELECT (premium dropdown, local to this file)
// ============================================================
type Country = (typeof countryCodes)[number];

const getDialCode = (c: { code: string; dialCode?: string }): string =>
  c.dialCode || c.code;

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

  const selected =
    countryCodes.find((c) => c.code === value) ||
    countryCodes.find((c) => c.dialCode === value);

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
            ref={panelRef} data-portal-root="country-select"
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

// ============================================================
// VALIDATION HELPERS (field ids, section map, field order)
// ============================================================
type SectionKey = 'personal' | 'job' | 'experience' | 'skills';
type FieldKey = 'userName' | 'jobTitle' | 'email' | 'phone' | 'skills' | 'company' | 'jobDescription';

const fieldDomId = (key: FieldKey): string => `cl-field-${key}`;

// Order = top-to-bottom order in the form (first invalid one gets the focus)
const FIELD_ORDER: FieldKey[] = [
  'userName', 'jobTitle', 'email', 'phone', 'skills', 'company', 'jobDescription',
];

const FIELD_SECTION: Record<FieldKey, SectionKey> = {
  userName: 'personal',
  jobTitle: 'personal',
  email: 'personal',
  phone: 'personal',
  skills: 'skills',
  company: 'job',
  jobDescription: 'job',
};

// Wait for the accordion open animation (+ parent's auto-reveal scroll) before scrolling to the field
const SECTION_OPEN_SETTLE_MS = 450;

interface Step1DetailsProps {
  userName: string;
  setUserName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  selectedCountryCode: string;
  setSelectedCountryCode: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  linkedin: string;
  setLinkedin: (value: string) => void;

  education?: string;
  setEducation?: (value: string) => void;
  experience?: string;
  setExperience?: (value: string) => void;
  additionalInfo?: string;
  setAdditionalInfo?: (value: string) => void;
  projects?: string;
  setProjects?: (value: string) => void;
  currentPosition?: string;
  setCurrentPosition?: (value: string) => void;

  skills: string;
  setSkills: (value: string) => void;
  jobTitle: string;
  setJobTitle: (value: string) => void;
  company: string;
  setCompany: (value: string) => void;
  jobDescription: string;
  setJobDescription: (value: string) => void;

  profilePhoto?: string | null;
  setProfilePhoto?: (value: string | null) => void;

  onNext?: () => void;
  generating?: boolean;

  hiringManagerName: string;
  setHiringManagerName: (value: string) => void;
  currentTitle: string;
  setCurrentTitle: (value: string) => void;
  currentCompany: string;
  setCurrentCompany: (value: string) => void;
  yearsOfExperience: string;
  setYearsOfExperience: (value: string) => void;

  openSections: {
    personal: boolean;
    job: boolean;
    experience: boolean;
    skills: boolean;
  };
  toggleSection: (key: SectionKey) => void;
}

const Step1Details: React.FC<Step1DetailsProps> = ({
  userName, setUserName,
  email, setEmail,
  phoneNumber, setPhoneNumber,
  selectedCountryCode, setSelectedCountryCode,
  address, setAddress,
  linkedin, setLinkedin,
  skills, setSkills,
  jobTitle, setJobTitle,
  company, setCompany,
  jobDescription, setJobDescription,
  onNext,
  generating = false,
  hiringManagerName, setHiringManagerName,
  currentTitle, setCurrentTitle,
  currentCompany, setCurrentCompany,
  yearsOfExperience, setYearsOfExperience,
  openSections,
  toggleSection,
}) => {
  // ✅ NEW: errors become visible only after the user taps "Generate" with missing fields
  const [showErrors, setShowErrors] = useState(false);
  const scrollTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const validatePhoneForCountry = (phone: string, countryCode: string): { isValid: boolean; message: string } => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    const digitsOnly = phone.replace(/\D/g, '');
    if (!/^\d+$/.test(digitsOnly)) return { isValid: false, message: 'Please enter a valid phone number' };

    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) {
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return { isValid: false, message: 'Please enter a valid phone number' };
      }
      return { isValid: true, message: 'Valid phone number' };
    }

    if (digitsOnly.length !== country.length) {
      return {
        isValid: false,
        message: `Must be exactly ${country.length} digits`
      };
    }

    return { isValid: true, message: `Valid number` };
  };

  const phoneValidation = validatePhoneForCountry(phoneNumber, selectedCountryCode);
  const isPhoneValid = phoneValidation.isValid;
  const phoneValidationMessage = phoneValidation.message;

  const selectedCountry = countryCodes.find(c => c.code === selectedCountryCode);
  const dialCode = selectedCountry ? getDialCode(selectedCountry) : selectedCountryCode;

  const handlePhoneInputChange = (raw: string) => {
    let rest = raw;
    if (raw.startsWith(dialCode)) {
      rest = raw.slice(dialCode.length);
    } else {
      const i = raw.indexOf(' ');
      rest = i >= 0 ? raw.slice(i) : '';
    }
    setPhoneNumber(rest.replace(/\D/g, ''));
  };

  const isSkillsValid = (): boolean => {
    if (!skills) return false;
    const skillList = skills.split(',').filter(s => s.trim().length > 0);
    return skillList.length > 0;
  };

  const isGmail = !!email && email.includes('@gmail.com');

  // ✅ NEW: single source of truth for "which required fields are invalid"
  const fieldErrors: Record<FieldKey, boolean> = {
    userName: !userName.trim(),
    jobTitle: !jobTitle.trim(),
    email: !isGmail,
    phone: !isPhoneValid,
    skills: !isSkillsValid(),
    company: !company.trim(),
    jobDescription: !jobDescription.trim(),
  };

  const invalidFields = FIELD_ORDER.filter((k) => fieldErrors[k]);
  const canProceed = invalidFields.length === 0;

  // Show an error only after the user tried to generate
  const err = (k: FieldKey): boolean => showErrors && fieldErrors[k];

  const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-3 sm:px-4 py-2.5 text-sm sm:text-base';
  const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';
  const errorInput =
    'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10';

  const phoneBaseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';

  const handleSkillsChange = (value: string) => {
    let formatted = value.replace(/\s*,\s*/g, ', ').trim();
    formatted = formatted.replace(/,+/g, ',');
    formatted = formatted.replace(/\s+,/g, ',');
    formatted = formatted.replace(/,(\S)/g, ', $1');
    setSkills(formatted);
  };

  const noopEnhanceSkills = () => {};

  // ✅ NEW: scroll to the first invalid field and focus it
  const focusField = (key: FieldKey) => {
    const el = document.getElementById(fieldDomId(key));
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const focusable: HTMLElement | null =
        el.matches('input, textarea, select, button')
          ? el
          : el.querySelector<HTMLElement>('input, textarea, select');
      focusable?.focus({ preventScroll: true });
    } catch {
      /* scroll/focus is only an enhancement — never break the UI */
    }
  };

  // ✅ NEW: Generate click handler
  const handleGenerateClick = () => {
    if (generating) return;

    if (canProceed) {
      setShowErrors(false);
      onNext?.();
      return;
    }

    setShowErrors(true);

    // Open every closed section that contains an invalid field
    const sectionsToOpen = Array.from(
      new Set(invalidFields.map((k) => FIELD_SECTION[k]))
    ).filter((s) => !openSections[s]);
    sectionsToOpen.forEach((s) => toggleSection(s));

    const first = invalidFields[0];
    if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(
      () => focusField(first),
      sectionsToOpen.length > 0 ? SECTION_OPEN_SETTLE_MS : 0
    );
  };

  const ErrorLine: React.FC<{ message: string }> = ({ message }) => (
    <p className="flex items-center gap-1.5 text-xs text-red-600 mt-1.5" role="alert">
      <AlertCircle size={12} />
      {message}
    </p>
  );

  return (
    <div className="space-y-3">
      {/* ============================================
          SECTION 1: PERSONAL INFORMATION
      ============================================ */}
      <AccordionSection
        id="personal"
        title="Personal Info"
        subtitle="Name, target role, and contact"
        icon={<User size={16} strokeWidth={2.4} />}
        isOpen={openSections.personal}
        onToggle={() => toggleSection('personal')}
        badge="Required"
      >
        <div className="space-y-4 pt-3">
          {/* Full Name */}
          <div>
            <label htmlFor={fieldDomId('userName')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <User size={14} className="text-purple-600" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldDomId('userName')}
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g., John Doe"
              aria-invalid={err('userName')}
              className={`${baseInput} ${err('userName') ? errorInput : normalInput}`}
            />
            {userName && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Valid name
              </p>
            )}
            {err('userName') && <ErrorLine message="Full name is required" />}
          </div>

          {/* TARGET JOB TITLE */}
          <div>
            <label htmlFor={fieldDomId('jobTitle')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase size={14} className="text-purple-600" />
              Target Job Title <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldDomId('jobTitle')}
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              aria-invalid={err('jobTitle')}
              className={`${baseInput} ${err('jobTitle') ? errorInput : normalInput}`}
            />
            {jobTitle && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Set
              </p>
            )}
            {err('jobTitle') && <ErrorLine message="Target job title is required" />}
          </div>

          {/* Email */}
          <div>
            <label htmlFor={fieldDomId('email')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Mail size={14} className="text-purple-600" />
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldDomId('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              aria-invalid={(!!email && !isGmail) || err('email')}
              className={`${baseInput} ${
                (email && !isGmail) || err('email') ? errorInput : normalInput
              }`}
            />
            {email ? (
              <p className={`flex items-center gap-1.5 text-xs mt-1.5 ${
                isGmail ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {isGmail ? (
                  <>
                    <CheckCircle2 size={12} />
                    Valid Gmail
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    Please use @gmail.com
                  </>
                )}
              </p>
            ) : (
              err('email') && <ErrorLine message="Email is required" />
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={fieldDomId('phone')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Phone size={14} className="text-purple-600" />
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <CountrySelect value={selectedCountryCode} onChange={setSelectedCountryCode} />

              <input
                id={fieldDomId('phone')}
                type="tel"
                value={`${dialCode} ${phoneNumber}`}
                onChange={(e) => handlePhoneInputChange(e.target.value)}
                placeholder={selectedCountry?.example || '3123456789'}
                aria-invalid={(!!phoneNumber && !isPhoneValid) || err('phone')}
                className={`${phoneBaseInput} text-center tracking-wide ${
                  (phoneNumber && !isPhoneValid) || err('phone') ? errorInput : normalInput
                }`}
              />

              <div className="flex justify-center">
                {phoneNumber ? (
                  isPhoneValid ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-medium text-emerald-600">
                      <CheckCircle2 size={12} />
                      Valid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-600">
                      <AlertCircle size={12} />
                      {phoneValidationMessage}
                    </span>
                  )
                ) : err('phone') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-xs font-medium text-red-600" role="alert">
                    <AlertCircle size={12} />
                    {phoneValidationMessage}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-100 text-xs text-slate-500">
                    <span>{selectedCountry?.flag}</span>
                    <span>Example: {selectedCountry?.example || '3123456789'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <MapPin size={14} className="text-purple-600" />
              Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="City, Country"
              className={`${baseInput} ${normalInput}`}
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Linkedin size={14} className="text-purple-600" />
              LinkedIn <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/yourprofile"
              className={`${baseInput} ${normalInput}`}
            />
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 2: YOUR EXPERIENCE
      ============================================ */}
      <AccordionSection
        id="experience"
        title="Experience"
        subtitle="Your current role (optional)"
        icon={<Clock size={16} strokeWidth={2.4} />}
        isOpen={openSections.experience}
        onToggle={() => toggleSection('experience')}
      >
        <div className="space-y-4 pt-3">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Briefcase size={14} className="text-purple-600" />
              Current Job Title <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              placeholder="e.g., Software Engineer"
              className={`${baseInput} ${normalInput}`}
            />
            {currentTitle && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Set
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building size={14} className="text-purple-600" />
              Current Company <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={currentCompany}
              onChange={(e) => setCurrentCompany(e.target.value)}
              placeholder="e.g., Techlogix"
              className={`${baseInput} ${normalInput}`}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Clock size={14} className="text-purple-600" />
              Years of Experience <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={yearsOfExperience}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d{1,2}$/.test(val)) {
                  setYearsOfExperience(val);
                }
              }}
              placeholder="e.g., 5"
              className={`${baseInput} ${normalInput}`}
            />
            <p className="text-xs text-slate-400 mt-1">
              Fresher? Leave empty
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 3: YOUR SKILLS
      ============================================ */}
      <AccordionSection
        id="skills"
        title="Skills"
        subtitle="Technical and soft skills"
        icon={<Zap size={16} strokeWidth={2.4} />}
        isOpen={openSections.skills}
        onToggle={() => toggleSection('skills')}
        badge="Required"
      >
        <div className="pt-3">
          {/* Wrapper = scroll/focus target only (no ring). Error is shown as a clear callout. */}
          <div id={fieldDomId('skills')}>
            {err('skills') && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-200 px-3.5 py-3 mb-3"
              >
                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">Skills are required</p>
                  <p className="text-xs text-red-600/90 mt-0.5">
                    Add at least one skill below (e.g., React, Communication) so the AI can write your letter.
                  </p>
                </div>
              </div>
            )}
            <SkillsSection
              skills={skills}
              setSkills={handleSkillsChange}
              enhanceSkills={noopEnhanceSkills}
              generating={generating}
              personalInfo={{ title: currentTitle || jobTitle }}
            />
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          SECTION 4: JOB DETAILS
      ============================================ */}
      <AccordionSection
        id="job"
        title="Job Details"
        subtitle="Company and description"
        icon={<Building size={16} strokeWidth={2.4} />}
        isOpen={openSections.job}
        onToggle={() => toggleSection('job')}
        badge="Required"
      >
        <div className="space-y-4 pt-3">
          <div>
            <label htmlFor={fieldDomId('company')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <Building size={14} className="text-purple-600" />
              Target Company <span className="text-red-500">*</span>
            </label>
            <input
              id={fieldDomId('company')}
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Google"
              aria-invalid={err('company')}
              className={`${baseInput} ${err('company') ? errorInput : normalInput}`}
            />
            {company && (
              <p className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
                <CheckCircle2 size={12} />
                Set
              </p>
            )}
            {err('company') && <ErrorLine message="Target company is required" />}
          </div>

          <div>
            <label htmlFor={fieldDomId('jobDescription')} className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <FileText size={14} className="text-purple-600" />
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id={fieldDomId('jobDescription')}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={5}
              aria-invalid={err('jobDescription')}
              className={`${baseInput} ${err('jobDescription') ? errorInput : normalInput} resize-none`}
            />
            {jobDescription && (
              <p className="text-xs text-slate-400 mt-1">
                {jobDescription.split(/\s+/).filter(w => w.length > 0).length} words
              </p>
            )}
            {err('jobDescription') && <ErrorLine message="Job description is required" />}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
              <UserCheck size={14} className="text-purple-600" />
              Hiring Manager <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={hiringManagerName}
              onChange={(e) => setHiringManagerName(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              className={`${baseInput} ${normalInput}`}
            />
            <p className="text-xs text-slate-400 mt-1">
              Uses "Dear [Name]", else "Dear Hiring Team"
            </p>
          </div>
        </div>
      </AccordionSection>

      {/* ============================================
          GENERATE BUTTON (always visible & clickable)
      ============================================ */}
      <div className="pt-4 border-t border-slate-100 mt-4">
        <button
          type="button"
          onClick={handleGenerateClick}
          disabled={generating}
          className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
            generating
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20'
          }`}
        >
          {generating ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SendHorizontal size={16} />
              Generate AI Letter
            </>
          )}
        </button>
        {showErrors && !canProceed && !generating && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-red-600 mt-2" role="alert">
            <AlertCircle size={12} />
            {invalidFields.length === 1
              ? '1 required field needs attention'
              : `${invalidFields.length} required fields need attention`}
          </p>
        )}
      </div>

    </div>
  );
};

export default Step1Details;
