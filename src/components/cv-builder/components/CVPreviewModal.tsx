// src/components/cv-builder/components/CVPreviewModal.tsx
// ✅ FIXED: Visible purple scrollbars (override global CSS) + cursor zoom + drag-to-pan

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertCircle, ZoomIn, ZoomOut, RotateCcw, Move, MousePointer2 } from 'lucide-react';
import { loadDocumentData } from '../utils/storageUtils';

import MinimalTemplate from '../preview/components/MinimalTemplate';
import ClassicTemplate from '../preview/components/ClassicTemplate';
import ModernTemplate from '../preview/components/ModernTemplate';
import TealCurveTemplate from '../preview/components/TealCurveTemplate';
import ExecutiveTemplate from '../preview/components/ExecutiveTemplate';
import CreativeTemplate from '../preview/components/CreativeTemplate';
import AcademicTemplate from '../preview/components/AcademicTemplate';
import StandardTemplate from '../preview/components/StandardTemplate';
import CorporateTemplate from '../preview/components/CorporateTemplate';
import ATSProTemplate from '../preview/components/ATSProTemplate';

interface CVPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    documentId: string;
    documentTitle?: string;
}

const A4_WIDTH = 794;

const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
    isOpen,
    onClose,
    userId,
    documentId,
    documentTitle,
}) => {
    const [data, setData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(0.7);
    const [autoFitDone, setAutoFitDone] = useState(false);
    const [showHint, setShowHint] = useState(true);

    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
    const [isPanning, setIsPanning] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        if (!userId || !documentId) return;

        setLoading(true);
        setAutoFitDone(false);
        setShowHint(true);
        try {
            const raw = loadDocumentData(userId, documentId);
            setData(raw);
        } catch (e) {
            console.error('[CVPreviewModal] Load failed:', e);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [isOpen, userId, documentId]);

    useEffect(() => {
        if (!isOpen || !data || autoFitDone) return;
        if (!scrollRef.current) return;

        const t = setTimeout(() => {
            const containerWidth = scrollRef.current?.clientWidth || 0;
            if (containerWidth === 0) return;
            const availableWidth = containerWidth - 60;
            const fitZoom = Math.max(0.4, Math.min(1.0, availableWidth / A4_WIDTH));
            setZoom(fitZoom);
            setAutoFitDone(true);
        }, 50);

        return () => clearTimeout(t);
    }, [isOpen, data, autoFitDone]);

    useEffect(() => {
        if (!isOpen || !showHint) return;
        const t = setTimeout(() => setShowHint(false), 4000);
        return () => clearTimeout(t);
    }, [isOpen, showHint]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen) return;
        const original = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = original;
        };
    }, [isOpen]);

    const zoomAtPoint = useCallback((delta: number, clientX: number, clientY: number) => {
        const container = scrollRef.current;
        if (!container) return;

        setZoom((prevZoom) => {
            const newZoom = Math.max(0.3, Math.min(3.0, prevZoom + delta));
            if (newZoom === prevZoom) return prevZoom;

            const rect = container.getBoundingClientRect();
            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;
            const contentX = container.scrollLeft + mouseX;
            const contentY = container.scrollTop + mouseY;
            const ratio = newZoom / prevZoom;

            requestAnimationFrame(() => {
                if (!scrollRef.current) return;
                scrollRef.current.scrollLeft = contentX * ratio - mouseX;
                scrollRef.current.scrollTop = contentY * ratio - mouseY;
            });

            return newZoom;
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const container = scrollRef.current;
        if (!container) return;

        const handler = (e: WheelEvent) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.15 : -0.15;
                zoomAtPoint(delta, e.clientX, e.clientY);
            }
        };
        container.addEventListener('wheel', handler, { passive: false });
        return () => container.removeEventListener('wheel', handler);
    }, [isOpen, zoomAtPoint]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        if (e.button !== 0) return;
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        isDragging.current = true;
        setIsPanning(true);
        dragStart.current = {
            x: e.clientX,
            y: e.clientY,
            scrollLeft: scrollRef.current.scrollLeft,
            scrollTop: scrollRef.current.scrollTop,
        };
        e.preventDefault();
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        scrollRef.current.scrollLeft = dragStart.current.scrollLeft - dx;
        scrollRef.current.scrollTop = dragStart.current.scrollTop - dy;
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
        setIsPanning(false);
    }, []);

    useEffect(() => {
        const handler = () => {
            isDragging.current = false;
            setIsPanning(false);
        };
        window.addEventListener('mouseup', handler);
        return () => window.removeEventListener('mouseup', handler);
    }, []);

    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;
        e.preventDefault();
        const delta = e.shiftKey ? -0.3 : 0.3;
        zoomAtPoint(delta, e.clientX, e.clientY);
    }, [zoomAtPoint]);

    if (!isOpen) return null;

    const renderTemplate = () => {
        if (!data) return null;

        const templateProps = {
            personalInfo: data.personalInfo || {
                name: '', title: '', email: '', phone: '',
                address: '', linkedin: '', github: '', portfolio: '',
            },
            phoneNumber: data.phoneNumber || '',
            selectedCountryCode: data.selectedCountryCode || 'PK',
            professionalSummary: data.professionalSummary || '',
            experiences: Array.isArray(data.experiences) ? data.experiences : [],
            educations: Array.isArray(data.educations) ? data.educations : [],
            projects: Array.isArray(data.projects) ? data.projects : [],
            certifications: Array.isArray(data.certifications) ? data.certifications : [],
            languages: Array.isArray(data.languages) ? data.languages : [],
            achievements: Array.isArray(data.achievements) ? data.achievements : [],
            skills: data.skills || '',
            profilePhoto: data.profilePhoto || null,
            template: data.template || 'modern',
            atsScore: 0,
            strength: { text: '', color: '', bg: '', icon: '' },
            completionPercentage: 0,
            sectionStatuses: {},
        };

        switch (data.template) {
            case 'minimal':    return <MinimalTemplate {...templateProps} />;
            case 'classic':    return <ClassicTemplate {...templateProps} />;
            case 'teal-curve': return <TealCurveTemplate {...templateProps} />;
            case 'executive':  return <ExecutiveTemplate {...templateProps} />;
            case 'creative':   return <CreativeTemplate {...templateProps} />;
            case 'academic':   return <AcademicTemplate {...templateProps} />;
            case 'standard':   return <StandardTemplate {...templateProps} />;
            case 'corporate':  return <CorporateTemplate {...templateProps} />;
            case 'ats-pro':    return <ATSProTemplate {...templateProps} />;
            case 'modern':
            default:           return <ModernTemplate {...templateProps} />;
        }
    };

    const handleZoomIn = () => {
        const container = scrollRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        zoomAtPoint(0.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
    };
    const handleZoomOut = () => {
        const container = scrollRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        zoomAtPoint(-0.2, rect.left + rect.width / 2, rect.top + rect.height / 2);
    };
    const handleZoomReset = () => {
        const container = scrollRef.current;
        if (!container) return;
        const availableWidth = container.clientWidth - 60;
        const fitZoom = Math.max(0.4, Math.min(1.0, availableWidth / A4_WIDTH));
        setZoom(fitZoom);
        requestAnimationFrame(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollLeft = 0;
                scrollRef.current.scrollTop = 0;
            }
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col bg-slate-200">
            {/* ✅ FIXED: Custom scrollbar with !important to override global CSS */}
            <style>{`
                .cv-modal-scroll {
                    overflow-y: scroll !important;
                    overflow-x: auto !important;
                    scrollbar-width: auto !important;
                    scrollbar-color: #a855f7 #e2e8f0 !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar {
                    width: 14px !important;
                    height: 14px !important;
                    display: block !important;
                    background: #e2e8f0 !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar-track {
                    background: #e2e8f0 !important;
                    border-radius: 7px !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #a855f7, #7c3aed) !important;
                    border-radius: 7px !important;
                    border: 3px solid #e2e8f0 !important;
                    min-height: 40px !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #9333ea, #6d28d9) !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar-corner {
                    background: #e2e8f0 !important;
                }
                
                .cv-modal-scroll::-webkit-scrollbar-button {
                    display: none !important;
                }
            `}</style>

            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-300 bg-white flex-shrink-0">
                <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-bold text-slate-900 truncate">
                        {documentTitle || 'Resume Preview'}
                    </h2>
                </div>

                <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0">
                    <button
                        onClick={handleZoomOut}
                        className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                        title="Zoom out"
                    >
                        <ZoomOut size={13} className="text-slate-600" />
                    </button>
                    <span className="text-[11px] font-medium text-slate-600 min-w-[40px] text-center tabular-nums select-none">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                        title="Zoom in"
                    >
                        <ZoomIn size={13} className="text-slate-600" />
                    </button>
                    <button
                        onClick={handleZoomReset}
                        className="w-7 h-7 rounded-md hover:bg-white flex items-center justify-center transition-colors"
                        title="Fit to width"
                    >
                        <RotateCcw size={11} className="text-slate-600" />
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors"
                    aria-label="Close preview"
                >
                    <X size={16} className="text-slate-600" />
                </button>
            </div>

            {/* Body */}
            <div
                ref={scrollRef}
                className="cv-modal-scroll flex-1 relative select-none"
                style={{
                    cursor: isPanning ? 'grabbing' : 'grab',
                    backgroundColor: '#cbd5e1',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
            >
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                    </div>
                ) : !data ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle size={40} className="text-amber-500 mb-3" />
                        <p className="text-slate-600 font-medium">Preview not available</p>
                        <p className="text-slate-400 text-xs mt-1">
                            Document data not found in storage
                        </p>
                    </div>
                ) : (
                    <div
                        className="relative"
                        style={{
                            width: A4_WIDTH * zoom,
                            minHeight: '100%',
                            padding: '24px',
                            margin: '0 auto',
                            boxSizing: 'content-box',
                        }}
                    >
                        <div
                            style={{
                                width: A4_WIDTH,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top left',
                            }}
                            className="shadow-2xl bg-white"
                        >
                            {renderTemplate()}
                        </div>
                    </div>
                )}

                {showHint && !loading && data && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur text-white text-xs font-medium shadow-2xl flex items-center gap-2 pointer-events-none">
                        <MousePointer2 size={13} className="text-purple-300" />
                        <span><kbd className="px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">Ctrl</kbd> + Scroll to zoom at cursor • Double-click to zoom</span>
                    </div>
                )}

                {!loading && data && (
                    <div className="absolute bottom-3 right-3 px-2.5 py-1.5 rounded-lg bg-slate-900/75 backdrop-blur text-white text-[10px] font-medium flex items-center gap-1.5 pointer-events-none">
                        <Move size={11} />
                        Drag to pan • Ctrl+Scroll to zoom
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-3 py-1.5 border-t border-slate-300 bg-white flex items-center justify-between flex-shrink-0">
                <p className="text-[10px] text-slate-400">
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[9px] font-mono">ESC</kbd> to close
                </p>
                <button
                    onClick={onClose}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                    Close
                </button>
            </div>
        </div>,
        document.body
    );
};

export default CVPreviewModal;