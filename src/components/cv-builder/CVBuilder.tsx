// src/components/cv-builder/CVBuilder.tsx
// ✅ UPDATED: FeedbackFullScreen (single-screen, Design C)
// ✅ FIX: Removed local GlobalSidebar render
// ✅ FIX: Removed widget visibility tracking
// ✅ NEW: BackupReminderPopup on first Skills section open
// ✅ NEW: onDownloadId + onSetPin props from App.tsx
// ✅ KICKRESUME STYLE: previewData debounced state (800ms)
// ✅ KICKRESUME STYLE: useAutoSave debounce 1000ms
// ✅ KICKRESUME STYLE: Sheet sync effects throttled
// ✅ FIX: Removed duplicate Toaster (App.tsx renders the single global one)
// ✅ FIX: PDF/Preview now include entries with ANY filled field (not just "complete" ones)
//         - usable* arrays (OR logic) → for PDF/preview
//         - complete* arrays (AND logic) → for scoring/validation (unchanged behavior)

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle, X, Pencil, Eye,
  User, Briefcase, GraduationCap, Languages as LanguagesIcon,
  Zap, Award, FolderGit2, Trophy, FileText, Download,
} from 'lucide-react';

import { CVBuilderProps } from './types/cvTypes';

import { countryCodes } from './constants/cvDefaults';
import { defaultPersonalInfo } from './constants/cvDefaults';

import { loadSavedData, loadDocumentData, saveDocumentData, safeSaveDocument } from './utils/storageUtils';
import { validatePhoneNumber } from './utils/phoneValidation';
import { initializeAI } from './utils/aiGenerators';
import { getStrengthStatus } from './utils/atsCalculator';
import { generateTextPDF } from './utils/pdfGeneratorText';

import {
  loadImageFromIDB,
  saveImageToIDB,
  deleteImageFromIDB,
  getPhotoKey,
  getDraftPhotoKey,
} from './utils/imageUtils';

import { SEOHead } from '../../components/SEO/SEOHead';
import { generatePageSchemas, generateJSONLDScript } from '../../utils/seo';
import { getSEOConfig } from '../../utils/seoPages';

import { useAutoSave } from './hooks/useAutoSave';
import { useValidation } from './hooks/useValidation';
import { useScoreCalculation } from './hooks/useScoreCalculation';
import { useScrollSync } from './hooks/useScrollSync';
import { useActiveSection } from './hooks/useActiveSection';

// ✅ Sidebar toggle only — sidebar rendered in App.tsx
import { useSidebar } from '../../hooks/useSidebar';

import { createCVActions } from './handlers/cvActions';
import { createAIActions } from './handlers/aiActions';
import { createDownloadActions } from './handlers/downloadActions';

import HeaderToolbar from './components/HeaderToolbar';
import TemplateSelector from './components/TemplateSelector';
import AccordionSection from './components/AccordionSection';
import DownloadButtons from './components/DownloadButtons';
import SuccessCard from './components/SuccessCard';

import PersonalSection from './sections/PersonalSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';
import SkillsSection from './sections/SkillsSection';
import CertificationsSection from './sections/CertificationsSection';
import LanguagesSection from './sections/LanguagesSection';
import AchievementsSection from './sections/AchievementsSection';
import SummarySection from './sections/SummarySection';

import CVPreview, { CVPreviewHandle } from './preview/CVPreview';
import CVPreviewMobile from './preview/CVPreviewMobile';

// ✅ FeedbackFullScreen (Design C — single-screen feedback)
import FeedbackFullScreen from '../../components/feedback/FeedbackFullScreen';
import {
  shouldShowFeedback,
  markFeedbackShown,
} from '../../services/feedbackService';
import { syncService } from '../../services/sync/syncService';
import { SYNC_CONFIG } from '../../services/sync/config';

// ✅ NEW: Backup reminder popup
import BackupReminderPopup from '../../components/BackupReminderPopup';

// ✅ Click-to-focus scroll offsets
const EDITOR_SCROLL_OFFSET_PX = 12;
const PREVIEW_SCROLL_OFFSET_PX = 80;

// ✅ Throttle window — same section par itne ms ke andar dobara trigger nahi
const FIELD_INTERACT_THROTTLE_MS = 600;

// ✅ LocalStorage flag for backup reminder
const BACKUP_REMINDER_FLAG = 'adin-backup-reminder-shown';

// ✅ KICKRESUME STYLE: Preview debounce time
const PREVIEW_DEBOUNCE_MS = 800;

// ✅ KICKRESUME STYLE: Sheet sync throttle time
const SHEET_SYNC_THROTTLE_MS = 5000;

const isRealPhoto = (p: string | null | undefined): boolean => {
    return !!p && typeof p === 'string' && p.length > 500;
};

const createDefaultExperience = () => ({
    id: Date.now().toString(),
    title: '', company: '', startDate: '', endDate: '',
    description: '', location: '', currentlyWorking: false, highlights: []
});

const createDefaultEducation = () => ({
    id: Date.now().toString(),
    degree: '', institution: '', startDate: '', endDate: '',
    description: '', location: '', currentlyStudying: false
});

const createDefaultProject = () => ({
    id: Date.now().toString(),
    name: '', description: '', technologies: [],
    link: '', startDate: '', endDate: ''
});

const createDefaultCertification = () => ({
    id: Date.now().toString(),
    name: '', issuer: '', date: '', link: '', credentialId: ''
});

const createDefaultLanguage = () => ({
    id: Date.now().toString(),
    language: '', proficiency: ''
});

const createDefaultAchievement = () => ({
    id: Date.now().toString(),
    title: '', date: '', shortDescription: '', description: ''
});

type SectionKey =
    | 'personal' | 'experience' | 'education' | 'languages'
    | 'skills' | 'certifications' | 'projects' | 'achievements'
    | 'summary' | 'export';

const DEFAULT_OPEN_STATE: Record<SectionKey, boolean> = {
    personal: true,
    experience: false,
    education: false,
    languages: false,
    skills: false,
    certifications: false,
    projects: false,
    achievements: false,
    summary: false,
    export: false,
};

type MobileTab = 'edit' | 'preview';

const PREVIEW_TO_EDITOR_SECTION: Record<string, SectionKey> = {
    summary: 'summary',
    experience: 'experience',
    education: 'education',
    skills: 'skills',
    languages: 'languages',
    certifications: 'certifications',
    projects: 'projects',
    achievements: 'achievements',
    personal: 'personal',
};

// ============================================================
// ✅ BUTTER-SMOOTH AUTO SCROLL
// ============================================================
interface ChaseHooks {
    onStart?: () => void;
    onEnd?: () => void;
}

const activeChases = new WeakMap<HTMLElement, () => void>();

