// src/components/cv-builder/preview/types/previewTypes.ts

import { PersonalInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem, SectionStatus } from '../../types/cvTypes';

// ✅ ALL 11 TEMPLATES SUPPORT
export interface CVPreviewProps {
    personalInfo: PersonalInfo;
    phoneNumber: string;
    selectedCountryCode: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    skills: string;
    profilePhoto: string | null;
    template: 'modern' | 'classic' | 'minimal' | 'teal-curve' | 'executive' | 'creative' | 'academic' | 'standard' | 'corporate' | 'ats-pro';
    atsScore: number;
    strength: { text: string; color: string; bg: string; icon: string };
    completionPercentage?: number;
    sectionStatuses?: Record<number, SectionStatus>;

    // ============================================
    // ✅ Optional download callbacks
    // ============================================
    // These are OPTIONAL so no existing call-site breaks.
    // When provided, CVPreview renders a "Download ▾" dropdown
    // next to the "Live PDF Preview" heading, wired to the SAME
    // handlers used by the Export & Insights section.
    //
    // If all three are missing → dropdown is not rendered (zero UI change).
    onCopyCV?: () => void | Promise<void>;
    onDownloadPDF?: () => void | Promise<void>;
    onDownloadTXT?: () => void | Promise<void>;

    // ============================================
    // ✅ NEW: Optional feedback callback
    // ============================================
    // When provided, CVPreview renders a "Feedback" button
    // next to the Download dropdown. Clicking it opens the
    // feedback modal (handled by the parent component).
    //
    // If missing → button is not rendered (zero UI change).
    onOpenFeedback?: () => void;

    // ============================================
    // ✅ NEW: Optional click-to-focus + active highlight
    // ============================================
    // onEditSection — called when the user clicks a section inside
    // the rendered template (e.g. the "EXPERIENCE" heading). The
    // parent (CVBuilder) uses this to expand the matching editor
    // accordion and scroll to it.
    //
    // activeSection — the section key the parent currently wants
    // highlighted (driven by an IntersectionObserver on the preview
    // pane). Templates can use it to draw an outline around the
    // matching section.
    //
    // Both are OPTIONAL: existing call-sites that don't pass them
    // render exactly as before, with no click handlers and no
    // highlight outline.
    onEditSection?: (sectionKey: string) => void;
    activeSection?: string | null;

    // ============================================
    // ✅ NEW: PNG export state callback
    // ============================================
    // Fired by `usePNGDownload` with `true` right before a PNG
    // capture begins and `false` right after it ends (success OR
    // failure).
    //
    // CVBuilder uses this to PAUSE its active-section tracker so
    // React never re-renders a fresh "Click to edit" label mid-
    // capture — which used to sneak a coral-red label into the PNG.
    //
    // OPTIONAL: if missing, the tracker keeps running normally
    // (existing behaviour, only affects the PNG-cleanliness fix).
    onPNGExportStateChange?: (isCapturing: boolean) => void;
}

export interface TemplateStyles {
    card: string;
    heading: string;
    name: string;
    title: string;
    contact: string;
    photoBorder: string;
    description: string;
}

export interface CircularProgressProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    label?: string;
    icon?: string;
}

export interface StrengthDisplay {
    text: string;
    icon: string;
    colorClass: string;
}

export interface ATSBreakdown {
    keywords: number;
    structure: number;
    experience: number;
    skills: number;
    completeness: number;
}