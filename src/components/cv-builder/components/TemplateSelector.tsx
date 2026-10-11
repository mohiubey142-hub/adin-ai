// src/components/cv-builder/components/TemplateSelector.tsx
// Desktop: buttons | Mobile: dropdown

import React from 'react';

interface TemplateSelectorProps {
    template: 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic' | 'teal-curve' | 'standard' | 'ats-pro';
    onTemplateChange: (template: 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic' | 'teal-curve' | 'standard' | 'ats-pro') => void;
    /** ✅ NEW: 'buttons' (desktop) or 'dropdown' (mobile) */
    variant?: 'buttons' | 'dropdown';
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    template,
    onTemplateChange,
    variant = 'buttons',
}) => {
    const templates = [
        { id: 'modern', label: 'Modern' },
        { id: 'minimal', label: 'Minimal' },
        { id: 'classic', label: 'Classic' },
        { id: 'teal-curve', label: 'Teal Curve' },
        { id: 'executive', label: 'Executive' },
        { id: 'creative', label: 'Creative' },
        { id: 'academic', label: 'Academic' },
        { id: 'standard', label: 'Standard' },
        { id: 'ats-pro', label: 'ATS Pro' },
    ];

    // ============ DROPDOWN VARIANT (mobile) ============
    if (variant === 'dropdown') {
        return (
            <div className="flex items-center gap-2">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                    Template
                </label>
                <div className="relative flex-1">
                    <select
                        value={template}
                        onChange={(e) => onTemplateChange(e.target.value as any)}
                        className="w-full appearance-none rounded-lg bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-slate-900 text-xs font-semibold outline-none transition-all duration-200 px-3 py-2 pr-8 cursor-pointer"
                    >
                        {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M3 4.5L6 7.5L9 4.5"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    // ============ BUTTONS VARIANT (desktop) ============
    return (
        <div className="flex justify-center gap-2 py-2 px-3 bg-white/80 backdrop-blur-md border-b border-slate-200 overflow-x-auto scrollbar-hide">
            {templates.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 whitespace-nowrap min-h-[32px] ${
                        template === t.id
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-sm shadow-purple-600/20'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                >
                    {t.label}
                </button>
            ))}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TemplateSelector;