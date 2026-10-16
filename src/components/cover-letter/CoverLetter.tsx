// src/components/cover-letter/CoverLetter.tsx
// ✅ UPDATED: FeedbackFullScreen (single-screen, Design C) replaces FeedbackModal + Widget
// ✅ FIX: Removed widget visibility tracking
// ✅ FIX: CV autofill now also sets the country code (and stores phone as digits only)

import { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Trash2, Copy, Download, FileText, Eye, CheckCircle2, Sparkles, ChevronDown, MessageCircle, Maximize, Minimize, Image as ImageIcon, Pencil,
  Check, RefreshCw, Zap, Ban, // ✅ NEW: icons for the permanent CV autofill panel
} from 'lucide-react';

import Step1Details from './steps/Step1Details';
import { generateCoverLetterPDF } from './utils/pdfGenerator';
import CoverLetterHero from './CoverLetterHero';
import CoverLetterTemplateSelector from './CoverLetterTemplateSelector';

import { SEOHead } from "../../components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../../utils/seo";
import { getSEOConfig } from "../../utils/seoPages";

import { templates } from './constants/templates';
import {
  validatePhoneForCountry,
  getPhoneValidationMessage,
  generateLetter,
} from './utils';
import {
  ClassicPreview,
  ModernPreview,
  MinimalPreview,
  ProfessionalPreview,
  ExecutivePreview,
  CreativePreview,
} from './components';

import { localStorageCoverLetterService } from './services/coverLetterService';
import { CoverLetterData, CoverLetterTemplateId } from './types/coverLetterTypes';

import {
  loadImageFromIDB,
  saveImageToIDB,
  deleteImageFromIDB,
  getPhotoKey,
  getDraftPhotoKey,
} from '../cv-builder/utils/imageUtils';

import {
  CVExtractedData,
  getCVCount,
  listUserCVs,
  extractDataFromCV,
} from './utils/cvDataFetcher';
import { CVDocumentMeta } from '../cv-builder/types/documentTypes';
// ✅ NEW: same country list that Step1Details uses (for CV phone -> country code mapping)
import { countryCodes } from './constants/cvDefaults';
import { syncService } from '../../services/sync/syncService';
import { SYNC_CONFIG } from '../../services/sync/config';

// ✅ NEW: FeedbackFullScreen (single-screen feedback)
import FeedbackFullScreen from '../../components/feedback/FeedbackFullScreen';
import {
  shouldShowFeedback,
  markFeedbackShown,
} from '../../services/feedbackService';

import { useSidebar } from '../../hooks/useSidebar';
import { usePNGDownload } from '../cv-builder/hooks/usePNGDownload';
import GlobalSidebar from '../../components/global/GlobalSidebar';

const STORAGE_KEY = 'cover_letter_data';
const TEMPLATE_STORAGE_KEY = 'adin-selected-cover-template';

const isRealPhoto = (p: string | null | undefined): boolean => {
  return !!p && typeof p === 'string' && p.length > 500;
};

// ✅ NEW: default country code (same as the form's initial value)
const DEFAULT_COUNTRY_CODE = '+92';

const dialDigits = (c: { code: string; dialCode?: string }): string =>
  (c.dialCode || c.code).replace(/\D/g, '');

// ✅ NEW: CV ka raw phone ("+92 300 1234567", "0092-300-...", "0300 1234567")
// ko form format me convert karta hai: { code, digits }.
// code = countryCodes list ka `code` (wahi jo Step1Details me use hota hai)
const parsePhoneForForm = (raw: string, currentCode: string): { code: string; digits: string } => {
  const trimmed = (raw || '').trim();
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return { code: currentCode, digits: '' };

  const isInternational = trimmed.startsWith('+') || trimmed.startsWith('00');

  if (isInternational) {
    if (trimmed.startsWith('00')) digits = digits.slice(2);

    // Sabse lamba matching dial code (taake +1 aur +1242 confuse na hon)
    let best = 0;
    for (const c of countryCodes) {
      const d = dialDigits(c);
      if (d && digits.startsWith(d) && d.length > best) best = d.length;
    }

    if (best > 0) {
      const national = digits.slice(best).replace(/^0+/, '');
      const candidates = countryCodes.filter(
        (c) => dialDigits(c).length === best && digits.startsWith(dialDigits(c))
      );
      // Same dial code wale countries me se wo lo jiski digit length match kare
      const match = candidates.find((c) => c.length === national.length) || candidates[0];
      return { code: match.code, digits: national };
    }
    return { code: currentCode, digits };
  }

  // Local number (bina +): current country rakho, sirf trunk "0" hatao (0300... -> 300...)
  const cur = countryCodes.find((c) => c.code === currentCode);
  if (cur && digits.startsWith('0') && digits.length === cur.length + 1) {
    digits = digits.slice(1);
  }
  return { code: currentCode, digits };
};

const stripImageFromData = (data: any) => {
  if (!data || typeof data !== 'object') return data;
  const copy = { ...data };
  if (copy.profilePhoto && typeof copy.profilePhoto === 'string' && copy.profilePhoto.length > 500) {
    copy.profilePhoto = null;
    copy.hasPhoto = true;
  }
  return copy;
};

