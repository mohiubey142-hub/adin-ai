// src/components/cv-builder/preview/CVPreview.tsx
// ✅ NEW: Feedback button (same size as Download) next to Download dropdown
// ✅ NEW: onEditSection + activeSection pass-through to templates
// ✅ NEW: Fullscreen button — native Fullscreen API, no library
// ✅ FIXED: Fullscreen background — now a light slate canvas
// ✅ NEW: Download PNG — html-to-image (dynamic import, zero bundle cost)
// ✅ NEW: forwardRef — exposes the template wrapper's ref
// ✅ NEW (PNG bug fix): forwards `onPNGExportStateChange`
// ✅ KICKRESUME STYLE: React.memo wrapper — skips re-render if props unchanged
// =====================================================

import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Eye, Download, ChevronDown, Copy, FileText, FileDown, MessageCircle, Maximize, Minimize, Image as ImageIcon } from 'lucide-react';
import { CVPreviewProps } from './types/previewTypes';

import { useTemplateStyles } from './hooks/useTemplateStyles';
import { usePNGDownload } from '../hooks/usePNGDownload';

import MinimalTemplate from './components/MinimalTemplate';
import ClassicTemplate from './components/ClassicTemplate';
import ModernTemplate from './components/ModernTemplate';
import TealCurveTemplate from './components/TealCurveTemplate';
import ExecutiveTemplate from './components/ExecutiveTemplate';
import CreativeTemplate from './components/CreativeTemplate';
import AcademicTemplate from './components/AcademicTemplate';
import StandardTemplate from './components/StandardTemplate';
import CorporateTemplate from './components/CorporateTemplate';
import ATSProTemplate from './components/ATSProTemplate';

import CVPreviewMobile from './CVPreviewMobile';

export interface CVPreviewHandle {
    downloadPNG: () => Promise<void>;
}

