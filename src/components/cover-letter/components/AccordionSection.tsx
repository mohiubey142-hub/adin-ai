// src/components/cover-letter/components/AccordionSection.tsx
// =====================================================
// ✅ Cover Letter Accordion Section — CV Builder style
// ✅ UPDATED: Icon always purple (both open and closed)
// =====================================================

import React, { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionSectionProps {
    id: string;
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    badge?: string;
    children: ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
    id,
    title,
    subtitle,
    icon,
    isOpen,
    onToggle,
    badge,
    children,
}) => {
    return (
        <div
            id={id}
            className={`
                rounded-2xl border bg-white overflow-hidden transition-all duration-300
                ${isOpen
                    ? 'border-purple-200 shadow-md shadow-purple-500/5'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }
            `}
        >
            {/* HEADER — Clickable */}
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors duration-200 hover:bg-slate-50/60 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-inset"
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* ✅ Icon — ALWAYS purple (both open and closed) */}
                    {icon && (
                        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-500 text-white shadow-sm shadow-purple-600/20">
                            {icon}
                        </div>
                    )}

                    {/* Title + Subtitle */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3
                                className={`
                                    text-sm font-semibold tracking-tight truncate transition-colors duration-200
                                    ${isOpen ? 'text-slate-900' : 'text-slate-700'}
                                `}
                            >
                                {title}
                            </h3>

                            {badge && (
                                <span
                                    className={`
                                        shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase
                                        ${isOpen
                                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                                        }
                                    `}
                                >
                                    {badge}
                                </span>
                            )}
                        </div>

                        {subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Chevron — rotates on open/close */}
                <div
                    className={`
                        shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isOpen ? 'bg-purple-50 text-purple-600 rotate-180' : 'bg-slate-100 text-slate-500'}
                    `}
                >
                    <ChevronDown size={16} strokeWidth={2.4} />
                </div>
            </button>

            {/* CONTENT — Collapsible */}
            <div
                id={`${id}-content`}
                className={`
                    overflow-hidden transition-all duration-300 ease-in-out
                    ${isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'}
                `}
            >
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-slate-100">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AccordionSection;