const saveToLocalStorage = (data: any) => {
  try {
    const stripped = stripImageFromData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
    return { ok: true };
  } catch (e: any) {
    if (e?.name === 'QuotaExceededError' || e?.code === 22) {
      console.error('❌ localStorage FULL — cover letter not saved locally');
      try {
        toast.error(
          'Storage full! Your cover letter is saved to cloud only.',
          { duration: 6000, id: 'cl-storage-full' }
        );
      } catch {}
      return { ok: false, error: 'quota_exceeded' };
    }
    console.error('Error saving:', e);
    return { ok: false, error: 'unknown' };
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { console.error('Error loading:', e); }
  return null;
};

const VALID_TEMPLATE_IDS: CoverLetterTemplateId[] = [
  'classic',
  'modern',
  'minimal',
  'professional',
  'executive',
  'creative',
];

const isValidTemplate = (t: any): t is CoverLetterTemplateId =>
  typeof t === 'string' && VALID_TEMPLATE_IDS.includes(t as CoverLetterTemplateId);

const preserveHasPhoto = (userId: string, documentId: string | null | undefined, incoming: boolean): boolean => {
  if (incoming === true) return true;
  if (!documentId || !userId) return incoming;
  try {
    const key = `adin_cover_letter_document_${userId}_${documentId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return incoming;
    const existing = JSON.parse(raw);
    if (existing?.hasPhoto === true) return true;
    return incoming;
  } catch {
    return incoming;
  }
};

interface DownloadDropdownProps {
  onCopy?: () => void | Promise<void>;
  onDownloadPDF?: () => void | Promise<void>;
  onDownloadTXT?: () => void | Promise<void>;
  onDownloadPNG?: () => void | Promise<void>;
}

const DownloadDropdown: React.FC<DownloadDropdownProps> = ({
  onCopy,
  onDownloadPDF,
  onDownloadTXT,
  onDownloadPNG,
}) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const run = (fn?: () => void | Promise<void>) => {
    if (!fn) return;
    setOpen(false);
    try {
      const r = fn();
      if (r && typeof (r as Promise<void>).catch === 'function') {
        (r as Promise<void>).catch(err => console.error(err));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Download size={13} />
        <span>Download</span>
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 shadow-2xl shadow-black/10 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <button
            role="menuitem"
            onClick={() => run(onCopy)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
          >
            <Copy size={13} className="text-emerald-600 flex-shrink-0" />
            Copy Letter
          </button>

          <div className="h-px bg-slate-100" />

          <button
            role="menuitem"
            onClick={() => run(onDownloadPDF)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
          >
            <Download size={13} className="text-purple-600 flex-shrink-0" />
            Download PDF
          </button>

          <div className="h-px bg-slate-100" />

          <button
            role="menuitem"
            onClick={() => run(onDownloadPNG)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
          >
            <ImageIcon size={13} className="text-purple-600 flex-shrink-0" />
            Download PNG
          </button>

          <div className="h-px bg-slate-100" />

          <button
            role="menuitem"
            onClick={() => run(onDownloadTXT)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
          >
            <FileText size={13} className="text-slate-700 flex-shrink-0" />
            Plain Text
          </button>
        </div>
      )}
    </div>
  );
};

interface CoverLetterProps {
  onBackToHome?: () => void;
  initialTemplateId?: string;
  userId?: string;
  documentId?: string;
  onBackToDocuments?: () => void;
  onDocumentCreated?: (documentId: string) => void;
  onTemplateChange?: (template: CoverLetterTemplateId) => void;
}

type TabType = 'edit' | 'preview';

type SectionKey = 'personal' | 'job' | 'experience' | 'skills';

// ✅ NEW: named constants for CV fetch (no magic values)
const EMPTY_TEXT = '';
const ALL_SECTIONS_OPEN: Record<SectionKey, boolean> = {
  personal: true,
  job: true,
  experience: true,
  skills: true,
};

// ✅ NEW: "Restore previous" — CV fetch se pehle ka poora form data + CV link state
const RESTORE_TOAST_DURATION_MS = 10000;
const RESTORE_TOAST_ID = 'cl-restore-previous';
const FETCH_TOAST_DURATION_MS = 3000;

// ✅ NEW: premium CV panel styling — ek hi green signal ("Synced" pill), baaki sab neutral/subtle
const CV_PANEL_BASE_CLASS = 'mb-4 rounded-2xl border bg-white transition-all duration-300';
const CV_PANEL_IDLE_CLASS = 'border-slate-200 shadow-sm';
const CV_PANEL_SYNCED_CLASS = 'border-emerald-200/70 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-100';
const CV_DETECTED_PILL_CLASS = 'inline-flex items-center rounded-full bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700';
const CV_DETECTED_FADE_STAGGER_MS = 60;
const CV_DETECTED_FADE_CLASS = 'cv-detected-fade';
const CV_DETECTED_FADE_KEYFRAMES = 'cv-detected-fade-in';
const CV_DETECTED_FADE_DURATION_MS = 400;
const CV_DETECTED_FADE_OFFSET_PX = 4;

const FORM_TEXT_KEYS = [
  'userName', 'email', 'phoneNumber', 'address', 'linkedin',
  'jobTitle', 'company', 'jobDescription', 'hiringManagerName', 'currentPosition',
  'currentTitle', 'currentCompany', 'yearsOfExperience', 'experience', 'education', 'projects',
  'skills', 'additionalInfo',
] as const;

type FormTextKey = typeof FORM_TEXT_KEYS[number];

type FormSnapshot = Record<FormTextKey, string> & {
  selectedCountryCode: string; // ✅ NEW: so "Restore previous" also restores the country code
  cvDataLoaded: boolean;
  cvSourceId: string | null;
  cvData: CVExtractedData | null;
  selectedCVId: string | null;
  lastAppliedCV: CVExtractedData | null;
};

const DEFAULT_OPEN_STATE: Record<SectionKey, boolean> = {
  personal: true,
  job: false,
  experience: false,
  skills: false,
};

// ✅ NEW: helpers for the permanent CV autofill panel
const CV_NONE = '__none__'; // "None" option in the CV picker (default)

const getCVEditedAt = (cv: CVDocumentMeta): unknown => {
  const c = cv as any;
  return c?.lastEdited ?? c?.updatedAt ?? c?.lastModified ?? null;
};

const formatCVEditedAgo = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  let t = typeof value === 'number' ? value : new Date(value as any).getTime();
  if (!t || isNaN(t)) return null;
  if (t < 1e12) t *= 1000;
  const mins = Math.floor((Date.now() - t) / 60000);
  if (mins < 1) return 'Edited just now';
  if (mins < 60) return `Edited ${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Edited ${hrs} hr${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `Edited ${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Edited ${months} mo ago`;
  return `Edited ${Math.floor(months / 12)} yr ago`;
};

const CoverLetter = ({
  onBackToHome,
  initialTemplateId,
  userId = 'anonymous_user',
  documentId,
  onBackToDocuments,
  onDocumentCreated,
  onTemplateChange,
}: CoverLetterProps) => {
  const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar();

  const [generating, setGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplateId>(() => {
    if (isValidTemplate(initialTemplateId)) return initialTemplateId;
    try {
      const saved = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      if (isValidTemplate(saved)) return saved;
    } catch (e) {}
    return 'classic';
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const pngPreviewRef = useRef<HTMLDivElement>(null);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({ ...DEFAULT_OPEN_STATE });

  // ✅ Auto-reveal: section open hone par (mobile + desktop dono) wo section view me aa jaye
  const openSectionsRef = useRef(openSections);
  openSectionsRef.current = openSections;
  const lastPointerTargetRef = useRef<EventTarget | null>(null);
  const revealCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const onDown = (e: Event) => { lastPointerTargetRef.current = e.target; };
    document.addEventListener('pointerdown', onDown, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      revealCleanupRef.current?.();
    };
  }, []);

  const revealSection = useCallback((key: SectionKey) => {
    try {
      // Header button dhoondo: pehle last pointer target, phir focused element
      const candidates = [lastPointerTargetRef.current, document.activeElement];
      lastPointerTargetRef.current = null;
      let btn: HTMLElement | null = null;
      for (const c of candidates) {
        if (c instanceof HTMLElement) {
          const b = c.closest<HTMLElement>('button[aria-expanded]');
          if (b) { btn = b; break; }
        }
      }
      const byId = document.getElementById(`section-${key}`);
      const anchor: HTMLElement | null = byId || btn;
      if (!anchor) return;

      const wrapper: HTMLElement =
        byId || btn!.closest<HTMLElement>('section') || btn!.parentElement || btn!;
      const controlledId = btn?.getAttribute('aria-controls');
      const controlled = controlledId ? document.getElementById(controlledId) : null;

      // Nearest scrollable parent (mobile: main div, desktop: left column)
      let scroller: HTMLElement | null = anchor.parentElement;
      while (scroller) {
        const oy = window.getComputedStyle(scroller).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && scroller.scrollHeight > scroller.clientHeight + 1) break;
        scroller = scroller.parentElement;
      }

      const M = 12;
      const bottomMargin = M + (window.innerWidth < 640 ? 80 : 0); // mobile fixed bottom bar

      const run = () => {
        if (!anchor.isConnected) return;
        const sc = scroller ? scroller.getBoundingClientRect() : null;
        const scTop = sc ? sc.top : 0;
        const viewH = scroller ? scroller.clientHeight : window.innerHeight;
        const top = anchor.getBoundingClientRect().top - scTop;
        const wRect = wrapper.getBoundingClientRect();
        const cRect = controlled ? controlled.getBoundingClientRect() : null;
        const bottom = Math.max(wRect.bottom, cRect ? cRect.bottom : 0) - scTop;

        const fits = bottom - top <= viewH - M - bottomMargin;
        let delta = 0;
        if (!fits || top < M) delta = top - M;
        else if (bottom > viewH - bottomMargin) delta = bottom - viewH + bottomMargin;
        if (Math.abs(delta) < 2) return;

        if (scroller) scroller.scrollBy({ top: delta, behavior: 'smooth' });
        else window.scrollBy({ top: delta, behavior: 'smooth' });
      };

      // Pehle ki pending reveal cancel karo
      revealCleanupRef.current?.();

      // Accordion animation ke baad bhi re-check (height badalti hai)
      const timers: number[] = [];
      const target: EventTarget = scroller || window;
      const cancel = () => {
        timers.forEach(t => window.clearTimeout(t));
        ['wheel', 'touchstart', 'keydown'].forEach(ev => target.removeEventListener(ev, cancel));
        if (revealCleanupRef.current === cancel) revealCleanupRef.current = null;
      };
      // User khud scroll kare to auto-scroll ruk jaye
      ['wheel', 'touchstart', 'keydown'].forEach(ev =>
        target.addEventListener(ev, cancel, { passive: true })
      );
      revealCleanupRef.current = cancel;
      timers.push(window.setTimeout(run, 60));
      timers.push(window.setTimeout(() => { run(); cancel(); }, 380));
    } catch (err) {
      // Scroll sirf enhancement hai — kabhi UI ko break na kare
      console.warn('revealSection failed', err);
    }
  }, []);

  const toggleSection = useCallback((key: SectionKey) => {
    const willOpen = !openSectionsRef.current[key];
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
    if (willOpen) revealSection(key);
  }, [revealSection]);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [originalLetter, setOriginalLetter] = useState('');
  const [projects, setProjects] = useState('');
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [currentPosition, setCurrentPosition] = useState('');

  const [hiringManagerName, setHiringManagerName] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<string>('');
  const [cvDataLoaded, setCvDataLoaded] = useState(false);
  const [cvSourceId, setCvSourceId] = useState<string | null>(null);

  const [cvData, setCvData] = useState<CVExtractedData | null>(null);
  const [cvList, setCvList] = useState<CVDocumentMeta[]>([]);
  const [selectedCVId, setSelectedCVId] = useState<string | null>(null);
  // ✅ NEW: remembers what the previously selected CV auto-filled, so switching CVs can replace it (but never manual edits)
  const lastAppliedCVRef = useRef<CVExtractedData | null>(null);
  const [isLoadingCV, setIsLoadingCV] = useState(false);
  // ✅ NEW: the CV autofill panel is permanent now (no dismiss) — these two control its list/compact state
  const [cvListReady, setCvListReady] = useState(false);
  const [cvPanelCompact, setCvPanelCompact] = useState<boolean | null>(null);

  const [mobileActiveTab, setMobileActiveTab] = useState<TabType>('edit');
  const [isMobile, setIsMobile] = useState(false);

  const [internalDocumentId, setInternalDocumentId] = useState<string | null>(documentId || null);
  const documentCreationAttempted = useRef(false);
  const documentCreationTimer = useRef<NodeJS.Timeout | null>(null);
  const internalDocumentIdRef = useRef<string | null>(documentId || null);

  // ✅ Single feedback modal state (no widget)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSourceKey, setFeedbackSourceKey] = useState('cover-letter');

  const [hasSaved, setHasSaved] = useState(true);

  const { downloadPNG } = usePNGDownload({
    elementRef: pngPreviewRef,
    fileName: userName || jobTitle || 'My_Cover_Letter',
    toastId: 'cl-png',
  });

  // ✅ Mobile: preview is only mounted when the Preview tab is open.
  //    If the user hits "Download PNG" from the export buttons while it is
  //    closed, mount a hidden off-screen preview just for the capture.
  const [pngOffscreen, setPngOffscreen] = useState(false);

  const handleDownloadPNG = useCallback(() => {
    if (pngPreviewRef.current) return downloadPNG();
    setPngOffscreen(true);
  }, [downloadPNG]);

  useEffect(() => {
    if (!pngOffscreen) return;
    let cancelled = false;
    (async () => {
      try {
        await (document as any).fonts?.ready;
        await new Promise<void>((r) =>
          requestAnimationFrame(() => requestAnimationFrame(() => r()))
        );
        await new Promise((r) => setTimeout(r, 300));
        if (!cancelled && pngPreviewRef.current) await downloadPNG();
      } finally {
        if (!cancelled) setPngOffscreen(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pngOffscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleToggleFullscreen = useCallback(async (element: HTMLElement | null) => {
    if (!element) return;
    try {
      if (!document.fullscreenElement) {
        await element.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('[CoverLetter] Fullscreen toggle failed:', err);
    }
  }, []);

  useEffect(() => {
    if (isValidTemplate(initialTemplateId)) {
      setSelectedTemplate((prev) => {
        if (prev !== initialTemplateId) {
          console.log(`🔄 CoverLetter: Template synced from prop: ${prev} → ${initialTemplateId}`);
          return initialTemplateId;
        }
        return prev;
      });
    }
  }, [initialTemplateId]);

  useEffect(() => {
    if (isInitialLoad) {
      return;
    }
    try {
      localStorage.setItem(TEMPLATE_STORAGE_KEY, selectedTemplate);
    } catch (e) {}
  }, [selectedTemplate, isInitialLoad]);

  // ✅ NEW: always holds the latest form values, so handleCVSelect can snapshot them without extra deps
  const latestFormRef = useRef<FormSnapshot | null>(null);
  latestFormRef.current = {
    userName, email, phoneNumber, address, linkedin,
    jobTitle, company, jobDescription, hiringManagerName, currentPosition,
    currentTitle, currentCompany, yearsOfExperience, experience, education, projects,
    skills, additionalInfo,
    selectedCountryCode, // ✅ NEW
    cvDataLoaded, cvSourceId, cvData, selectedCVId,
    lastAppliedCV: lastAppliedCVRef.current,
  };

  const restorePreviousForm = useCallback((snap: FormSnapshot) => {
    setUserName(snap.userName);
    setEmail(snap.email);
    setPhoneNumber(snap.phoneNumber);
    setSelectedCountryCode(snap.selectedCountryCode); // ✅ NEW
    setAddress(snap.address);
    setLinkedin(snap.linkedin);
    setJobTitle(snap.jobTitle);
    setCompany(snap.company);
    setJobDescription(snap.jobDescription);
    setHiringManagerName(snap.hiringManagerName);
    setCurrentPosition(snap.currentPosition);
    setCurrentTitle(snap.currentTitle);
    setCurrentCompany(snap.currentCompany);
    setYearsOfExperience(snap.yearsOfExperience);
    setExperience(snap.experience);
    setEducation(snap.education);
    setProjects(snap.projects);
    setSkills(snap.skills);
    setAdditionalInfo(snap.additionalInfo);

    lastAppliedCVRef.current = snap.lastAppliedCV;
    setCvDataLoaded(snap.cvDataLoaded);
    setCvSourceId(snap.cvSourceId);
    setCvData(snap.cvData);
    setSelectedCVId(snap.selectedCVId);
  }, []);

  const applyCVDataToForm = useCallback((data: CVExtractedData) => {
    // ✅ UPDATED: jab bhi CV fetch ho → saare sections ka purana data (manual bhi) remove,
    // aur sirf selected CV ka data form mein aaye. CV mein jo field nahi hai wo empty rahegi.

    // Personal section
    setUserName(data.name || EMPTY_TEXT);
    setEmail(data.email || EMPTY_TEXT);

    // ✅ FIX: phone → digits only + country code CV ke hisab se
    // (pehle sirf raw phone set hota tha aur country code purana hi rehta tha)
    const parsedPhone = parsePhoneForForm(
      data.phone,
      latestFormRef.current?.selectedCountryCode || DEFAULT_COUNTRY_CODE
    );
    setPhoneNumber(parsedPhone.digits || EMPTY_TEXT);
    setSelectedCountryCode(parsedPhone.code);

    setAddress(data.address || EMPTY_TEXT);
    setLinkedin(data.linkedin || EMPTY_TEXT);

    // Job section (target job — CV se nahi aata, isliye clear)
    setJobTitle(EMPTY_TEXT);
    setCompany(EMPTY_TEXT);
    setJobDescription(EMPTY_TEXT);
    setHiringManagerName(EMPTY_TEXT);
    setCurrentPosition(EMPTY_TEXT);

    // Experience section
    setCurrentTitle(data.currentTitle || EMPTY_TEXT);
    setCurrentCompany(data.currentCompany || EMPTY_TEXT);
    setYearsOfExperience(data.yearsOfExperience > 0 ? String(data.yearsOfExperience) : EMPTY_TEXT);
    setExperience(EMPTY_TEXT);
    setEducation(EMPTY_TEXT);
    setProjects(EMPTY_TEXT);

    // Skills section
    setSkills(data.skills || EMPTY_TEXT);
    setAdditionalInfo(EMPTY_TEXT);

    lastAppliedCVRef.current = data;
    setCvDataLoaded(true);
    setCvSourceId(data.sourceId);
    setCvData(data);
    setOpenSections({ ...ALL_SECTIONS_OPEN });
  }, []);

  useEffect(() => {
    if (!userId) return;

    // ✅ NEW: panel is permanent → the CV list is ALWAYS loaded (new docs, saved docs, after refresh).
    // Nothing is auto-filled — the picker starts on "None" and the user chooses a CV.
    let cancelled = false;

    (async () => {
      try {
        setIsLoadingCV(true);
        const count = await getCVCount(userId);
        if (cancelled) return;

        if (count === 0) {
          setCvList([]);
          setCvListReady(true);
          setIsLoadingCV(false);
          return;
        }

        const list = await listUserCVs(userId);
        if (cancelled) return;
        setCvList(list);
        setCvListReady(true);
        setIsLoadingCV(false);
      } catch (e) {
        console.error('[CoverLetter] Failed to fetch CV data:', e);
        setCvListReady(true);
        setIsLoadingCV(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId, documentId]);

  const handleCVSelect = useCallback(async (cvId: string) => {
    if (!cvId || !userId) return;
    try {
      setIsLoadingCV(true);

      const data = await extractDataFromCV(userId, cvId);
      if (data) {
        // ✅ NEW: CV apply hone se pehle purana data save karo (restore ke liye)
        const previous: FormSnapshot | null = latestFormRef.current
          ? { ...latestFormRef.current, lastAppliedCV: lastAppliedCVRef.current }
          : null;
        const hadPreviousData = !!previous && FORM_TEXT_KEYS.some((key) => previous[key].trim());

        applyCVDataToForm(data);
        // ✅ NEW: keep panel in sync + give feedback
        setSelectedCVId(cvId);
        setCvPanelCompact(true);

        // ✅ NEW: neutral toast (no green tick) — status already panel mein "Synced" se dikhta hai
        const renderFetchToast = (toastId: string, onRestore?: () => void) => (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <Sparkles size={15} className="text-purple-600" strokeWidth={2.2} />
            </span>
            <span className="text-sm text-slate-800">
              Details fetched from "{data.sourceTitle}"
            </span>
            {onRestore && (
              <button
                type="button"
                onClick={() => {
                  onRestore();
                  toast.dismiss(toastId);
                  toast.success('Previous data restored');
                }}
                className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700"
              >
                Restore previous
              </button>
            )}
          </div>
        );

        if (previous && hadPreviousData) {
          toast.custom(
            (t) => renderFetchToast(t.id, () => restorePreviousForm(previous)),
            { id: RESTORE_TOAST_ID, duration: RESTORE_TOAST_DURATION_MS }
          );
        } else {
          toast.custom((t) => renderFetchToast(t.id), { duration: FETCH_TOAST_DURATION_MS });
        }
      } else {
        toast.error('Could not read this CV');
      }
    } catch (e) {
      console.error('[CoverLetter] Failed to extract CV:', e);
      toast.error('Failed to load CV data');
    } finally {
      setIsLoadingCV(false);
    }
  }, [userId, applyCVDataToForm, restorePreviousForm]);

  // ✅ NEW: "None" → disconnect from the CV AND remove the values that CV auto-filled
  // (fields the user edited manually are kept)
  const handleUnlinkCV = useCallback(async () => {
    let filled: CVExtractedData | null = lastAppliedCVRef.current;

    // After a refresh the ref is empty — rebuild what the linked CV had filled in
    if (!filled && cvSourceId && userId) {
      try {
        filled = await extractDataFromCV(userId, cvSourceId);
      } catch (e) {
        console.warn('[CoverLetter] Could not read linked CV while disconnecting:', e);
      }
    }

    if (filled) {
      const same = (current: string, filledValue?: string) =>
        !!filledValue && current.trim() === filledValue.trim();

      if (same(userName, filled.name)) setUserName('');
      if (same(email, filled.email)) setEmail('');

      // ✅ FIX: state me phone digits-only hota hai, isliye parsed value se compare karo
      const parsedPhone = parsePhoneForForm(filled.phone, selectedCountryCode);
      if (parsedPhone.digits && phoneNumber.trim() === parsedPhone.digits) {
        setPhoneNumber('');
        setSelectedCountryCode(DEFAULT_COUNTRY_CODE); // CV ka country code bhi hata do
      }

      if (same(address, filled.address)) setAddress('');
      if (same(linkedin, filled.linkedin)) setLinkedin('');
      if (same(currentTitle, filled.currentTitle)) setCurrentTitle('');
      if (same(skills, filled.skills)) setSkills('');
      if (same(currentCompany, filled.currentCompany)) setCurrentCompany('');
      if (filled.yearsOfExperience > 0 && yearsOfExperience.trim() === String(filled.yearsOfExperience)) {
        setYearsOfExperience('');
      }
    }

    setCvData(null);
    setCvDataLoaded(false);
    setCvSourceId(null);
    setSelectedCVId(null);
    setCvPanelCompact(true); // close the picker after disconnecting
    lastAppliedCVRef.current = null;
    toast.success('CV disconnected. Autofilled details were removed.');
  }, [userId, cvSourceId, userName, email, phoneNumber, selectedCountryCode, address, linkedin, currentTitle, skills, currentCompany, yearsOfExperience]);

  useEffect(() => {
    if (documentId && documentId !== internalDocumentId) {
      setInternalDocumentId(documentId);
      internalDocumentIdRef.current = documentId;
      documentCreationAttempted.current = true;
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
      setInternalDocumentId(null);
      internalDocumentIdRef.current = null;
      documentCreationAttempted.current = false;
      setGeneratedLetter('');
      setOriginalLetter('');
    }
  }, [documentId]);

  useEffect(() => {
    internalDocumentIdRef.current = internalDocumentId;
  }, [internalDocumentId]);

  useEffect(() => {
    if (!documentId) return;
    if (isRealPhoto(profilePhoto)) return;

    let cancelled = false;
    (async () => {
      try {
        const img = await loadImageFromIDB(getPhotoKey(documentId));
        if (!cancelled && img) {
          setProfilePhoto(img);
        }
      } catch (e) {
        console.error('❌ CoverLetter: Failed to load photo from IDB:', e);
      }
    })();

    return () => { cancelled = true; };
  }, [documentId, profilePhoto]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const stateRef = useRef({
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, projects, currentPosition,
    hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
  });

  useEffect(() => {
    stateRef.current = {
      userName, email, phoneNumber, selectedCountryCode, address, linkedin,
      education, experience, skills, jobTitle, company, jobDescription,
      additionalInfo, profilePhoto, selectedStyle, projects, currentPosition,
      hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
    };
  }, [
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, projects, currentPosition,
    hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
  ]);

  useEffect(() => {
    if (documentId) {
      (async () => {
        try {
          const doc = await localStorageCoverLetterService.get(userId, documentId);
          if (doc?.data) {
            const d: any = doc.data;
            setUserName(d.userName || '');
            setEmail(d.email || '');
            setPhoneNumber(d.phoneNumber || '');
            setSelectedCountryCode(d.selectedCountryCode || '+92');
            setAddress(d.address || '');
            setLinkedin(d.linkedin || '');
            setEducation(d.education || '');
            setExperience(d.experience || '');
            setSkills(d.skills || '');
            setJobTitle(d.jobTitle || '');
            setCompany(d.company || '');
            setJobDescription(d.jobDescription || '');
            setAdditionalInfo(d.additionalInfo || '');
            setSelectedStyle(d.selectedStyle || 'professional');

            if (isValidTemplate(d.selectedTemplate) && !isValidTemplate(initialTemplateId)) {
              setSelectedTemplate(d.selectedTemplate);
            }

            setGeneratedLetter(d.generatedLetter || '');
            setOriginalLetter(d.originalLetter || '');
            setProjects(d.projects || '');
            setIsEnhanced(d.isEnhanced || false);
            setCurrentPosition(d.currentPosition || '');

            setHiringManagerName(d.hiringManagerName || '');
            setCurrentTitle(d.currentTitle || '');
            setCurrentCompany(d.currentCompany || '');
            setYearsOfExperience(
              d.yearsOfExperience !== undefined && d.yearsOfExperience !== null
                ? String(d.yearsOfExperience)
                : ''
            );
            setCvDataLoaded(!!d.cvDataLoaded);
            setCvSourceId(d.cvSourceId || null);
          }
        } catch (e) { console.error('Load failed:', e); }
        finally { setIsInitialLoad(false); }
      })();
      return;
    }

    const savedData = loadFromLocalStorage();
    if (savedData) {
      setUserName(savedData.userName || '');
      setEmail(savedData.email || '');
      setPhoneNumber(savedData.phoneNumber || '');
      setSelectedCountryCode(savedData.selectedCountryCode || '+92');
      setAddress(savedData.address || '');
      setLinkedin(savedData.linkedin || '');
      setEducation(savedData.education || '');
      setExperience(savedData.experience || '');
      setSkills(savedData.skills || '');
      setJobTitle(savedData.jobTitle || '');
      setCompany(savedData.company || '');
      setJobDescription(savedData.jobDescription || '');
      setAdditionalInfo(savedData.additionalInfo || '');
      setSelectedStyle(savedData.selectedStyle || 'professional');

      if (isValidTemplate(savedData.selectedTemplate) && !isValidTemplate(initialTemplateId)) {
        setSelectedTemplate(savedData.selectedTemplate);
      }

      setGeneratedLetter(savedData.generatedLetter || '');
      setOriginalLetter(savedData.originalLetter || '');
      setProjects(savedData.projects || '');
      setIsEnhanced(savedData.isEnhanced || false);
      setCurrentPosition(savedData.currentPosition || '');

      setHiringManagerName(savedData.hiringManagerName || '');
      setCurrentTitle(savedData.currentTitle || '');
      setCurrentCompany(savedData.currentCompany || '');
      setYearsOfExperience(
        savedData.yearsOfExperience !== undefined && savedData.yearsOfExperience !== null
          ? String(savedData.yearsOfExperience)
          : ''
      );
      setCvDataLoaded(!!savedData.cvDataLoaded);
      setCvSourceId(savedData.cvSourceId || null);

      if (savedData.hasPhoto && !documentId) {
        (async () => {
          try {
            const img = await loadImageFromIDB(getDraftPhotoKey(userId));
            if (img) {
              setProfilePhoto(img);
            }
          } catch (e) {
            console.error('Failed to load draft photo:', e);
          }
        })();
      }
    }
    setIsInitialLoad(false);
  }, [initialTemplateId, documentId, userId]);

  useEffect(() => {
    if (isInitialLoad) return;

    setHasSaved(false);
    const t = setTimeout(() => setHasSaved(true), 400);

    const hasRealPhoto = isRealPhoto(profilePhoto);
    const preservedHasPhoto = preserveHasPhoto(userId, internalDocumentIdRef.current, hasRealPhoto);

    const data: CoverLetterData = {
      userName, email, phoneNumber, selectedCountryCode, address, linkedin,
      education, experience, skills, jobTitle, company, jobDescription,
      additionalInfo,
      profilePhoto: null,
      hasPhoto: preservedHasPhoto,
      selectedStyle, selectedTemplate,
      generatedLetter, originalLetter, step: 1, projects, isEnhanced,
      currentPosition,
      hiringManagerName,
      currentTitle,
      currentCompany,
      yearsOfExperience: yearsOfExperience ? Number(yearsOfExperience) : undefined,
      cvDataLoaded,
      cvSourceId: cvSourceId || undefined,
      lastUpdated: Date.now(),
    } as any;

    const currentDocId = internalDocumentIdRef.current;

    if (currentDocId) {
      localStorageCoverLetterService.update(userId, currentDocId, data);
    } else {
      const hasMeaningfulData = !!(
        userName?.trim() || email?.trim() || jobTitle?.trim() || generatedLetter?.trim() || hasRealPhoto
      );

      if (hasMeaningfulData && !documentCreationAttempted.current) {
        if (documentCreationTimer.current) {
          clearTimeout(documentCreationTimer.current);
        }

        documentCreationTimer.current = setTimeout(async () => {
          if (documentCreationAttempted.current) return;
          if (internalDocumentIdRef.current) return;

          documentCreationAttempted.current = true;
          try {
            const meta = await localStorageCoverLetterService.createEmpty(userId);

            await localStorageCoverLetterService.update(userId, meta.id, data);

            if (isRealPhoto(profilePhoto)) {
              try {
                await saveImageToIDB(getPhotoKey(meta.id), profilePhoto!);
                await deleteImageFromIDB(getDraftPhotoKey(userId));
              } catch (imgErr) {
                console.error('Failed to move draft photo:', imgErr);
              }
            }

            setInternalDocumentId(meta.id);
            internalDocumentIdRef.current = meta.id;

            onDocumentCreated?.(meta.id);
          } catch (e: any) {
            console.error('[CoverLetter] Creation failed:', e);
            documentCreationAttempted.current = false;
          }
        }, 300);
      }
    }

    saveToLocalStorage(data);

    return () => {
      clearTimeout(t);
    };
  }, [
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, selectedTemplate,
    generatedLetter, originalLetter, projects, isEnhanced,
    currentPosition, isInitialLoad, userId, onDocumentCreated,
    hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
    cvDataLoaded, cvSourceId,
  ]);

  useEffect(() => {
    return () => {
      if (documentCreationTimer.current) {
        clearTimeout(documentCreationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isInitialLoad) return;
    const docId = internalDocumentIdRef.current;
    if (!docId) return;
    if (!userId) return;

    const timer = setTimeout(() => {
      const now = Date.now();
      syncService.syncCoverLetter({
        userId,
        clId: docId,
        data: {
          userName, email, phoneNumber, selectedCountryCode, address, linkedin,
          education, experience, skills, jobTitle, company, jobDescription,
          additionalInfo,
          hasPhoto: isRealPhoto(profilePhoto),
          selectedStyle, selectedTemplate,
          generatedLetter, originalLetter, projects, isEnhanced,
          currentPosition,
          hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
          cvDataLoaded, cvSourceId,
          openSections,
        },
        title: jobTitle?.trim() || userName?.trim() || 'Untitled Cover Letter',
        template: selectedTemplate,
        createdAt: now,
        updatedAt: now,
      }).catch(err => {
        console.warn('[CoverLetter] Sheet sync failed (queued for retry):', err);
      });
    }, SYNC_CONFIG.idleDebounceMs);

    return () => clearTimeout(timer);
  }, [
    isInitialLoad,
    userId,
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, selectedTemplate,
    generatedLetter, originalLetter, projects, isEnhanced,
    currentPosition, hiringManagerName, currentTitle, currentCompany,
    yearsOfExperience, cvDataLoaded, cvSourceId, openSections,
  ]);

  useEffect(() => {
    if (isInitialLoad) return;

    const forceSync = (label: string, warnLabel: string) => {
      const docId = internalDocumentIdRef.current;
      if (!docId) return;
      if (!userId) return;
      if (isInitialLoad) return;

      const now = Date.now();
      console.log(`[CoverLetter] ${label} — force syncing CL to Sheet`);

      syncService.syncCoverLetter({
        userId,
        clId: docId,
        data: {
          userName, email, phoneNumber, selectedCountryCode, address, linkedin,
          education, experience, skills, jobTitle, company, jobDescription,
          additionalInfo,
          hasPhoto: isRealPhoto(profilePhoto),
          selectedStyle, selectedTemplate,
          generatedLetter, originalLetter, projects, isEnhanced,
          currentPosition,
          hiringManagerName, currentTitle, currentCompany, yearsOfExperience,
          cvDataLoaded, cvSourceId,
          openSections,
        },
        title: jobTitle?.trim() || userName?.trim() || 'Untitled Cover Letter',
        template: selectedTemplate,
        createdAt: now,
        updatedAt: now,
      }).catch(err => {
        console.warn(`[CoverLetter] ${warnLabel}-triggered sync failed (queued):`, err);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') return;
      forceSync('visibility hidden', 'visibility');
    };

    const handlePageHide = () => {
      forceSync('pagehide', 'pagehide');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    };
  }, [
    isInitialLoad,
    userId,
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, selectedTemplate,
    generatedLetter, originalLetter, projects, isEnhanced,
    currentPosition, hiringManagerName, currentTitle, currentCompany,
    yearsOfExperience, cvDataLoaded, cvSourceId, openSections,
  ]);

  const handlePhotoUpload = async (dataUrl: string) => {
    setProfilePhoto(dataUrl);

    try {
      let docId = internalDocumentIdRef.current;

      if (!docId) {
        const meta = await localStorageCoverLetterService.createEmpty(userId);
        docId = meta.id;
        internalDocumentIdRef.current = meta.id;
        setInternalDocumentId(meta.id);
        documentCreationAttempted.current = true;

        if (documentCreationTimer.current) {
          clearTimeout(documentCreationTimer.current);
          documentCreationTimer.current = null;
        }

        onDocumentCreated?.(meta.id);
      }

      await saveImageToIDB(getPhotoKey(docId), dataUrl);

      try {
        await localStorageCoverLetterService.update(userId, docId, {
          ...stateRef.current,
          profilePhoto: null,
          hasPhoto: true,
          lastUpdated: Date.now(),
        } as any);
      } catch (e: any) {
        if (e?.name === 'QuotaExceededError' || e?.code === 22) {
          console.error('❌ localStorage FULL — cover letter photo save failed locally');
          try {
            toast.error('Storage full! Photo saved to cloud only.', { duration: 5000 });
          } catch {}
        } else {
          console.error('Cover letter update failed:', e);
        }
      }
    } catch (err) {
      console.error('❌ Failed to save photo to IndexedDB:', err);
    }
  };

  const handlePhotoRemove = async () => {
    setProfilePhoto(null);

    try {
      const docId = internalDocumentIdRef.current;
      if (docId) {
        await deleteImageFromIDB(getPhotoKey(docId));

        try {
          await localStorageCoverLetterService.update(userId, docId, {
            ...stateRef.current,
            profilePhoto: null,
            hasPhoto: false,
            lastUpdated: Date.now(),
          } as any);
        } catch (e: any) {
          if (e?.name === 'QuotaExceededError' || e?.code === 22) {
            console.error('❌ localStorage FULL — cover letter update failed');
          }
        }
      } else {
        await deleteImageFromIDB(getDraftPhotoKey(userId));
      }
    } catch (err) {
      console.error('❌ Failed to delete photo from IndexedDB:', err);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will clear ALL your cover letter data!')) {
      const docId = internalDocumentIdRef.current;
      if (docId && userId) {
        syncService.deleteCoverLetter(userId, docId).catch(err => {
          console.warn('[CoverLetter] Sheet delete failed (queued for retry):', err);
        });
      }
      setUserName(''); setEmail(''); setPhoneNumber('');
      setSelectedCountryCode('+92'); setAddress(''); setLinkedin('');
      setEducation(''); setExperience(''); setSkills('');
      setJobTitle(''); setCompany(''); setJobDescription('');
      setAdditionalInfo(''); setProfilePhoto(null);
      setSelectedStyle('professional'); setSelectedTemplate('classic');
      setGeneratedLetter(''); setOriginalLetter(''); setProjects('');
      setIsEnhanced(false); setCurrentPosition('');
      setHiringManagerName(''); setCurrentTitle(''); setCurrentCompany('');
      setYearsOfExperience(''); setCvDataLoaded(false); setCvSourceId(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TEMPLATE_STORAGE_KEY);
      toast.success('All data cleared!');
    }
  };

  const isPhoneValid = validatePhoneForCountry(phoneNumber, selectedCountryCode);
  const phoneValidationMessage = getPhoneValidationMessage(phoneNumber, selectedCountryCode);

  const handleSkillsChange = (value: string) => {
    let formatted = value.replace(/\s*,\s*/g, ', ').trim();
    formatted = formatted.replace(/,+/g, ',');
    formatted = formatted.replace(/\s+,/g, ',');
    formatted = formatted.replace(/,(\S)/g, ', $1');
    setSkills(formatted);
  };

  const copyToClipboard = () => {
    if (!generatedLetter) { toast.error('Generate a letter first'); return; }
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Copied!');
  };

  const downloadTXT = () => {
    if (!generatedLetter) { toast.error('Generate a letter first'); return; }
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${jobTitle.replace(/\s/g, '_') || 'application'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT downloaded!');
  };

  const downloadPDF = async () => {
    if (!generatedLetter) { toast.error('Generate a letter first'); return; }
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const pdfBlob = await generateCoverLetterPDF({
        userName, email, phoneNumber, selectedCountryCode, address, linkedin,
        jobTitle, company, education, experience, skills, additionalInfo,
        generatedLetter, selectedStyle, profilePhoto, selectedTemplate,
        hiringManagerName,
      });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover_letter_${(jobTitle || 'application').replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'pdf' });
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  const handleGenerateLetter = () => {
    const s = stateRef.current;

    if (!s.userName?.trim()) { toast.error('Please fill your full name'); return; }
    if (!s.email || !s.email.includes('@gmail.com')) { toast.error('Please enter a valid Gmail address'); return; }
    if (!s.phoneNumber) { toast.error('Please enter your phone number'); return; }
    if (!validatePhoneForCountry(s.phoneNumber, s.selectedCountryCode)) { toast.error('Please enter a valid phone number'); return; }
    if (!s.jobTitle?.trim()) { toast.error('Please fill target job title'); return; }
    if (!s.company?.trim()) { toast.error('Please fill target company'); return; }
    if (!s.jobDescription?.trim()) { toast.error('Please fill job description'); return; }
    if (!s.skills?.trim()) { toast.error('Please add at least one skill'); return; }

    const params = {
      userName: s.userName,
      email: s.email,
      phoneNumber: s.phoneNumber,
      education: s.education,
      jobTitle: s.jobTitle,
      company: s.company,
      experience: s.experience,
      skills: s.skills,
      projects: s.projects,
      additionalInfo: s.additionalInfo,
      selectedStyle: s.selectedStyle,
      currentPosition: s.currentPosition,
      isPhoneValid: validatePhoneForCountry(s.phoneNumber, s.selectedCountryCode),
      hiringManagerName: s.hiringManagerName,
      currentTitle: s.currentTitle,
      currentCompany: s.currentCompany,
      yearsOfExperience: s.yearsOfExperience
        ? Number(s.yearsOfExperience)
        : undefined,
      jobDescription: s.jobDescription,
      setGenerating,
      setGeneratedLetter,
      setOriginalLetter,
      setIsEnhanced,
      setStep: () => {},
    };

    generateLetter(params);
  };

  const getLivePreview = () => {
    if (generatedLetter) return generatedLetter;
    let preview = '';
    preview += `${userName || '[Your Name]'}\n\n`;
    preview += `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;
    preview += `Hiring Manager\n${company || '[Company Name]'}\n\n`;
    preview += `RE: Application for ${jobTitle || '[Job Title]'}\n\n`;
    preview += `Dear Hiring Manager,\n\n`;
    preview += `I am excited to apply for the ${jobTitle || '[Job Title]'} position at ${company || '[Company]'}. `;
    if (experience) preview += `With a strong foundation in ${experience}, `;
    preview += `I am eager to contribute to a team that delivers innovative solutions.\n\n`;
    if (projects) preview += `My experience includes ${projects}. `;
    if (skills) preview += `I bring expertise in ${skills}. `;
    preview += `\n\nI would welcome the opportunity to discuss how I can contribute. Thank you.`;
    return preview;
  };

  const livePreview = getLivePreview();
  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleMobileTabClick = (tabId: TabType) => {
    setMobileActiveTab(tabId);
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .main-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .main-scroll::-webkit-scrollbar-track { background: transparent; }
      .main-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #7c3aed);
        border-radius: 10px;
      }
      .main-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #9333ea, #6d28d9);
      }
      .main-scroll { scrollbar-width: thin; scrollbar-color: #a855f7 transparent; }

      .left-column-scroll::-webkit-scrollbar,
      .right-column-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
      .left-column-scroll::-webkit-scrollbar-track,
      .right-column-scroll::-webkit-scrollbar-track { background: transparent; }
      .left-column-scroll::-webkit-scrollbar-thumb,
      .right-column-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #7c3aed);
        border-radius: 10px;
      }
      .left-column-scroll::-webkit-scrollbar-thumb:hover,
      .right-column-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #9333ea, #6d28d9);
      }
      .left-column-scroll,
      .right-column-scroll {
        scrollbar-width: thin;
        scrollbar-color: #a855f7 transparent;
      }

      .smooth-scroll { scroll-behavior: smooth; }
      * { scroll-behavior: smooth; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (generatedLetter && !generating) {
      const shouldShow = shouldShowFeedback('cover-letter');
      if (shouldShow) {
        setFeedbackSourceKey('cover-letter');
        setTimeout(() => setShowFeedbackModal(true), 500);
      }
    }
  }, [generatedLetter, generating]);

  // ✅ UPDATED: Feedback close handler — dispatches event for PIN education popup
  const handleFeedbackModalClose = useCallback(() => {
    setShowFeedbackModal(false);
    markFeedbackShown('cover-letter');

    window.dispatchEvent(new CustomEvent('adin-feedback-closed', {
      detail: { source: 'cover-letter' }
    }));
  }, []);

  // ✅ NEW: permanent "Smart CV Autofill" panel — always rendered at the very top of the form
  const renderCVBanner = () => {
    if (!userId) return null;

    // Loading skeleton (first load only)
    if (!cvListReady) {
      return (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 max-w-full rounded-full bg-slate-100 animate-pulse" />
            <div className="h-2.5 w-56 max-w-full rounded-full bg-slate-100 animate-pulse" />
          </div>
        </div>
      );
    }

    // Empty state — no saved CVs
    if (cvList.length === 0) {
      return (
        <div className="mb-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-slate-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Smart CV Autofill</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                No saved CV found yet. Create one in the CV Builder and your details will autofill here in one click.
              </p>
            </div>
          </div>
        </div>
      );
    }

    const linkedCV = cvSourceId ? cvList.find((cv) => cv.id === cvSourceId) || null : null;
    const isSynced = cvDataLoaded && !!linkedCV;

    // Selection: explicit choice → linked CV (if synced) → None (default)
    const chosen =
      selectedCVId === CV_NONE
        ? CV_NONE
        : selectedCVId && cvList.some((cv) => cv.id === selectedCVId)
          ? selectedCVId
          : isSynced && linkedCV
            ? linkedCV.id
            : CV_NONE;
    const isNoneSelected = chosen === CV_NONE;
    const activeCVId = isNoneSelected ? null : chosen;

    const isSameAsLinked = isSynced && activeCVId === cvSourceId;
    const linkedTitle = cvData?.sourceTitle || linkedCV?.title || 'Untitled CV';
    const isCompact = cvPanelCompact === null ? true : cvPanelCompact; // ✅ NEW: closed by default — opens only when the user taps "Choose CV" / "Change CV"
    const isDisconnectMode = isNoneSelected && isSynced;

    // Quick summary chips of what was detected (only right after a fetch)
    const detected: string[] = [];
    if (isSynced && cvData && cvData.sourceId === cvSourceId) {
      if (cvData.name) detected.push(cvData.name);
      if (cvData.currentTitle) {
        detected.push(cvData.currentCompany ? `${cvData.currentTitle} @ ${cvData.currentCompany}` : cvData.currentTitle);
      }
      if (cvData.yearsOfExperience > 0) {
        detected.push(`${cvData.yearsOfExperience} ${cvData.yearsOfExperience === 1 ? 'yr' : 'yrs'} experience`);
      }
      const skillCount = cvData.skills ? cvData.skills.split(',').filter((x) => x.trim()).length : 0;
      if (skillCount > 0) detected.push(`${skillCount} skills`);
    }

    const radioDot = (selected: boolean) => (
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
          selected ? 'border-purple-600 bg-purple-600' : 'border-slate-300 bg-white'
        }`}
      >
        {selected && <Check size={11} className="text-white" strokeWidth={3.5} />}
      </span>
    );

    const optionClass = (selected: boolean) =>
      `group w-full flex items-center gap-3 rounded-xl border p-2.5 text-left transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
        selected
          ? 'border-purple-500 bg-purple-50/60'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`;

    return (
      <div className={`${CV_PANEL_BASE_CLASS} ${isSynced ? CV_PANEL_SYNCED_CLASS : CV_PANEL_IDLE_CLASS}`}>
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
                <Sparkles size={18} className="text-white" strokeWidth={2.2} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Smart CV Autofill</h3>
                {isSynced ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Synced
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {cvList.length} {cvList.length === 1 ? 'CV' : 'CVs'} found
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSynced ? (
                  <>
                    Connected to <span className="font-medium text-slate-700">"{linkedTitle}"</span>
                  </>
                ) : (
                  'Pick a CV to fill your details in one click.'
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCvPanelCompact(isCompact ? false : true)}
              className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {isCompact ? (isSynced ? 'Change CV' : 'Choose CV') : isSynced ? 'Done' : 'Close'}
              <ChevronDown size={13} className={`transition-transform duration-200 ${isCompact ? '' : 'rotate-180'}`} />
            </button>
          </div>

          {/* Detected summary — clean pills (no ticks, no commas) */}
          {detected.length > 0 && (
            <>
              <style>{`
                @keyframes ${CV_DETECTED_FADE_KEYFRAMES} { from { opacity: 0; transform: translateY(${CV_DETECTED_FADE_OFFSET_PX}px); } to { opacity: 1; transform: translateY(0); } }
                .${CV_DETECTED_FADE_CLASS} { animation: ${CV_DETECTED_FADE_KEYFRAMES} ${CV_DETECTED_FADE_DURATION_MS}ms ease-out both; }
              `}</style>
              <div className="mt-3 flex flex-wrap gap-2">
                {detected.map((d, i) => (
                  <span
                    key={d}
                    className={`${CV_DETECTED_FADE_CLASS} ${CV_DETECTED_PILL_CLASS}`}
                    style={{ animationDelay: `${i * CV_DETECTED_FADE_STAGGER_MS}ms` }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* CV picker + Auto-fetch button */}
          {!isCompact && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Choose a CV</span>
                <span className="text-[11px] text-slate-400">{cvList.length} saved</span>
              </div>

              {/* ✅ NEW: purple themed scrollbar for the CV list */}
              <style>{`
                .cv-picker-scroll { scrollbar-width: thin; scrollbar-color: #c084fc transparent; }
                .cv-picker-scroll::-webkit-scrollbar { width: 6px; }
                .cv-picker-scroll::-webkit-scrollbar-track { background: transparent; }
                .cv-picker-scroll::-webkit-scrollbar-thumb { background: #d8b4fe; border-radius: 9999px; }
                .cv-picker-scroll::-webkit-scrollbar-thumb:hover { background: #a855f7; }
              `}</style>
              <div className="cv-picker-scroll max-h-60 overflow-y-auto space-y-2 pr-1" role="radiogroup" aria-label="Choose a CV to autofill from">
                {/* ✅ NEW: "None" option (default) */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={isNoneSelected}
                  onClick={() => setSelectedCVId(CV_NONE)}
                  className={optionClass(isNoneSelected)}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isNoneSelected
                        ? 'bg-purple-600 border-purple-600 text-white'
                        : 'bg-white border-dashed border-slate-300 text-slate-400 group-hover:border-slate-400 group-hover:text-slate-500'
                    }`}
                  >
                    <Ban size={17} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">None</p>
                    <p className="text-[11px] text-slate-500 truncate">Don't autofill from a CV</p>
                  </div>
                  {radioDot(isNoneSelected)}
                </button>

                {cvList.map((cv) => {
                  const isSelected = cv.id === activeCVId;
                  const isLinked = cvDataLoaded && cv.id === cvSourceId;
                  const edited = formatCVEditedAgo(getCVEditedAt(cv));
                  const label = cv.title || 'Untitled CV';
                  return (
                    <button
                      key={cv.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedCVId(cv.id)}
                      className={optionClass(isSelected)}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold transition-colors ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}
                      >
                        {label.trim().charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{label}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {isLinked ? `Currently synced${edited ? ` · ${edited}` : ''}` : edited || 'Saved CV'}
                        </p>
                      </div>
                      {radioDot(isSelected)}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isNoneSelected) {
                    if (isSynced) handleUnlinkCV();
                    return;
                  }
                  if (activeCVId) handleCVSelect(activeCVId);
                }}
                disabled={isLoadingCV || (isNoneSelected && !isSynced)}
                className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500/30 disabled:cursor-not-allowed ${
                  isDisconnectMode
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:text-slate-400'
                    : 'bg-purple-600 text-white hover:bg-purple-700 disabled:bg-slate-100 disabled:text-slate-400'
                }`}
              >
                {isLoadingCV ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-500 animate-spin" />
                    Fetching details...
                  </>
                ) : isDisconnectMode ? (
                  <>
                    <Ban size={15} strokeWidth={2} />
                    Disconnect CV
                  </>
                ) : isNoneSelected ? (
                  <>
                    <Zap size={15} strokeWidth={2.4} />
                    Select a CV to autofill
                  </>
                ) : isSameAsLinked ? (
                  <>
                    <RefreshCw size={15} strokeWidth={2.4} />
                    Re-fetch from this CV
                  </>
                ) : (
                  <>
                    <Zap size={15} strokeWidth={2.4} />
                    Auto-fetch details
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-slate-400">
                {isNoneSelected && !isSynced
                  ? 'Nothing is filled until you pick a CV.'
                  : 'Your manual edits are never overwritten.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
      <button
        onClick={copyToClipboard}
        aria-label="Copy Cover Letter"
        className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
          <Copy size={19} className="text-white" strokeWidth={2.4} />
        </div>
        <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
          Copy Letter
        </span>
      </button>

      <button
        onClick={downloadPDF}
        aria-label="Download PDF"
        className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 focus:outline-none focus:ring-4 focus:ring-purple-500/15 transition-all duration-200"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
          <Download size={19} className="text-white" strokeWidth={2.4} />
        </div>
        <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
          Download PDF
        </span>
      </button>

      <button
        onClick={handleDownloadPNG}
        aria-label="Download PNG"
        className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 focus:outline-none focus:ring-4 focus:ring-purple-500/15 transition-all duration-200"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-500 flex items-center justify-center shadow-sm shadow-fuchsia-500/25 group-hover:scale-105 transition-transform duration-200">
          <ImageIcon size={19} className="text-white" strokeWidth={2.4} />
        </div>
        <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
          Download PNG
        </span>
      </button>

      <button
        onClick={downloadTXT}
        aria-label="Download TXT"
        className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-500/10 focus:outline-none focus:ring-4 focus:ring-slate-500/15 transition-all duration-200"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-sm shadow-slate-500/25 group-hover:scale-105 transition-transform duration-200">
          <FileText size={19} className="text-white" strokeWidth={2.4} />
        </div>
        <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
          Plain Text
        </span>
      </button>
    </div>
  );

  const renderPreview = () => {
    const previewProps = {
      letter: generatedLetter || livePreview,
      photo: profilePhoto,
      name: userName,
      title: jobTitle,
      email: email,
      phone: phoneNumber,
      countryCode: selectedCountryCode,
      userAddress: address,
      linkedinUrl: linkedin,
      companyName: company,
      hiringManagerName: hiringManagerName,
    };

    switch (selectedTemplate) {
      case 'classic':
        return <ClassicPreview {...previewProps} />;
      case 'modern':
        return <ModernPreview {...previewProps} />;
      case 'minimal':
        return <MinimalPreview {...previewProps} />;
      case 'professional':
        return <ProfessionalPreview {...previewProps} />;
      case 'executive':
        return <ExecutivePreview {...previewProps} />;
      case 'creative':
        return <CreativePreview {...previewProps} />;
      default:
        return <ClassicPreview {...previewProps} />;
    }
  };

  if (isMobile) {
    return (
      <>
        <SEOHead
          title={getSEOConfig('cover-letter').title}
          description={getSEOConfig('cover-letter').description}
          keywords={getSEOConfig('cover-letter').keywords}
          canonicalUrl={getSEOConfig('cover-letter').canonicalUrl}
          ogType="website"
        />
        <script type="application/ld+json">
          {generateJSONLDScript(generatePageSchemas('cover-letter'))}
        </script>

        <div
          ref={containerRef}
          className="h-screen flex flex-col bg-slate-100 main-scroll smooth-scroll overflow-hidden"
        >
          {/* ✅ Single global toaster lives in App.tsx (AdinToaster). A second one here made every toast show twice. */}


          <CoverLetterHero
            onOpenSidebar={openSidebar}
            saveStatus={hasSaved ? 'saved' : 'saving'}
          />

          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden pb-24 min-h-0 ${
              mobileActiveTab !== 'edit' ? 'hidden' : 'block'
            }`}
          >
            <div className="w-full px-3 py-4">
              <div className="max-w-7xl mx-auto">
                {renderCVBanner()}

                <Step1Details
                  userName={userName} setUserName={setUserName}
                  email={email} setEmail={setEmail}
                  phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                  selectedCountryCode={selectedCountryCode} setSelectedCountryCode={setSelectedCountryCode}
                  address={address} setAddress={setAddress}
                  linkedin={linkedin} setLinkedin={setLinkedin}
                  education={education} setEducation={setEducation}
                  experience={experience} setExperience={setExperience}
                  skills={skills} setSkills={handleSkillsChange}
                  jobTitle={jobTitle} setJobTitle={setJobTitle}
                  company={company} setCompany={setCompany}
                  jobDescription={jobDescription} setJobDescription={setJobDescription}
                  additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={async (photo) => {
                    if (photo) await handlePhotoUpload(photo);
                    else await handlePhotoRemove();
                  }}
                  projects={projects} setProjects={setProjects}
                  currentPosition={currentPosition} setCurrentPosition={setCurrentPosition}
                  onNext={handleGenerateLetter}
                  generating={generating}
                  hiringManagerName={hiringManagerName}
                  setHiringManagerName={setHiringManagerName}
                  currentTitle={currentTitle}
                  setCurrentTitle={setCurrentTitle}
                  currentCompany={currentCompany}
                  setCurrentCompany={setCurrentCompany}
                  yearsOfExperience={yearsOfExperience}
                  setYearsOfExperience={setYearsOfExperience}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />

                {generatedLetter && !generating && (
                  <div className="space-y-5 mt-5">
                    <div className="rounded-2xl p-5 bg-white border border-purple-200 shadow-sm text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-600/20">
                        <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Cover Letter Ready</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Your professional cover letter is ready to download
                      </p>
                    </div>

                    {renderActionButtons()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => handleMobileTabClick('edit')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                    mobileActiveTab === 'edit'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Pencil size={18} className="flex-shrink-0" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleMobileTabClick('preview')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                    mobileActiveTab === 'preview'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Eye size={18} className="flex-shrink-0" />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Preview tab — full pane (same as CV Builder mobile), not a bottom sheet */}
          {mobileActiveTab === 'preview' && (
            <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden pb-24 bg-slate-100">
              <div className="w-full p-2">
                <div className="flex items-center justify-between gap-3 mb-4 px-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Eye size={18} className="text-purple-600 flex-shrink-0" />
                    <h3 className="text-sm font-semibold text-purple-600 truncate">
                      Live Preview
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(true)}
                      aria-label="Give feedback"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[11px] font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                    >
                      <MessageCircle size={12} />
                      <span>Feedback</span>
                    </button>

                    <DownloadDropdown
                      onCopy={copyToClipboard}
                      onDownloadPDF={downloadPDF}
                      onDownloadTXT={downloadTXT}
                      onDownloadPNG={downloadPNG}
                    />
                  </div>
                </div>

                <div ref={pngPreviewRef}>
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-0.5">
                      {renderPreview()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Hidden off-screen preview — mounted ONLY while a PNG export is running */}
          {pngOffscreen && mobileActiveTab !== 'preview' && (
            <div
              aria-hidden="true"
              style={{
                position: 'fixed',
                top: 0,
                left: '-10000px',
                width: window.innerWidth,
                pointerEvents: 'none',
              }}
            >
              <div ref={pngPreviewRef}>
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-0.5">
                    {renderPreview()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <GlobalSidebar
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            currentPage="cover-letter"
          />

          {/* ✅ UPDATED: Single-screen feedback modal */}
          <FeedbackFullScreen
            isOpen={showFeedbackModal}
            onClose={handleFeedbackModalClose}
            source="cover-letter"
          />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={getSEOConfig('cover-letter').title}
        description={getSEOConfig('cover-letter').description}
        keywords={getSEOConfig('cover-letter').keywords}
        canonicalUrl={getSEOConfig('cover-letter').canonicalUrl}
        ogType="website"
      />
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('cover-letter'))}
      </script>

      <div
        ref={containerRef}
        className="h-screen flex flex-col bg-slate-100 smooth-scroll overflow-hidden"
      >
        {/* ✅ Single global toaster lives in App.tsx (AdinToaster). A second one here made every toast show twice. */}
        <CoverLetterHero
          onOpenSidebar={openSidebar}
          saveStatus={hasSaved ? 'saved' : 'saving'}
        />

        <CoverLetterTemplateSelector
          template={selectedTemplate}
          onTemplateChange={(t) => {
            setSelectedTemplate(t);
            onTemplateChange?.(t);
          }}
        />

        <div className="flex-1 overflow-hidden w-full px-3 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 h-full">

              <div className="left-column-scroll overflow-y-auto overflow-x-hidden pr-2 pb-6 space-y-6 h-full">
                {renderCVBanner()}

                <Step1Details
                  userName={userName} setUserName={setUserName}
                  email={email} setEmail={setEmail}
                  phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                  selectedCountryCode={selectedCountryCode} setSelectedCountryCode={setSelectedCountryCode}
                  address={address} setAddress={setAddress}
                  linkedin={linkedin} setLinkedin={setLinkedin}
                  education={education} setEducation={setEducation}
                  experience={experience} setExperience={setExperience}
                  skills={skills} setSkills={handleSkillsChange}
                  jobTitle={jobTitle} setJobTitle={setJobTitle}
                  company={company} setCompany={setCompany}
                  jobDescription={jobDescription} setJobDescription={setJobDescription}
                  additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
                  profilePhoto={profilePhoto}
                  setProfilePhoto={async (photo) => {
                    if (photo) await handlePhotoUpload(photo);
                    else await handlePhotoRemove();
                  }}
                  projects={projects} setProjects={setProjects}
                  currentPosition={currentPosition} setCurrentPosition={setCurrentPosition}
                  onNext={handleGenerateLetter}
                  generating={generating}
                  hiringManagerName={hiringManagerName}
                  setHiringManagerName={setHiringManagerName}
                  currentTitle={currentTitle}
                  setCurrentTitle={setCurrentTitle}
                  currentCompany={currentCompany}
                  setCurrentCompany={setCurrentCompany}
                  yearsOfExperience={yearsOfExperience}
                  setYearsOfExperience={setYearsOfExperience}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />

                {generatedLetter && !generating && (
                  <>
                    <div className="rounded-2xl p-5 bg-white border border-purple-200 shadow-sm text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-600/20">
                        <CheckCircle2 size={26} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Cover Letter Ready</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Your professional cover letter is ready to download
                      </p>
                    </div>

                    {renderActionButtons()}
                  </>
                )}
              </div>

              <div
                ref={fullscreenRef}
                className={`right-column-scroll overflow-y-auto overflow-x-hidden pb-6 space-y-6 h-full transition-colors ${
                  isFullscreen ? 'bg-slate-200 p-6' : 'pr-2'
                }`}
              >
                <div className="p-0">
                  <div className="flex items-center justify-between mb-3 py-2">
                    <h3 className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-purple-600 tracking-wide">
                      Live Preview
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowFeedbackModal(true)}
                        aria-label="Give feedback"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                      >
                        <MessageCircle size={13} />
                        <span>Feedback</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleFullscreen(fullscreenRef.current)}
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-purple-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                      >
                        {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                      </button>

                      <DownloadDropdown
                        onCopy={copyToClipboard}
                        onDownloadPDF={downloadPDF}
                        onDownloadTXT={downloadTXT}
                        onDownloadPNG={downloadPNG}
                      />
                    </div>
                  </div>

                  <div ref={pngPreviewRef}>
                    {isFullscreen ? (
                      <div className="p-0.5">
                        {renderPreview()}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-0.5">
                          {renderPreview()}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-center mt-3">
                    <div className="flex gap-1">
                      <div className="w-6 h-1 rounded-full bg-purple-500" />
                      <div className="w-4 h-1 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <GlobalSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          currentPage="cover-letter"
        />

        {/* ✅ UPDATED: Single-screen feedback modal */}
        <FeedbackFullScreen
          isOpen={showFeedbackModal}
          onClose={handleFeedbackModalClose}
          source="cover-letter"
        />
      </div>
    </>
  );
};

export default CoverLetter;