const chaseScroll = (
    scroller: HTMLElement,
    getTarget: () => number | null,
    opts: { minMs?: number; maxMs?: number; hooks?: ChaseHooks } = {}
) => {
    const { minMs = 0, maxMs = 1400, hooks } = opts;

    activeChases.get(scroller)?.();

    const initial = getTarget();
    if (initial == null) return;

    const clampTarget = (t: number) =>
        Math.max(0, Math.min(t, scroller.scrollHeight - scroller.clientHeight));

    if (minMs === 0 && Math.abs(clampTarget(initial) - scroller.scrollTop) < 1) return;

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
        scroller.scrollTop = clampTarget(initial);
        return;
    }

    const prevBehavior = scroller.style.scrollBehavior;
    scroller.style.scrollBehavior = 'auto';

    const distance = Math.abs(clampTarget(initial) - scroller.scrollTop);
    const omega = distance > 800 ? 8 : distance > 400 ? 10 : 12;

    let pos = scroller.scrollTop;
    let vel = 0;
    let lastActual = pos;
    let raf = 0;
    let done = false;
    const start = performance.now();
    let last = start;

    const userEvents: Array<keyof HTMLElementEventMap> = ['wheel', 'touchstart', 'keydown'];
    const onUser = () => finish();
    const onPointer = (e: Event) => {
        if (e.target === scroller) finish();
    };

    function finish() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        userEvents.forEach(ev => scroller.removeEventListener(ev, onUser));
        scroller.removeEventListener('pointerdown', onPointer);
        scroller.style.scrollBehavior = prevBehavior;
        if (activeChases.get(scroller) === finish) activeChases.delete(scroller);
        hooks?.onEnd?.();
    }

    userEvents.forEach(ev => scroller.addEventListener(ev, onUser, { passive: true }));
    scroller.addEventListener('pointerdown', onPointer);
    activeChases.set(scroller, finish);
    hooks?.onStart?.();

    const step = (now: number) => {
        if (done) return;

        const actual = scroller.scrollTop;
        if (Math.abs(actual - lastActual) > 1.5) {
            pos = actual;
            vel = 0;
        }

        let remaining = Math.min(now - last, 64) / 1000;
        last = now;

        const t = getTarget();
        const target = t == null ? pos : clampTarget(t);

        while (remaining > 0) {
            const h = Math.min(remaining, 1 / 120);
            remaining -= h;
            vel += (omega * omega * (target - pos) - 2 * omega * vel) * h;
            pos += vel * h;
        }
        scroller.scrollTop = pos;
        lastActual = scroller.scrollTop;

        const elapsed = now - start;
        const settled = Math.abs(target - pos) < 0.5 && Math.abs(vel) < 8;
        if ((settled && elapsed >= minMs) || elapsed >= maxMs) {
            if (t != null) scroller.scrollTop = target;
            finish();
            return;
        }
        raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
};

const scrollEditorToSection = (
    paneRef: React.RefObject<HTMLElement>,
    sectionKey: string,
    mode: 'fit' | 'reveal' | 'top',
    hooks?: ChaseHooks
) => {
    const pane = paneRef.current;
    if (!pane) return;
    const el = document.getElementById(`section-${sectionKey}`);
    if (!el) return;

    const M = EDITOR_SCROLL_OFFSET_PX;

    const getTarget = (): number | null => {
        const paneRect = pane.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        const topAbs = rect.top - paneRect.top + pane.scrollTop;

        const header = el.querySelector<HTMLElement>('button[aria-expanded]');
        const inner = document.getElementById(`section-${sectionKey}-content`)
            ?.firstElementChild as HTMLElement | null | undefined;
        const isOpen = header?.getAttribute('aria-expanded') === 'true';
        const height = header
            ? header.offsetHeight + (isOpen && inner ? inner.scrollHeight : 0) + 2
            : rect.height;

        const viewH = pane.clientHeight;
        const fits = height <= viewH - 2 * M;

        if (mode === 'top' || (mode === 'reveal' && !fits)) return topAbs - M;
        if (!fits) return null;

        const cur = pane.scrollTop;
        if (topAbs < cur + M) return topAbs - M;
        if (topAbs + height > cur + viewH - M) return topAbs + height - viewH + M;
        return cur;
    };

    chaseScroll(pane, getTarget, {
        minMs: mode === 'fit' ? 0 : 360,
        hooks,
    });
};

const scrollPreviewToSection = (
    previewPaneRef: React.RefObject<HTMLElement>,
    sectionKey: string,
    _offsetPx: number = PREVIEW_SCROLL_OFFSET_PX,
    hooks?: ChaseHooks
) => {
    if (!previewPaneRef.current) return;

    const candidates = document.querySelectorAll<HTMLElement>(
        `[data-section="${sectionKey}"]`
    );
    const visibleEl = Array.from(candidates).find((el) => {
        if (el.closest('[aria-hidden="true"]')) return false;
        const cs = window.getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.left > -1000;
    });
    if (!visibleEl) return;

    let scroller: HTMLElement | null = visibleEl.parentElement;
    while (scroller && scroller !== previewPaneRef.current.parentElement) {
        const cs = window.getComputedStyle(scroller);
        const isScrollY = cs.overflowY === 'auto' || cs.overflowY === 'scroll';
        if (isScrollY && scroller.scrollHeight > scroller.clientHeight + 1) break;
        scroller = scroller.parentElement;
    }
    if (!scroller) scroller = previewPaneRef.current;

    const containerRect = scroller.getBoundingClientRect();
    const elRect = visibleEl.getBoundingClientRect();
    const containerHeight = containerRect.height;

    const elTopInView = elRect.top - containerRect.top;

    const COMFY_TOP = containerHeight * 0.12;
    const COMFY_BOTTOM = containerHeight * 0.60;

    if (elTopInView >= COMFY_TOP && elTopInView <= COMFY_BOTTOM) {
        return;
    }

    const TARGET_TOP = Math.round(containerHeight * 0.18);

    const absoluteElTop =
        elRect.top - containerRect.top + scroller.scrollTop;

    let nextScrollTop = absoluteElTop - TARGET_TOP;

    const maxScrollTop = scroller.scrollHeight - scroller.clientHeight;
    nextScrollTop = Math.max(0, Math.min(nextScrollTop, maxScrollTop));

    if (Math.abs(nextScrollTop - scroller.scrollTop) < 4) return;

    chaseScroll(scroller, () => nextScrollTop, { hooks });
};

