// src/components/cv-builder/components/AccordionSection.tsx
// Premium accordion — floating white card on slate canvas
// Independent open/close (multiple allowed)
// Smooth height animation
//
// ✅ NEW: onContentInteract — jab bhi accordion ke ANDAR koi bhi cheez
//         focus ya click ho (input, textarea, button, checkbox, etc.),
//         parent ko us section ki `id` ke saath notify karo. Isse parent
//         preview pane ko us section par scroll karwa sakta hai.
//
//         `onFocusCapture` / `onClickCapture` use kiye hain (React ke
//         bubbling event handlers) taake har child element ke apne
//         onClick/onFocus ko override NA karein — sirf parent ko bubble
//         ho kar mil jayein. Isse koi field tootegi nahi.

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: string;
    /**
     * ✅ Optional — agar diya gaya, to jab bhi accordion ke andar koi bhi
     * child element focus ya click ho, ye callback us `id` ke saath call
     * hoga. Parent isse preview pane ko us section par scroll karwa
     * sakta hai.
     *
     * Undefined hone par, koi extra handler nahi lagta — component
     * bilkul pehle jaisa behave karta hai.
     */
    onContentInteract?: (sectionKey: string) => void;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
    id,
    title,
    subtitle,
    icon,
    isOpen,
    onToggle,
    children,
    badge,
    onContentInteract,
}) => {
    // ✅ Capture-phase handlers: click/focus kisi bhi child par ho,
    //    parent ko milta hai. Ye React ke synthetic events ka
    //    "capture" phase hai, isliye child ke apne handlers block
    //    nahi karte, aur stopPropagation() bhi humein rok nahi sakta.
    const handleContentFocus = onContentInteract
        ? () => onContentInteract(id)
        : undefined;
    const handleContentClick = onContentInteract
        ? () => onContentInteract(id)
        : undefined;

    return (
        <div id={`section-${id}`} className="scroll-mt-24">
            {/* ============ CARD WRAPPER — floating white on slate canvas ============ */}
            <div
                className={`rounded-xl bg-white border transition-all duration-200 overflow-hidden ${
                    isOpen
                        ? 'border-purple-200 shadow-[0_2px_8px_rgba(109,40,217,0.06)]'
                        : 'border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:border-slate-300 hover:shadow-[0_2px_6px_rgba(0,0,0,0.05)]'
                }`}
            >
                {/* ============ HEADER (click to toggle) ============ */}
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isOpen}
                    aria-controls={`section-${id}-content`}
                    className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left focus:outline-none focus:ring-2 focus:ring-purple-500/15 focus:ring-inset transition-colors duration-200"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Icon badge */}
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-purple-600/20">
                            {icon}
                        </div>

                        {/* Title + subtitle */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                                    {title}
                                </h3>
                                {badge && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-semibold uppercase tracking-wide">
                                        {badge}
                                    </span>
                                )}
                            </div>
                            {subtitle && (
                                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                        size={18}
                        className={`flex-shrink-0 transition-transform duration-300 ${
                            isOpen ? 'rotate-180 text-purple-600' : 'text-slate-400'
                        }`}
                    />
                </button>

                {/* ============ CONTENT (smooth height animation) ============ */}
                <div
                    id={`section-${id}-content`}
                    className={`grid transition-all duration-300 ease-in-out ${
                        isOpen
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                    }`}
                >
                    <div className="overflow-hidden">
                        {/* Inner content — subtle slate wash for separation.
                            ✅ onFocusCapture / onClickCapture: andar ke kisi
                            bhi field par focus/click hone par parent ko
                            `id` ke saath notify karo — lekin sirf jab
                            accordion OPEN ho (band accordion ke content
                            par interaction anyway nahi hota). */}
                        <div
                            className="px-4 sm:px-5 pt-4 pb-5 border-t border-slate-100 bg-slate-50/40"
                            onFocusCapture={isOpen ? handleContentFocus : undefined}
                            onClickCapture={isOpen ? handleContentClick : undefined}
                        >
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccordionSection;