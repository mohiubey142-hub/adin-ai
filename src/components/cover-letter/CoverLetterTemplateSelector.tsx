// src/components/cover-letter/CoverLetterTemplateSelector.tsx
// Template selector for Cover Letter — 6 templates
// Light theme, centered, no sticky

import React from 'react';
import { CoverLetterTemplateId } from './types/coverLetterTypes';

interface CoverLetterTemplateSelectorProps {
    template: CoverLetterTemplateId;
    onTemplateChange: (template: CoverLetterTemplateId) => void;
}

const TEMPLATES: { id: CoverLetterTemplateId; label: string }[] = [
    { id: 'classic', label: 'Classic' },
    { id: 'modern', label: 'Modern' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'professional', label: 'Professional' },
    { id: 'executive', label: 'Executive' },
    { id: 'creative', label: 'Creative' },
];

const CoverLetterTemplateSelector: React.FC<CoverLetterTemplateSelectorProps> = ({
    template,
    onTemplateChange,
}) => {
    return (
        <div className="flex justify-center gap-2 py-2 px-3 bg-white/80 backdrop-blur-md border-b border-slate-200 overflow-x-auto scrollbar-hide">
            {TEMPLATES.map((t) => (
                <button
                    key={t.id}
                    onClick={() => onTemplateChange(t.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all duration-200 whitespace-nowrap min-h-[32px] ${
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

export default CoverLetterTemplateSelector;