// src/components/cover-letter/CoverLetter.tsx
// ✅ UPDATED: FeedbackFullScreen (single-screen, Design C) replaces FeedbackModal + Widget
// ✅ FIX: Removed widget visibility tracking

import { useState, useEffect, useRef, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Trash2, Copy, Download, FileText, Eye, CheckCircle2, Sparkles, X, ChevronDown, MessageCircle, Maximize, Minimize, Image as ImageIcon,
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
  fetchMostRecentCVData,
  getCVCount,
  listUserCVs,
  extractDataFromCV,
} from './utils/cvDataFetcher';
import { CVDocumentMeta } from '../cv-builder/types/documentTypes';
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

type TabType = 'preview';

type SectionKey = 'personal' | 'job' | 'experience' | 'skills';

const DEFAULT_OPEN_STATE: Record<SectionKey, boolean> = {
  personal: true,
  job: false,
  experience: false,
  skills: false,
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

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+92');
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
  const [isLoadingCV, setIsLoadingCV] = useState(false);
  const [cvBannerDismissed, setCvBannerDismissed] = useState(false);

  const [mobileActiveTab, setMobileActiveTab] = useState<TabType | null>(null);
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

  const applyCVDataToForm = useCallback((data: CVExtractedData) => {
    if (!userName.trim() && data.name) setUserName(data.name);
    if (!email.trim() && data.email) setEmail(data.email);
    if (!phoneNumber.trim() && data.phone) setPhoneNumber(data.phone);
    if (!address.trim() && data.address) setAddress(data.address);
    if (!linkedin.trim() && data.linkedin) setLinkedin(data.linkedin);
    if (!currentTitle.trim() && data.currentTitle) setCurrentTitle(data.currentTitle);
    if (!skills.trim() && data.skills) setSkills(data.skills);

    setCvDataLoaded(true);
    setCvSourceId(data.sourceId);
    setCvData(data);
  }, [userName, email, phoneNumber, address, linkedin, currentTitle, skills]);

  useEffect(() => {
    if (!userId) return;
    if (documentId) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoadingCV(true);
        const count = await getCVCount(userId);
        if (cancelled) return;

        if (count === 0) {
          setIsLoadingCV(false);
          return;
        }

        if (count === 1) {
          const data = await fetchMostRecentCVData(userId);
          if (cancelled) return;
          if (data) applyCVDataToForm(data);
          setIsLoadingCV(false);
          return;
        }

        const list = await listUserCVs(userId);
        if (cancelled) return;
        setCvList(list);
        setSelectedCVId(list[0]?.id || null);
        setIsLoadingCV(false);
      } catch (e) {
        console.error('[CoverLetter] Failed to fetch CV data:', e);
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
      if (data) applyCVDataToForm(data);
    } catch (e) {
      console.error('[CoverLetter] Failed to extract CV:', e);
      toast.error('Failed to load CV data');
    } finally {
      setIsLoadingCV(false);
    }
  }, [userId, applyCVDataToForm]);

  const handleDismissCVBanner = useCallback(() => {
    setCvBannerDismissed(true);
    setCvData(null);
    setCvDataLoaded(false);
    setCvSourceId(null);
  }, []);

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
    setMobileActiveTab(mobileActiveTab === tabId ? null : tabId);
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

  const renderCVBanner = () => {
    if (cvBannerDismissed) return null;
    if (!userId) return null;
    if (documentId) return null;

    if (isLoadingCV) {
      return (
        <div className="mb-4 rounded-2xl p-4 bg-purple-50 border border-purple-200 flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin shrink-0" />
          <p className="text-sm text-purple-700 font-medium">Loading your CV data...</p>
        </div>
      );
    }

    if (cvList.length === 0 && !cvData) return null;

    if (cvList.length > 1) {
      return (
        <div className="mb-4 rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">Auto-fill from CV</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    We found {cvList.length} CVs. Choose one to auto-fill your details.
                  </p>
                </div>
                <button
                  onClick={handleDismissCVBanner}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>

              <select
                value={selectedCVId || ''}
                onChange={(e) => {
                  setSelectedCVId(e.target.value);
                  if (e.target.value) handleCVSelect(e.target.value);
                }}
                className="mt-3 w-full rounded-lg bg-white border border-purple-200 text-slate-900 text-sm font-medium outline-none transition-all px-3 py-2.5 cursor-pointer focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10"
              >
                <option value="">Select a CV...</option>
                {cvList.map((cv) => (
                  <option key={cv.id} value={cv.id}>
                    {cv.title || 'Untitled CV'}
                  </option>
                ))}
              </select>

              {cvDataLoaded && cvData && (
                <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  Data loaded from "{cvData.sourceTitle}"
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (cvDataLoaded && cvData) {
      return (
        <div className="mb-4 rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">Auto-filled from your CV</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    We used "{cvData.sourceTitle}" to pre-fill your personal details. You can edit any field.
                  </p>
                </div>
                <button
                  onClick={handleDismissCVBanner}
                  className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
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
        onClick={downloadPNG}
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
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid rgba(168, 85, 247, 0.25)',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                boxShadow: '0 20px 60px -10px rgba(2, 6, 23, 0.15)',
              },
              success: { style: { border: '1px solid rgba(34, 197, 94, 0.3)' } },
              error: { style: { border: '1px solid rgba(239, 68, 68, 0.3)' } },
              loading: { style: { border: '1px solid rgba(168, 85, 247, 0.3)' } },
            }}
          />

          <CoverLetterHero
            onOpenSidebar={openSidebar}
            saveStatus={hasSaved ? 'saved' : 'saving'}
          />

          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24 min-h-0">
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

          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => handleMobileTabClick('preview')}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 ${
                    mobileActiveTab === 'preview'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  <Eye size={18} />
                  <span>Preview</span>
                </button>
              </div>
            </div>
          </div>

          {mobileActiveTab === 'preview' && (
            <div className="fixed bottom-20 left-0 right-0 z-10 max-h-[60vh] overflow-auto bg-slate-100 border-t border-slate-200 rounded-t-2xl shadow-2xl p-4">
              <div className="max-w-7xl mx-auto">
                <div className="p-0">
                  <div className="flex items-center justify-between mb-3 py-2">
                    <h3 className="text-xs font-semibold flex items-center gap-2 text-purple-600 tracking-wide">
                      <Eye size={13} />
                      Live Preview
                    </h3>
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
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              boxShadow: '0 20px 60px -10px rgba(2, 6, 23, 0.15)',
            },
            success: { style: { border: '1px solid rgba(34, 197, 94, 0.3)' } },
            error: { style: { border: '1px solid rgba(239, 68, 68, 0.3)' } },
            loading: { style: { border: '1px solid rgba(168, 85, 247, 0.3)' } },
          }}
        />

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