// ============================================
// Download Dropdown
// ============================================
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
        const handleClick = (e: MouseEvent) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
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

    const hasAny = !!(onCopy || onDownloadPDF || onDownloadTXT || onDownloadPNG);
    if (!hasAny) return null;

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
                        <Copy size={13} className="text-purple-600 flex-shrink-0" />
                        Copy CV
                    </button>

                    <div className="h-px bg-slate-100" />

                    <button
                        role="menuitem"
                        onClick={() => run(onDownloadPDF)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
                    >
                        <FileDown size={13} className="text-purple-600 flex-shrink-0" />
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
                        <FileText size={13} className="text-purple-600 flex-shrink-0" />
                        Download TXT
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// ✅ CVPreviewInner — actual component (memo-wrapped below)
// ============================================
const CVPreviewInner = forwardRef<CVPreviewHandle, CVPreviewProps>((props, ref) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ✅ Fullscreen target (whole preview pane).
    const fullscreenRef = useRef<HTMLDivElement>(null);

    // ✅ PNG capture target
    const previewBodyRef = useRef<HTMLDivElement>(null);

    const { downloadPNG } = usePNGDownload({
        elementRef: previewBodyRef,
        fileName: props.personalInfo?.name || 'My_CV',
        toastId: 'cv-png',
        onStateChange: props.onPNGExportStateChange,
    });

    useImperativeHandle(ref, () => ({
        downloadPNG,
    }), [downloadPNG]);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    const handleToggleFullscreen = useCallback(async () => {
        const el = fullscreenRef.current;
        if (!el) return;
        try {
            if (!document.fullscreenElement) {
                await el.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.warn('[CVPreview] Fullscreen toggle failed:', err);
        }
    }, []);

    const { backgroundStyle } = useTemplateStyles(props.template);

    const renderTemplate = () => {
        const templateProps: CVPreviewProps = {
            personalInfo: props.personalInfo,
            phoneNumber: props.phoneNumber,
            selectedCountryCode: props.selectedCountryCode,
            professionalSummary: props.professionalSummary,
            experiences: props.experiences,
            educations: props.educations,
            projects: props.projects,
            certifications: props.certifications,
            languages: props.languages,
            achievements: props.achievements,
            skills: props.skills,
            profilePhoto: props.profilePhoto,
            template: props.template,
            atsScore: props.atsScore,
            strength: props.strength,
            completionPercentage: props.completionPercentage,
            sectionStatuses: props.sectionStatuses,
            onCopyCV: props.onCopyCV,
            onDownloadPDF: props.onDownloadPDF,
            onDownloadTXT: props.onDownloadTXT,
            onOpenFeedback: props.onOpenFeedback,
            onEditSection: props.onEditSection,
            activeSection: props.activeSection,
        };

        switch (props.template) {
            case 'minimal':
                return <MinimalTemplate {...templateProps} />;
            case 'classic':
                return <ClassicTemplate {...templateProps} />;
            case 'teal-curve':
                return <TealCurveTemplate {...templateProps} />;
            case 'executive':
                return <ExecutiveTemplate {...templateProps} />;
            case 'creative':
                return <CreativeTemplate {...templateProps} />;
            case 'academic':
                return <AcademicTemplate {...templateProps} />;
            case 'standard':
                return <StandardTemplate {...templateProps} />;
            case 'corporate':
                return <CorporateTemplate {...templateProps} />;
            case 'ats-pro':
                return <ATSProTemplate {...templateProps} />;
            case 'modern':
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    if (isMobile) {
        return (
            <CVPreviewMobile
                {...props}
                onCopyCV={props.onCopyCV}
                onDownloadPDF={props.onDownloadPDF}
                onDownloadTXT={props.onDownloadTXT}
                onOpenFeedback={props.onOpenFeedback}
                onEditSection={props.onEditSection}
                activeSection={props.activeSection}
            />
        );
    }

    return (
        <div
            ref={fullscreenRef}
            className={`w-full h-full overflow-auto ${
                isFullscreen ? 'bg-slate-200 p-6' : 'p-2'
            }`}
            style={{ background: isFullscreen ? '#e2e8f0' : backgroundStyle }}
        >
            <div className="w-full">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 mb-4 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Eye size={18} className="text-purple-600 flex-shrink-0" />
                        <h3 className="text-sm md:text-base font-semibold text-purple-600 truncate">
                            Live PDF Preview
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        {props.onOpenFeedback && (
                            <button
                                type="button"
                                onClick={props.onOpenFeedback}
                                aria-label="Give feedback"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xs font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                            >
                                <MessageCircle size={13} />
                                <span>Feedback</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleToggleFullscreen}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 text-slate-600 hover:text-purple-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                        >
                            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
                        </button>

                        <DownloadDropdown
                            onCopy={props.onCopyCV}
                            onDownloadPDF={props.onDownloadPDF}
                            onDownloadTXT={props.onDownloadTXT}
                            onDownloadPNG={downloadPNG}
                        />
                    </div>
                </div>

                {/* ✅ PNG capture target */}
                <div ref={previewBodyRef}>
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
});

CVPreviewInner.displayName = 'CVPreviewInner';

// ============================================
// ✅ React.memo — skips re-render if props unchanged
// ============================================
// Custom comparison: skip re-render if the data props are shallow-equal.
// This prevents re-renders when only unrelated parent state changes.
// ============================================
const CVPreview = React.memo(CVPreviewInner, (prevProps, nextProps) => {
    // ✅ Fast path: if references are equal, definitely skip
    if (prevProps === nextProps) return true;

    // ✅ Compare the heavy data props
    if (prevProps.personalInfo !== nextProps.personalInfo) return false;
    if (prevProps.phoneNumber !== nextProps.phoneNumber) return false;
    if (prevProps.selectedCountryCode !== nextProps.selectedCountryCode) return false;
    if (prevProps.professionalSummary !== nextProps.professionalSummary) return false;
    if (prevProps.experiences !== nextProps.experiences) return false;
    if (prevProps.educations !== nextProps.educations) return false;
    if (prevProps.projects !== nextProps.projects) return false;
    if (prevProps.certifications !== nextProps.certifications) return false;
    if (prevProps.languages !== nextProps.languages) return false;
    if (prevProps.achievements !== nextProps.achievements) return false;
    if (prevProps.skills !== nextProps.skills) return false;
    if (prevProps.profilePhoto !== nextProps.profilePhoto) return false;
    if (prevProps.template !== nextProps.template) return false;
    if (prevProps.atsScore !== nextProps.atsScore) return false;
    if (prevProps.strength !== nextProps.strength) return false;
    if (prevProps.completionPercentage !== nextProps.completionPercentage) return false;
    if (prevProps.sectionStatuses !== nextProps.sectionStatuses) return false;
    if (prevProps.activeSection !== nextProps.activeSection) return false;

    // ✅ All data props are equal → skip re-render
    return true;
});

export default CVPreview;