const CVBuilder: React.FC<CVBuilderProps> = ({
    userId,
    initialTemplateId,
    onBackToHome,
    documentId,
    onBackToDocuments,
    onDocumentCreated,
    onDownloadId,
    onSetPin,
}) => {
    const { open: openSidebar } = useSidebar();

    const editorPaneRef = useRef<HTMLDivElement>(null);
    const previewPaneRef = useRef<HTMLDivElement>(null);

    const previewHandleRef = useRef<CVPreviewHandle>(null);

    const lastFieldScrollRef = useRef<{ key: string; time: number }>({ key: '', time: 0 });

    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    );
    useEffect(() => {
        const onResize = () => setIsDesktop(window.innerWidth >= 1024);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const [savedData] = useState(() => {
        if (documentId) {
            const docData = loadDocumentData(userId, documentId);
            if (docData) {
                console.log('✅ CVBuilder: Loaded from document', documentId);
                return docData;
            }
            console.warn('⚠️ CVBuilder: Document not found, falling back to legacy key', documentId);
        }
        const legacyData = loadSavedData(userId);
        if (legacyData) {
            console.log('✅ CVBuilder: Loaded from legacy key');
        } else {
            console.log('ℹ️ CVBuilder: No saved data found — starting fresh');
        }
        return legacyData;
    });

    const validTemplates = ['modern', 'classic', 'minimal', 'executive', 'creative', 'academic', 'teal-curve', 'standard', 'ats-pro'];

    const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic' | 'teal-curve' | 'standard' | 'corporate' | 'ats-pro'>(() => {
        if (initialTemplateId && validTemplates.includes(initialTemplateId)) {
            return initialTemplateId as any;
        }
        if (documentId && savedData?.template && validTemplates.includes(savedData.template)) {
            return savedData.template;
        }
        if (savedData?.template && validTemplates.includes(savedData.template)) {
            return savedData.template;
        }
        return 'modern';
    });

    const [mobileTab, setMobileTab] = useState<MobileTab>('edit');

    const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>(() => {
        if (savedData?.openSections && typeof savedData.openSections === 'object') {
            const merged: any = { ...DEFAULT_OPEN_STATE, ...savedData.openSections };
            if (savedData.openSections.insights !== undefined && savedData.openSections.export === undefined) {
                merged.export = savedData.openSections.insights;
            }
            return merged;
        }
        return { ...DEFAULT_OPEN_STATE };
    });

    const [activeSection, setActiveSection] = useState<string | null>(null);

    const [isExportingPNG, setIsExportingPNG] = useState(false);

    // ✅ KICKRESUME STYLE: Sheet sync throttle ref
    const lastSheetSyncTimeRef = useRef(0);

    // ------------------------------------------------------------
    // ✅ Auto-scroll bookkeeping.
    // ------------------------------------------------------------
    const autoScrollPausedRef = useRef(false);
    const autoScrollCountRef = useRef(0);
    const autoScrollOffTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const autoScrollHooks = useMemo<ChaseHooks>(() => ({
        onStart: () => {
            autoScrollCountRef.current += 1;
            if (autoScrollOffTimerRef.current) {
                clearTimeout(autoScrollOffTimerRef.current);
                autoScrollOffTimerRef.current = null;
            }
            autoScrollPausedRef.current = true;
        },
        onEnd: () => {
            autoScrollCountRef.current = Math.max(0, autoScrollCountRef.current - 1);
            if (autoScrollCountRef.current > 0) return;
            if (autoScrollOffTimerRef.current) clearTimeout(autoScrollOffTimerRef.current);
            autoScrollOffTimerRef.current = setTimeout(() => {
                autoScrollOffTimerRef.current = null;
                autoScrollPausedRef.current = false;
            }, 120);
        },
    }), []);

    useEffect(() => () => {
        if (autoScrollOffTimerRef.current) clearTimeout(autoScrollOffTimerRef.current);
    }, []);

    const pointerDownRef = useRef(false);
    useEffect(() => {
        const down = () => { pointerDownRef.current = true; };
        const up = () => { pointerDownRef.current = false; };
        window.addEventListener('pointerdown', down, true);
        window.addEventListener('pointerup', up, true);
        window.addEventListener('pointercancel', up, true);
        return () => {
            window.removeEventListener('pointerdown', down, true);
            window.removeEventListener('pointerup', up, true);
            window.removeEventListener('pointercancel', up, true);
        };
    }, []);

    const handleToggleSection = useCallback((key: SectionKey, willBeOpen: boolean) => {
        setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

        if (key === 'skills' && willBeOpen) {
            const shown = localStorage.getItem(BACKUP_REMINDER_FLAG);
            if (shown !== 'true') {
                setTimeout(() => setShowBackupReminder(true), 500);
            }
        }

        if (!willBeOpen || !isDesktop) return;

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                scrollEditorToSection(editorPaneRef, key, 'reveal', autoScrollHooks);
                scrollPreviewToSection(previewPaneRef, key, PREVIEW_SCROLL_OFFSET_PX, autoScrollHooks);
            });
        });
    }, [isDesktop, autoScrollHooks]);

    const handleFieldInteraction = useCallback((sectionKey: string) => {
        if (!isDesktop) return;

        const now = Date.now();
        if (
            lastFieldScrollRef.current.key === sectionKey &&
            now - lastFieldScrollRef.current.time < FIELD_INTERACT_THROTTLE_MS
        ) {
            return;
        }
        lastFieldScrollRef.current = { key: sectionKey, time: now };

        const run = () => {
            scrollEditorToSection(editorPaneRef, sectionKey, 'fit', autoScrollHooks);
            scrollPreviewToSection(previewPaneRef, sectionKey, PREVIEW_SCROLL_OFFSET_PX, autoScrollHooks);
        };

        if (pointerDownRef.current) {
            const onUp = () => {
                window.removeEventListener('pointerup', onUp, true);
                window.removeEventListener('pointercancel', onUp, true);
                window.setTimeout(run, 60);
            };
            window.addEventListener('pointerup', onUp, true);
            window.addEventListener('pointercancel', onUp, true);
        } else {
            run();
        }
    }, [isDesktop, autoScrollHooks]);

    const handleEditSection = useCallback((previewSectionKey: string) => {
        const editorKey = PREVIEW_TO_EDITOR_SECTION[previewSectionKey];
        if (!editorKey) return;

        setActiveSection(previewSectionKey);

        setOpenSections(() => {
            const next: Record<SectionKey, boolean> = {
                personal: false,
                experience: false,
                education: false,
                languages: false,
                skills: false,
                certifications: false,
                projects: false,
                achievements: false,
                summary: false,
                export: false,
            };
            next[editorKey] = true;
            return next;
        });

        requestAnimationFrame(() => {
            scrollEditorToSection(editorPaneRef, editorKey, 'top', autoScrollHooks);
        });

        requestAnimationFrame(() => {
            scrollPreviewToSection(previewPaneRef, previewSectionKey, PREVIEW_SCROLL_OFFSET_PX, autoScrollHooks);
        });

        if (window.innerWidth < 1024) {
            setMobileTab('edit');
        }
    }, [autoScrollHooks]);

    useScrollSync(editorPaneRef, previewPaneRef, { enabled: isDesktop, pausedRef: autoScrollPausedRef });

    useActiveSection(previewPaneRef, isDesktop, isExportingPNG);

    const [hasReachedPreview, setHasReachedPreview] = useState(() => savedData?.hasReachedPreview || false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiGenerating, setAiGenerating] = useState<string | null>(null);
    const [aiEnhancerLoading, setAiEnhancerLoading] = useState<string | null>(null);
    const [originalSummary, setOriginalSummary] = useState<string>('');
    const [isEnhancerUsed, setIsEnhancerUsed] = useState<boolean>(false);
    const [selectedProvider, setSelectedProvider] = useState<string>(() => savedData?.selectedProvider || 'openrouter');

    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSourceKey, setFeedbackSourceKey] = useState('cv-builder');

    const [showBackupReminder, setShowBackupReminder] = useState(false);

    const [personalInfo, setPersonalInfo] = useState(() => {
        if (savedData?.personalInfo) {
            return { ...defaultPersonalInfo, ...savedData.personalInfo };
        }
        return { ...defaultPersonalInfo };
    });

    const [professionalSummary, setProfessionalSummary] = useState(() => savedData?.professionalSummary || '');
    const [selectedCountryCode, setSelectedCountryCode] = useState(() => savedData?.selectedCountryCode || 'PK');
    const [phoneNumber, setPhoneNumber] = useState(() => savedData?.phoneNumber || '');

    const [profilePhoto, setProfilePhoto] = useState<string | null>(() => {
        if (savedData?.profilePhoto && typeof savedData.profilePhoto === 'string') {
            return savedData.profilePhoto;
        }
        return null;
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    const [experiences, setExperiences] = useState(() => {
        if (savedData?.experiences && Array.isArray(savedData.experiences) && savedData.experiences.length > 0) {
            return savedData.experiences;
        }
        return [createDefaultExperience()];
    });

    const addExperience = useCallback(() => setExperiences(prev => [...prev, createDefaultExperience()]), []);
    const removeExperience = useCallback((index: number) => setExperiences(prev => prev.filter((_, i) => i !== index)), []);
    const updateExperience = useCallback((index: number, field: string, value: any) => {
        setExperiences(prev => prev.map((exp, i) => i === index ? { ...exp, [field]: value } : exp));
    }, []);

    const [educations, setEducations] = useState(() => {
        if (savedData?.educations && Array.isArray(savedData.educations) && savedData.educations.length > 0) {
            return savedData.educations;
        }
        return [createDefaultEducation()];
    });

    const addEducation = useCallback(() => setEducations(prev => [...prev, createDefaultEducation()]), []);
    const removeEducation = useCallback((index: number) => setEducations(prev => prev.filter((_, i) => i !== index)), []);
    const updateEducation = useCallback((index: number, field: string, value: any) => {
        setEducations(prev => prev.map((edu, i) => i === index ? { ...edu, [field]: value } : edu));
    }, []);

    const [projects, setProjects] = useState(() => {
        if (savedData?.projects && Array.isArray(savedData.projects) && savedData.projects.length > 0) {
            return savedData.projects;
        }
        return [createDefaultProject()];
    });

    const addProject = useCallback(() => setProjects(prev => [...prev, createDefaultProject()]), []);
    const removeProject = useCallback((index: number) => setProjects(prev => prev.filter((_, i) => i !== index)), []);
    const updateProject = useCallback((index: number, field: string, value: any) => {
        setProjects(prev => prev.map((proj, i) => i === index ? { ...proj, [field]: value } : proj));
    }, []);

    const [certifications, setCertifications] = useState(() => {
        if (savedData?.certifications && Array.isArray(savedData.certifications) && savedData.certifications.length > 0) {
            return savedData.certifications;
        }
        return [createDefaultCertification()];
    });

    const addCertification = useCallback(() => setCertifications(prev => [...prev, createDefaultCertification()]), []);
    const removeCertification = useCallback((index: number) => setCertifications(prev => prev.filter((_, i) => i !== index)), []);
    const updateCertification = useCallback((index: number, field: string, value: any) => {
        setCertifications(prev => prev.map((cert, i) => i === index ? { ...cert, [field]: value } : cert));
    }, []);

    const [languages, setLanguages] = useState(() => {
        if (savedData?.languages && Array.isArray(savedData.languages) && savedData.languages.length > 0) {
            return savedData.languages;
        }
        return [createDefaultLanguage()];
    });

    const addLanguage = useCallback(() => setLanguages(prev => [...prev, createDefaultLanguage()]), []);
    const removeLanguage = useCallback((index: number) => setLanguages(prev => prev.filter((_, i) => i !== index)), []);
    const updateLanguage = useCallback((index: number, field: string, value: any) => {
        setLanguages(prev => prev.map((lang, i) => i === index ? { ...lang, [field]: value } : lang));
    }, []);

    const [achievements, setAchievements] = useState(() => {
        if (savedData?.achievements && Array.isArray(savedData.achievements) && savedData.achievements.length > 0) {
            return savedData.achievements;
        }
        return [createDefaultAchievement()];
    });

    const addAchievement = useCallback(() => setAchievements(prev => [...prev, createDefaultAchievement()]), []);
    const removeAchievement = useCallback((index: number) => setAchievements(prev => prev.filter((_, i) => i !== index)), []);
    const updateAchievement = useCallback((index: number, field: string, value: any) => {
        setAchievements(prev => prev.map((ach, i) => i === index ? { ...ach, [field]: value } : ach));
    }, []);

    const [skills, setSkills] = useState(() => savedData?.skills || '');

    const [internalDocumentId, setInternalDocumentId] = useState<string | null>(documentId || null);
    const documentCreationAttempted = useRef(false);
    const documentCreationTimer = useRef<NodeJS.Timeout | null>(null);
    const internalDocumentIdRef = useRef<string | null>(documentId || null);

    // ============================================
    // ✅ KICKRESUME STYLE: Preview Debounced State
    // ============================================
    // Editor instant rahe, preview 800ms baad update ho
    // ============================================
    const [previewData, setPreviewData] = useState({
        personalInfo,
        phoneNumber,
        selectedCountryCode,
        professionalSummary,
        experiences,
        educations,
        projects,
        certifications,
        languages,
        achievements,
        skills,
        profilePhoto,
        template,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setPreviewData({
                personalInfo,
                phoneNumber,
                selectedCountryCode,
                professionalSummary,
                experiences,
                educations,
                projects,
                certifications,
                languages,
                achievements,
                skills,
                profilePhoto,
                template,
            });
        }, PREVIEW_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [
        personalInfo, phoneNumber, selectedCountryCode, professionalSummary,
        experiences, educations, projects, certifications, languages,
        achievements, skills, profilePhoto, template,
    ]);

    useEffect(() => {
        if (documentId) {
            internalDocumentIdRef.current = documentId;
            setInternalDocumentId(documentId);
            documentCreationAttempted.current = true;
        }
    }, [documentId]);

    useEffect(() => {
        internalDocumentIdRef.current = internalDocumentId;
    }, [internalDocumentId]);

    useEffect(() => {
        if (!documentId) return;
        if (profilePhoto && profilePhoto.length > 500) return;
        if (!savedData?.hasPhoto && !savedData?.profilePhoto) return;

        let cancelled = false;
        (async () => {
            try {
                const img = await loadImageFromIDB(getPhotoKey(documentId));
                if (!cancelled && img) {
                    setProfilePhoto(img);
                }
            } catch (e) {
                console.error('❌ CVBuilder: Failed to load photo from IDB:', e);
            }
        })();

        return () => { cancelled = true; };
    }, [documentId, savedData?.hasPhoto, savedData?.profilePhoto, profilePhoto]);

    const hasMeaningfulData = useMemo(() => {
        const hasName = !!personalInfo?.name?.trim();
        const hasTitle = !!personalInfo?.title?.trim();
        const hasContact = !!(personalInfo?.email?.trim() || phoneNumber?.trim());
        const hasSection =
            (professionalSummary?.trim()?.length || 0) > 20 ||
            (skills?.trim()?.length || 0) > 10 ||
            experiences.some((e: any) => e.title?.trim() && e.company?.trim()) ||
            educations.some((e: any) => e.degree?.trim() && e.institution?.trim());

        return hasName && (hasTitle || hasContact || hasSection);
    }, [
        personalInfo?.name, personalInfo?.title, personalInfo?.email,
        phoneNumber, professionalSummary, skills,
        experiences, educations,
    ]);

    useEffect(() => {
        if (internalDocumentIdRef.current) return;
        if (documentCreationAttempted.current) return;
        if (!hasMeaningfulData) return;

        if (documentCreationTimer.current) {
            clearTimeout(documentCreationTimer.current);
        }

        documentCreationTimer.current = setTimeout(async () => {
            if (documentCreationAttempted.current) return;
            if (internalDocumentIdRef.current) return;

            documentCreationAttempted.current = true;

            try {
                const { localStorageDocumentService } = await import('./services/documentService');
                const meta = await localStorageDocumentService.createEmpty(userId);

                const dataToSave = {
                    personalInfo, professionalSummary, experiences, educations, skills,
                    selectedCountryCode, phoneNumber, template, projects, certifications,
                    languages, achievements,
                    hasPhoto: isRealPhoto(profilePhoto),
                    hasReachedPreview,
                    selectedProvider, openSections, lastUpdated: Date.now(),
                };
                const saveResult = safeSaveDocument(userId, meta.id, dataToSave);
                if (!saveResult.ok) {
                    console.warn('[CVBuilder] Save failed:', saveResult.error);
                }

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
                console.error('Failed to create document on first save:', e);
                documentCreationAttempted.current = false;
            }
        }, 1000);

        return () => {
            if (documentCreationTimer.current) {
                clearTimeout(documentCreationTimer.current);
            }
        };
    }, [
        hasMeaningfulData, userId, onDocumentCreated,
        personalInfo, professionalSummary, experiences, educations, skills,
        selectedCountryCode, phoneNumber,
        languages, achievements, hasReachedPreview, selectedProvider,
        openSections
    ]);

    useEffect(() => {
        return () => {
            if (documentCreationTimer.current) {
                clearTimeout(documentCreationTimer.current);
            }
        };
    }, []);

    // ============================================================
    // ✅ FILTER LOGIC — 2 versions per section
    // ------------------------------------------------------------
    // "Complete" (AND) → used by scoring/validation (unchanged behavior)
    // "Usable"   (OR)  → used by PDF download + preview (all non-empty shown)
    // ============================================================

    // --- Experience ---
    const isExperienceComplete = useCallback((exp: any): boolean => {
        return !!(exp.title?.trim() && exp.company?.trim() && exp.startDate?.trim() && exp.endDate?.trim() && exp.description?.trim());
    }, []);

    const isExperienceUsable = useCallback((exp: any): boolean => {
        return !!(
            exp.title?.trim() ||
            exp.company?.trim() ||
            exp.startDate?.trim() ||
            exp.endDate?.trim() ||
            exp.description?.trim() ||
            exp.location?.trim()
        );
    }, []);

    // ✅ Used by scoring/validation (unchanged)
    const getCompleteExperiences = useMemo(() => {
        return experiences.filter(exp => isExperienceComplete(exp));
    }, [experiences, isExperienceComplete]);

    // ✅ Used by PDF download (NEW)
    const usableExperiences = useMemo(() => {
        return experiences.filter(exp => isExperienceUsable(exp));
    }, [experiences, isExperienceUsable]);

    // --- Education ---
    const isEducationComplete = useCallback((edu: any): boolean => {
        return !!(edu.degree?.trim() && edu.institution?.trim());
    }, []);

    const isEducationUsable = useCallback((edu: any): boolean => {
        return !!(
            edu.degree?.trim() ||
            edu.institution?.trim() ||
            edu.startDate?.trim() ||
            edu.endDate?.trim() ||
            edu.description?.trim() ||
            edu.location?.trim()
        );
    }, []);

    const getCompleteEducations = useMemo(() => {
        return educations.filter(edu => isEducationComplete(edu));
    }, [educations, isEducationComplete]);

    const usableEducations = useMemo(() => {
        return educations.filter(edu => isEducationUsable(edu));
    }, [educations, isEducationUsable]);

    // --- Projects ---
    const isProjectComplete = useCallback((proj: any): boolean => {
        return !!(proj.name?.trim() && proj.description?.trim());
    }, []);

    const isProjectUsable = useCallback((proj: any): boolean => {
        return !!(
            proj.name?.trim() ||
            proj.description?.trim() ||
            proj.link?.trim() ||
            proj.startDate?.trim() ||
            proj.endDate?.trim() ||
            (Array.isArray(proj.technologies) && proj.technologies.length > 0)
        );
    }, []);

    const getCompleteProjects = useMemo(() => {
        return projects.filter(proj => isProjectComplete(proj));
    }, [projects, isProjectComplete]);

    const usableProjects = useMemo(() => {
        return projects.filter(proj => isProjectUsable(proj));
    }, [projects, isProjectUsable]);

    // --- Certifications ---
    const isCertificationComplete = useCallback((cert: any): boolean => {
        return !!(cert.name?.trim() && cert.issuer?.trim());
    }, []);

    const isCertificationUsable = useCallback((cert: any): boolean => {
        return !!(
            cert.name?.trim() ||
            cert.issuer?.trim() ||
            cert.date?.trim() ||
            cert.link?.trim() ||
            cert.credentialId?.trim()
        );
    }, []);

    const getCompleteCertifications = useMemo(() => {
        return certifications.filter(cert => isCertificationComplete(cert));
    }, [certifications, isCertificationComplete]);

    const usableCertifications = useMemo(() => {
        return certifications.filter(cert => isCertificationUsable(cert));
    }, [certifications, isCertificationUsable]);

    // --- Languages ---
    const isLanguageComplete = useCallback((lang: any): boolean => {
        return !!(lang.language?.trim() && lang.proficiency?.trim());
    }, []);

    const isLanguageUsable = useCallback((lang: any): boolean => {
        return !!(lang.language?.trim() || lang.proficiency?.trim());
    }, []);

    const getCompleteLanguages = useMemo(() => {
        return languages.filter(lang => isLanguageComplete(lang));
    }, [languages, isLanguageComplete]);

    const usableLanguages = useMemo(() => {
        return languages.filter(lang => isLanguageUsable(lang));
    }, [languages, isLanguageUsable]);

    // --- Achievements ---
    const isAchievementComplete = useCallback((ach: any): boolean => {
        return !!(ach.title?.trim() && ach.description?.trim());
    }, []);

    const isAchievementUsable = useCallback((ach: any): boolean => {
        return !!(
            ach.title?.trim() ||
            ach.date?.trim() ||
            ach.description?.trim() ||
            ach.shortDescription?.trim()
        );
    }, []);

    const getCompleteAchievements = useMemo(() => {
        return achievements.filter(ach => isAchievementComplete(ach));
    }, [achievements, isAchievementComplete]);

    const usableAchievements = useMemo(() => {
        return achievements.filter(ach => isAchievementUsable(ach));
    }, [achievements, isAchievementUsable]);

    // ============================================================
    // ✅ Scoring & Validation — UNCHANGED (still uses "complete" arrays)
    // ============================================================
    const validation = useValidation(
        personalInfo, phoneNumber, selectedCountryCode,
        getCompleteExperiences, getCompleteEducations, getCompleteProjects, skills,
        getCompleteCertifications, getCompleteLanguages, getCompleteAchievements, professionalSummary
    );
    const {
        sectionStatuses, phoneError, errors, setErrors,
        validationErrors, setValidationErrors, clearValidationErrors,
        areRequiredSectionsComplete
    } = validation;

    const scores = useScoreCalculation(
        personalInfo, phoneNumber, getCompleteExperiences,
        getCompleteEducations, getCompleteProjects, skills, getCompleteLanguages,
        getCompleteCertifications,
        getCompleteAchievements, professionalSummary, selectedCountryCode
    );
    const {
        realWeightedAverage, realCompletionPercentage, realBreakdown,
        realQuality, realSuggestions, getScoreColor, getScoreBg
    } = scores;

    const shouldSkipSave = !internalDocumentIdRef.current && !internalDocumentId;
    const { saveStatus } = useAutoSave(userId, {
        personalInfo, professionalSummary, experiences, educations, skills,
        selectedCountryCode, phoneNumber, template, projects, certifications,
        languages, achievements,
        hasPhoto: isRealPhoto(profilePhoto),
        hasReachedPreview, selectedProvider,
        openSections,
    }, [
        personalInfo, professionalSummary, experiences, educations, skills,
        selectedCountryCode, phoneNumber, template, projects, certifications,
        languages, achievements,
        hasReachedPreview, selectedProvider,
        openSections,
    ], 1000, internalDocumentId || undefined, shouldSkipSave);

    // ============================================
    // ✅ KICKRESUME STYLE: Sheet sync with THROTTLE
    // ============================================
    useEffect(() => {
        const docId = internalDocumentIdRef.current;
        if (!docId) return;
        if (!userId) return;

        const now = Date.now();
        if (now - lastSheetSyncTimeRef.current < SHEET_SYNC_THROTTLE_MS) {
            return;
        }

        const timer = setTimeout(() => {
            lastSheetSyncTimeRef.current = Date.now();
            const syncNow = Date.now();
            syncService.syncCV({
                userId,
                cvId: docId,
                data: {
                    personalInfo, professionalSummary, experiences, educations,
                    skills, selectedCountryCode, phoneNumber, template,
                    projects, certifications, languages, achievements,
                    hasPhoto: isRealPhoto(profilePhoto),
                    openSections,
                },
                title: personalInfo?.name ? `${personalInfo.name}'s CV` : 'Untitled CV',
                template,
                createdAt: syncNow,
                updatedAt: syncNow,
            }).catch(err => {
                console.warn('[CVBuilder] Sheet sync failed (queued for retry):', err);
            });
        }, SYNC_CONFIG.idleDebounceMs);

        return () => clearTimeout(timer);
    }, [
        userId,
        personalInfo, professionalSummary, experiences, educations,
        skills, selectedCountryCode, phoneNumber, template,
        projects, certifications, languages, achievements,
        profilePhoto, openSections,
    ]);

    useEffect(() => {
        const forceSync = (label: string, warnLabel: string) => {
            const docId = internalDocumentIdRef.current;
            if (!docId) return;
            if (!userId) return;

            const now = Date.now();
            console.log(`[CVBuilder] ${label} — force syncing CV to Sheet`);

            syncService.syncCV({
                userId,
                cvId: docId,
                data: {
                    personalInfo, professionalSummary, experiences, educations,
                    skills, selectedCountryCode, phoneNumber, template,
                    projects, certifications, languages, achievements,
                    hasPhoto: isRealPhoto(profilePhoto),
                    openSections,
                },
                title: personalInfo?.name ? `${personalInfo.name}'s CV` : 'Untitled CV',
                template,
                createdAt: now,
                updatedAt: now,
            }).catch(err => {
                console.warn(`[CVBuilder] ${warnLabel}-triggered sync failed (queued):`, err);
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
        userId,
        personalInfo, professionalSummary, experiences, educations,
        skills, selectedCountryCode, phoneNumber, template,
        projects, certifications, languages, achievements,
        profilePhoto, openSections,
    ]);

    const cvActions = createCVActions(
        userId, setPersonalInfo, setProfessionalSummary, setExperiences,
        setEducations, setSkills, setProjects, setCertifications, setLanguages,
        setAchievements, setProfilePhoto, setSelectedCountryCode, setPhoneNumber,
        setTemplate, setHasReachedPreview, setShowSuccessCard, setErrors,
        setValidationErrors, setIsEnhancerUsed, setOriginalSummary,
        professionalSummary, originalSummary, isEnhancerUsed
    );
    const { clearAllData, restoreOriginalSummary, updatePersonalInfo, handlePhoneChange } = cvActions;

    const aiActions = createAIActions(
        personalInfo, experiences, educations, projects, skills, certifications,
        achievements, professionalSummary, setProfessionalSummary, setExperiences,
        setSkills, setProjects, setAchievements, setGenerating, setAiGenerating,
        setAiEnhancerLoading, setIsEnhancerUsed, setOriginalSummary,
        originalSummary, isEnhancerUsed
    );
    const {
        enhanceSkills, expandSkills, handleAIGenerateSummary,
        handleAIGenerateExperience, handleAIGenerateProject,
        handleAIGenerateAchievement, generateDescriptionForField,
        applyAIEnhancement
    } = aiActions;

    // ============================================================
    // ✅ FIX: downloadActions now receives USABLE arrays (OR logic)
    //         → PDF shows every entry with ANY filled field
    // ============================================================
    const downloadActions = createDownloadActions(
        personalInfo, phoneNumber, selectedCountryCode, professionalSummary,
        usableExperiences,
        usableEducations,
        usableProjects,
        usableCertifications,
        usableLanguages,
        usableAchievements,
        skills, template, profilePhoto
    );
    const {
        downloadPDF, downloadClassicPDF, downloadMinimalPDF, downloadModernPDF,
        downloadAcademicPDF, downloadCreativePDF, downloadTealCurvePDF,
        downloadExecutivePDF, downloadStandardPDF,
        downloadTXT, copyCV
    } = downloadActions;

    const handleDownloadPDF = async () => {
        const shouldShow = shouldShowFeedback('cv-builder');
        switch (template) {
            case 'classic': await downloadClassicPDF(); break;
            case 'minimal': await downloadMinimalPDF(); break;
            case 'modern': await downloadModernPDF(); break;
            case 'academic': await downloadAcademicPDF(); break;
            case 'creative': await downloadCreativePDF(); break;
            case 'teal-curve': await downloadTealCurvePDF(); break;
            case 'executive': await downloadExecutivePDF(); break;
            case 'standard': await downloadStandardPDF(); break;
            default: await downloadPDF(); break;
        }
        if (shouldShow) {
            setFeedbackSourceKey('cv-builder');
            setTimeout(() => setShowFeedbackModal(true), 500);
        }
    };

    const handleDownloadTXT = async () => { await downloadTXT(); };
    const handleCopyCV = async () => { await copyCV(); };

    const handleFeedbackModalClose = useCallback(() => {
        setShowFeedbackModal(false);
        markFeedbackShown('cv-builder');

        window.dispatchEvent(new CustomEvent('adin-feedback-closed', {
            detail: { source: 'cv-builder' }
        }));
    }, []);

    const handleBackupReminderClose = useCallback(() => {
        setShowBackupReminder(false);
        localStorage.setItem(BACKUP_REMINDER_FLAG, 'true');
    }, []);

    const handleBackupReminderDownloadId = useCallback(() => {
        setShowBackupReminder(false);
        localStorage.setItem(BACKUP_REMINDER_FLAG, 'true');
        onDownloadId?.();
    }, [onDownloadId]);

    const handleBackupReminderSetPin = useCallback(() => {
        setShowBackupReminder(false);
        localStorage.setItem(BACKUP_REMINDER_FLAG, 'true');
        onSetPin?.();
    }, [onSetPin]);

    useEffect(() => {
        try {
            initializeAI();
        } catch (error) {
            console.error('AI initialization failed:', error);
        }
    }, []);

    const skillsSectionProps = {
        skills, setSkills, enhanceSkills, expandSkills, generating, personalInfo
    };

    const experienceSectionProps = {
        experiences, addExperience, removeExperience, updateExperience,
        generateDescription: (index: number, exp: any) => generateDescriptionForField('experience', index, exp),
        generateAI: (index: number, exp: any) => handleAIGenerateExperience(index, exp),
        aiGenerating, generating
    };

    const projectSectionProps = {
        projects, addProject, removeProject, updateProject,
        generateDescription: (index: number, proj: any) => generateDescriptionForField('project', index, proj),
        generateAI: (index: number, proj: any) => handleAIGenerateProject(index, proj),
        generating, aiGenerating
    };

    const achievementSectionProps = {
        achievements, addAchievement, removeAchievement, updateAchievement,
        generateDescription: (index: number, ach: any) => generateDescriptionForField('achievement', index, ach),
        generateAI: (index: number, ach: any) => handleAIGenerateAchievement(index, ach),
        generating, aiGenerating
    };

    const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const dataUrl = event.target?.result as string;

            setProfilePhoto(dataUrl);
            setPersonalInfo(prev => ({ ...prev, photo: dataUrl }));

            try {
                let docId = internalDocumentIdRef.current;

                if (!docId) {
                    const { localStorageDocumentService } = await import('./services/documentService');
                    const meta = await localStorageDocumentService.createEmpty(userId);
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

                const saveResult = safeSaveDocument(userId, docId, {
                    personalInfo: { ...personalInfo, photo: dataUrl },
                    professionalSummary, experiences, educations, skills,
                    selectedCountryCode, phoneNumber, template, projects, certifications,
                    languages, achievements,
                    hasPhoto: true,
                    hasReachedPreview,
                    selectedProvider, openSections, lastUpdated: Date.now(),
                });

                if (saveResult.ok) {
                    console.log('💾 Document updated with hasPhoto: true');
                }

                toast.success('Photo uploaded successfully');
            } catch (err) {
                console.error('❌ Failed to save photo:', err);
                toast.error('Failed to save photo — please try again');
            }
        };
        reader.readAsDataURL(file);
    }, [
        userId,
        personalInfo, professionalSummary, experiences, educations, skills,
        selectedCountryCode, phoneNumber, template, projects, certifications,
        languages, achievements, hasReachedPreview, selectedProvider, openSections,
        onDocumentCreated,
    ]);

    const handlePhotoRemove = useCallback(async () => {
        setProfilePhoto(null);
        setPersonalInfo(prev => ({ ...prev, photo: null as any }));

        try {
            if (internalDocumentIdRef.current) {
                await deleteImageFromIDB(getPhotoKey(internalDocumentIdRef.current));

                safeSaveDocument(userId, internalDocumentIdRef.current, {
                    personalInfo: { ...personalInfo, photo: null },
                    professionalSummary, experiences, educations, skills,
                    selectedCountryCode, phoneNumber, template, projects, certifications,
                    languages, achievements,
                    hasPhoto: false,
                    hasReachedPreview,
                    selectedProvider, openSections, lastUpdated: Date.now(),
                });
            } else {
                await deleteImageFromIDB(getDraftPhotoKey(userId));
            }
        } catch (err) {
            console.error('❌ Failed to delete photo from IndexedDB:', err);
        }

        toast.success('Photo removed');
    }, [
        userId,
        personalInfo, professionalSummary, experiences, educations, skills,
        selectedCountryCode, phoneNumber, template, projects, certifications,
        languages, achievements, hasReachedPreview, selectedProvider, openSections,
    ]);

    const handleChangePhoto = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const personalSectionProps = useMemo(() => ({
        personalInfo,
        updatePersonalInfo: (field: string, value: string) => updatePersonalInfo(field, value, setErrors, errors),
        selectedCountryCode,
        setSelectedCountryCode,
        phoneNumber,
        handlePhoneChange: (value: string) => handlePhoneChange(value, setErrors, errors),
        profilePhoto,
        fileInputRef,
        handlePhotoUpload,
        handleChangePhoto,
        onRemovePhoto: handlePhotoRemove,
        errors,
        phoneError
    }), [
        personalInfo, selectedCountryCode, phoneNumber, profilePhoto,
        errors, phoneError,
        updatePersonalInfo, handlePhoneChange, handlePhotoUpload, handleChangePhoto, handlePhotoRemove
    ]);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const [pngOffscreen, setPngOffscreen] = useState(false);

    const handleDownloadPNG = useCallback(() => {
        if (previewHandleRef.current) {
            return previewHandleRef.current.downloadPNG();
        }
        if (isMobile) {
            toast.loading('Preparing PNG...', { id: 'cv-png-mobile' });
            setPngOffscreen(true);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!pngOffscreen) return;
        const t = setTimeout(() => {
            setPngOffscreen(false);
            toast.dismiss('cv-png-mobile');
        }, 30000);
        return () => clearTimeout(t);
    }, [pngOffscreen]);

    const renderAllSections = () => (
        <div className="space-y-3">
            <AccordionSection
                id="personal"
                title="Personal Information"
                subtitle="Name, contact details, and links"
                icon={<User size={16} strokeWidth={2.4} />}
                isOpen={openSections.personal}
                onToggle={() => handleToggleSection('personal', !openSections.personal)}
                onContentInteract={handleFieldInteraction}
                badge="Required"
            >
                <PersonalSection {...personalSectionProps} />
            </AccordionSection>

            <AccordionSection
                id="experience"
                title="Work Experience"
                subtitle="Your professional background"
                icon={<Briefcase size={16} strokeWidth={2.4} />}
                isOpen={openSections.experience}
                onToggle={() => handleToggleSection('experience', !openSections.experience)}
                onContentInteract={handleFieldInteraction}
            >
                <ExperienceSection {...experienceSectionProps} />
            </AccordionSection>

            <AccordionSection
                id="education"
                title="Education"
                subtitle="Degrees and academic background"
                icon={<GraduationCap size={16} strokeWidth={2.4} />}
                isOpen={openSections.education}
                onToggle={() => handleToggleSection('education', !openSections.education)}
                onContentInteract={handleFieldInteraction}
            >
                <EducationSection
                    educations={educations}
                    addEducation={addEducation}
                    removeEducation={removeEducation}
                    updateEducation={updateEducation}
                />
            </AccordionSection>

            <AccordionSection
                id="languages"
                title="Languages"
                subtitle="Spoken languages and proficiency"
                icon={<LanguagesIcon size={16} strokeWidth={2.4} />}
                isOpen={openSections.languages}
                onToggle={() => handleToggleSection('languages', !openSections.languages)}
                onContentInteract={handleFieldInteraction}
            >
                <LanguagesSection
                    languages={languages}
                    addLanguage={addLanguage}
                    removeLanguage={removeLanguage}
                    updateLanguage={updateLanguage}
                />
            </AccordionSection>

            <AccordionSection
                id="skills"
                title="Skills"
                subtitle="Technical and soft skills"
                icon={<Zap size={16} strokeWidth={2.4} />}
                isOpen={openSections.skills}
                onToggle={() => handleToggleSection('skills', !openSections.skills)}
                onContentInteract={handleFieldInteraction}
            >
                <SkillsSection {...skillsSectionProps} />
            </AccordionSection>

            <AccordionSection
                id="certifications"
                title="Certifications"
                subtitle="Professional certificates and credentials"
                icon={<Award size={16} strokeWidth={2.4} />}
                isOpen={openSections.certifications}
                onToggle={() => handleToggleSection('certifications', !openSections.certifications)}
                onContentInteract={handleFieldInteraction}
            >
                <CertificationsSection
                    certifications={certifications}
                    addCertification={addCertification}
                    removeCertification={removeCertification}
                    updateCertification={updateCertification}
                />
            </AccordionSection>

            <AccordionSection
                id="projects"
                title="Projects"
                subtitle="Personal, academic, or freelance work"
                icon={<FolderGit2 size={16} strokeWidth={2.4} />}
                isOpen={openSections.projects}
                onToggle={() => handleToggleSection('projects', !openSections.projects)}
                onContentInteract={handleFieldInteraction}
            >
                <ProjectsSection {...projectSectionProps} />
            </AccordionSection>

            <AccordionSection
                id="achievements"
                title="Achievements & Awards"
                subtitle="Recognition and notable accomplishments"
                icon={<Trophy size={16} strokeWidth={2.4} />}
                isOpen={openSections.achievements}
                onToggle={() => handleToggleSection('achievements', !openSections.achievements)}
                onContentInteract={handleFieldInteraction}
            >
                <AchievementsSection {...achievementSectionProps} />
            </AccordionSection>

            <AccordionSection
                id="summary"
                title="Professional Summary"
                subtitle="Your career overview and goals"
                icon={<FileText size={16} strokeWidth={2.4} />}
                isOpen={openSections.summary}
                onToggle={() => handleToggleSection('summary', !openSections.summary)}
                onContentInteract={handleFieldInteraction}
            >
                <SummarySection
                    professionalSummary={professionalSummary}
                    setProfessionalSummary={setProfessionalSummary}
                    generateSummary={() => generateDescriptionForField('summary')}
                    generateAISummary={handleAIGenerateSummary}
                    generating={generating}
                    aiGenerating={aiGenerating}
                    personalInfo={personalInfo}
                    experiences={experiences}
                    skills={skills}
                />
            </AccordionSection>

            <AccordionSection
                id="export"
                title="Export & Download"
                subtitle="Download your CV and save your progress"
                icon={<Download size={16} strokeWidth={2.4} />}
                isOpen={openSections.export}
                onToggle={() => handleToggleSection('export', !openSections.export)}
            >
                <div className="space-y-5">
                    {areRequiredSectionsComplete() && (
                        <SuccessCard
                            realWeightedAverage={realWeightedAverage}
                            realCompletionPercentage={realCompletionPercentage}
                            realQuality={realQuality}
                        />
                    )}

                    <DownloadButtons
                        onCopy={handleCopyCV}
                        onDownloadPDF={handleDownloadPDF}
                        onDownloadTXT={handleDownloadTXT}
                        onDownloadPNG={handleDownloadPNG}
                        onClear={clearAllData}
                    />
                </div>
            </AccordionSection>
        </div>
    );

    return (
        <>
            <SEOHead
                title={getSEOConfig('cv-builder').title}
                description={getSEOConfig('cv-builder').description}
                keywords={getSEOConfig('cv-builder').keywords}
                canonicalUrl={getSEOConfig('cv-builder').canonicalUrl}
                ogType="website"
            />

            <script type="application/ld+json">
                {generateJSONLDScript(generatePageSchemas('cv-builder'))}
            </script>

            <div ref={containerRef} className="h-full flex flex-col bg-slate-100 text-slate-900">
                <style>{`
                    ::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    ::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    ::-webkit-scrollbar-thumb {
                        background: linear-gradient(to bottom, #a855f7, #7c3aed);
                        border-radius: 10px;
                        transition: background 0.3s ease;
                    }
                    ::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to bottom, #9333ea, #6d28d9);
                    }
                    ::-webkit-scrollbar-corner {
                        background: transparent;
                    }
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: #a855f7 transparent;
                    }
                    .overflow-auto, .overflow-y-auto, .overflow-x-auto {
                        scroll-behavior: smooth;
                    }
                `}</style>

                {validationErrors.length > 0 && (
                    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 backdrop-blur-md border border-red-400/50 shadow-2xl animate-in slide-in-from-top fade-in duration-300 max-w-[90vw]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={18} className="text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">Validation Error</p>
                                <p className="text-xs text-white/80 truncate">{validationErrors[0]}</p>
                            </div>
                            <button
                                onClick={clearValidationErrors}
                                className="ml-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                            >
                                <X size={14} className="text-white" />
                            </button>
                        </div>
                    </div>
                )}

                <HeaderToolbar
                    onClearAll={clearAllData}
                    saveStatus={saveStatus}
                    onOpenSidebar={openSidebar}
                />

                {!isMobile && (
                    <TemplateSelector
                        template={template}
                        onTemplateChange={setTemplate}
                        variant="buttons"
                    />
                )}

                <div className="flex-1 flex overflow-hidden">
                    <div
                        ref={editorPaneRef}
                        className={`
                            w-full lg:w-1/2 overflow-auto 
                            p-3 sm:p-4 md:p-6 lg:p-8 
                            pb-24 lg:pb-8
                            border-r border-slate-200
                            bg-slate-100
                            ${isMobile && mobileTab !== 'edit' ? 'hidden' : 'block'}
                        `}
                    >
                        {renderAllSections()}
                    </div>

                    {!isMobile && (
                        <div
                            ref={previewPaneRef}
                            className="w-full lg:w-1/2 overflow-auto bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100"
                        >
                            <CVPreview
                                ref={previewHandleRef}
                                personalInfo={previewData.personalInfo}
                                phoneNumber={previewData.phoneNumber}
                                selectedCountryCode={previewData.selectedCountryCode}
                                professionalSummary={previewData.professionalSummary}
                                experiences={previewData.experiences}
                                educations={previewData.educations}
                                projects={previewData.projects}
                                certifications={previewData.certifications}
                                languages={previewData.languages}
                                achievements={previewData.achievements}
                                skills={previewData.skills}
                                profilePhoto={previewData.profilePhoto}
                                template={previewData.template}
                                atsScore={realWeightedAverage}
                                strength={getStrengthStatus(realWeightedAverage)}
                                completionPercentage={realCompletionPercentage}
                                sectionStatuses={sectionStatuses}
                                onCopyCV={handleCopyCV}
                                onDownloadPDF={handleDownloadPDF}
                                onDownloadTXT={handleDownloadTXT}
                                onOpenFeedback={() => setShowFeedbackModal(true)}
                                onEditSection={handleEditSection}
                                activeSection={activeSection}
                                onPNGExportStateChange={setIsExportingPNG}
                            />
                        </div>
                    )}

                    {isMobile && mobileTab === 'preview' && (
                        <div className="w-full overflow-auto pb-20 bg-slate-100">
                            <CVPreviewMobile
                                ref={previewHandleRef}
                                personalInfo={previewData.personalInfo}
                                phoneNumber={previewData.phoneNumber}
                                selectedCountryCode={previewData.selectedCountryCode}
                                professionalSummary={previewData.professionalSummary}
                                experiences={previewData.experiences}
                                educations={previewData.educations}
                                projects={previewData.projects}
                                certifications={previewData.certifications}
                                languages={previewData.languages}
                                achievements={previewData.achievements}
                                skills={previewData.skills}
                                profilePhoto={previewData.profilePhoto}
                                template={previewData.template}
                                atsScore={realWeightedAverage}
                                strength={getStrengthStatus(realWeightedAverage)}
                                completionPercentage={realCompletionPercentage}
                                sectionStatuses={sectionStatuses}
                                onCopyCV={handleCopyCV}
                                onDownloadPDF={handleDownloadPDF}
                                onDownloadTXT={handleDownloadTXT}
                                onOpenFeedback={() => setShowFeedbackModal(true)}
                                onEditSection={handleEditSection}
                                activeSection={activeSection}
                            />
                        </div>
                    )}

                    {isMobile && pngOffscreen && mobileTab !== 'preview' && (
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
                            <CVPreviewMobile
                                personalInfo={previewData.personalInfo}
                                phoneNumber={previewData.phoneNumber}
                                selectedCountryCode={previewData.selectedCountryCode}
                                professionalSummary={previewData.professionalSummary}
                                experiences={previewData.experiences}
                                educations={previewData.educations}
                                projects={previewData.projects}
                                certifications={previewData.certifications}
                                languages={previewData.languages}
                                achievements={previewData.achievements}
                                skills={previewData.skills}
                                profilePhoto={previewData.profilePhoto}
                                template={previewData.template}
                                atsScore={realWeightedAverage}
                                strength={getStrengthStatus(realWeightedAverage)}
                                completionPercentage={realCompletionPercentage}
                                sectionStatuses={sectionStatuses}
                                autoDownloadPNG
                                onAutoDownloadPNGDone={() => setPngOffscreen(false)}
                            />
                        </div>
                    )}
                </div>

                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 shadow-lg">
                        <div className="max-w-7xl mx-auto flex gap-2">
                            <button
                                onClick={() => setMobileTab('edit')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                                    mobileTab === 'edit'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                                <Pencil size={18} className="flex-shrink-0" />
                                <span>Edit</span>
                            </button>
                            <button
                                onClick={() => setMobileTab('preview')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                                    mobileTab === 'preview'
                                        ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                                }`}
                            >
                                <Eye size={18} className="flex-shrink-0" />
                                <span>Preview</span>
                            </button>
                        </div>
                    </div>
                )}

                <FeedbackFullScreen
                    isOpen={showFeedbackModal}
                    onClose={handleFeedbackModalClose}
                    source="cv-builder"
                />

                <BackupReminderPopup
                    isOpen={showBackupReminder}
                    onClose={handleBackupReminderClose}
                    onDownloadId={handleBackupReminderDownloadId}
                    onSetPin={handleBackupReminderSetPin}
                />
            </div>
        </>
    );
};

export default CVBuilder;