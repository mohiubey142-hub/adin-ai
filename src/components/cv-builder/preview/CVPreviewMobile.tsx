// src/components/cv-builder/preview/CVPreviewMobile.tsx
// ✅ NEW: Feedback button (same size as Download) next to Download dropdown
// ✅ NEW: onEditSection + activeSection pass-through to templates
// ✅ NEW: Download PNG — html-to-image (dynamic import, zero bundle cost)
// ✅ NEW: forwardRef — exposes `downloadPNG` to the parent.
// ✅ NEW: autoDownloadPNG — hidden/off-screen export mode so the
//         Export & Download buttons work even when this preview is
//         not visible (mobile Edit tab).

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Eye, Download, ChevronDown, Copy, FileText, FileDown, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { CVPreviewProps } from './types/previewTypes';

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

import { useTemplateStyles } from './hooks/useTemplateStyles';
import { usePNGDownload } from '../hooks/usePNGDownload';

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

    const hasAny = !!(onCopy || onDownloadPDF || onDownloadTXT || onDownloadPNG);
    if (!hasAny) return null;

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[11px] font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Download size={12} />
                <span>Download</span>
                <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-44 rounded-xl bg-white border border-slate-200 shadow-2xl shadow-black/10 z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150"
                >
                    <button
                        role="menuitem"
                        onClick={() => run(onCopy)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
                    >
                        <Copy size={12} className="text-purple-600 flex-shrink-0" />
                        Copy CV
                    </button>

                    <div className="h-px bg-slate-100" />

                    <button
                        role="menuitem"
                        onClick={() => run(onDownloadPDF)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
                    >
                        <FileDown size={12} className="text-purple-600 flex-shrink-0" />
                        Download PDF
                    </button>

                    <div className="h-px bg-slate-100" />

                    <button
                        role="menuitem"
                        onClick={() => run(onDownloadPNG)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
                    >
                        <ImageIcon size={12} className="text-purple-600 flex-shrink-0" />
                        Download PNG
                    </button>

                    <div className="h-px bg-slate-100" />

                    <button
                        role="menuitem"
                        onClick={() => run(onDownloadTXT)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
                    >
                        <FileText size={12} className="text-purple-600 flex-shrink-0" />
                        Download TXT
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// CVPreviewMobile
// ============================================
type CVPreviewMobileProps = CVPreviewProps & {
    /** When true, waits for layout/fonts/images then captures a PNG automatically. */
    autoDownloadPNG?: boolean;
    /** Called once the automatic capture finishes (success or failure). */
    onAutoDownloadPNGDone?: () => void;
};

const CVPreviewMobile = forwardRef<any, CVPreviewMobileProps>((props, ref) => {
    const { backgroundStyle } = useTemplateStyles(props.template);

    // ✅ PNG capture target — forwarded to parent.
    const previewBodyRef = useRef<HTMLDivElement>(null);

    const { downloadPNG } = usePNGDownload({
        elementRef: previewBodyRef,
        fileName: props.personalInfo?.name || 'My_CV',
        toastId: 'cv-png-mobile',
    });

    useImperativeHandle(ref, () => ({
        downloadPNG,
    }), [downloadPNG]);

    // ✅ Hidden/off-screen export mode: wait for fonts, layout & images, then capture.
    //    Every wait is TIME-BOUNDED — an off-screen lazy image or a stalled
    //    font promise must never leave the export hanging silently.
    useEffect(() => {
        if (!props.autoDownloadPNG) return;
        let cancelled = false;

        const withTimeout = (p: Promise<unknown>, ms: number) =>
            Promise.race([p, new Promise((r) => setTimeout(r, ms))]);

        (async () => {
            try {
                await withTimeout(
                    Promise.resolve((document as any).fonts?.ready),
                    1500
                );
                await new Promise<void>((r) =>
                    requestAnimationFrame(() => requestAnimationFrame(() => r()))
                );
                const imgs = Array.from(
                    previewBodyRef.current?.querySelectorAll('img') ?? []
                ) as HTMLImageElement[];
                await withTimeout(
                    Promise.all(
                        imgs.map((img) => {
                            img.loading = 'eager'; // off-screen lazy images never load otherwise
                            return img.complete
                                ? null
                                : new Promise((r) => {
                                      img.onload = img.onerror = () => r(null);
                                  });
                        })
                    ),
                    2500
                );
                // let templates measure/scale themselves
                await new Promise((r) => setTimeout(r, 300));
                if (!cancelled) await downloadPNG();
            } catch (err) {
                console.error('[CVPreviewMobile] auto PNG export failed:', err);
            } finally {
                if (!cancelled) props.onAutoDownloadPNGDone?.();
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.autoDownloadPNG]);

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

    return (
        <div className="w-full h-full overflow-auto p-2" style={{ background: backgroundStyle }}>
            <div className="w-full">
                {/* Header — heading + feedback + download */}
                <div className="flex items-center justify-between gap-3 mb-4 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Eye size={18} className="text-purple-600 flex-shrink-0" />
                        <h3 className="text-sm font-semibold text-purple-600 truncate">
                            Live PDF Preview
                        </h3>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {props.onOpenFeedback && (
                            <button
                                type="button"
                                onClick={props.onOpenFeedback}
                                aria-label="Give feedback"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-[11px] font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                            >
                                <MessageCircle size={12} />
                                <span>Feedback</span>
                            </button>
                        )}

                        <DownloadDropdown
                            onCopy={props.onCopyCV}
                            onDownloadPDF={props.onDownloadPDF}
                            onDownloadTXT={props.onDownloadTXT}
                            onDownloadPNG={downloadPNG}
                        />
                    </div>
                </div>

                {/* ✅ PNG capture target — wraps ONLY the template. */}
                <div ref={previewBodyRef}>
                    {renderTemplate()}
                </div>
            </div>
        </div>
    );
});

CVPreviewMobile.displayName = 'CVPreviewMobile';

export default CVPreviewMobile;