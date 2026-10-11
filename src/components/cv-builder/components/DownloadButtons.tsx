// src/components/cv-builder/components/DownloadButtons.tsx
// ✅ NEW: PNG download button — added alongside Copy / PDF / TXT.
//         The actual capture logic lives in the parent (CVBuilder),
//         which forwards the ref to <CVPreview /> via forwardRef.

import React from 'react';
import { Copy, Download, FileText, Trash2, Image as ImageIcon } from 'lucide-react';

interface DownloadButtonsProps {
    onCopy: () => void;
    onDownloadPDF: () => void;
    onDownloadTXT: () => void;
    onDownloadPNG?: () => void;
    onClear: () => void;
}

const DownloadButtons: React.FC<DownloadButtonsProps> = ({
    onCopy,
    onDownloadPDF,
    onDownloadTXT,
    onDownloadPNG,
    onClear,
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            <button
                onClick={onCopy}
                aria-label="Copy CV"
                className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-200">
                    <Copy size={19} className="text-white" strokeWidth={2.4} />
                </div>
                <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
                    Copy CV
                </span>
            </button>

            <button
                onClick={onDownloadPDF}
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

            {onDownloadPNG && (
                <button
                    onClick={onDownloadPNG}
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
            )}

            <button
                onClick={onDownloadTXT}
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

            <button
                onClick={onClear}
                aria-label="Clear all data"
                className="group flex flex-col items-center justify-center gap-2.5 py-5 md:py-6 rounded-2xl bg-white border border-slate-200 hover:border-red-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 focus:outline-none focus:ring-4 focus:ring-red-500/15 transition-all duration-200"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-sm shadow-red-500/25 group-hover:scale-105 transition-transform duration-200">
                    <Trash2 size={19} className="text-white" strokeWidth={2.4} />
                </div>
                <span className="text-xs md:text-sm font-semibold text-slate-800 tracking-tight">
                    Clear All
                </span>
            </button>
        </div>
    );
};

export default DownloadButtons;