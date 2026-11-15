// src/components/cv-builder/sections/SectionLayoutPanel.tsx
// "Section Order & Visibility": move sections up/down and hide/show them on the CV.
// Hidden sections stay in the editor (data is kept) but are not printed.

import React from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, Info } from 'lucide-react';
import type { CustomSection, SectionLayout } from '../types/cvExtraTypes';
import {
    EMPTY_LAYOUT,
    getSectionTitle,
    isLayoutReadyTemplate,
    resolveSectionOrder,
} from '../constants/sectionRegistry';

interface SectionLayoutPanelProps {
    template: string;
    layout: SectionLayout;
    customSections: CustomSection[];
    onChange: (next: SectionLayout) => void;
}

const SectionLayoutPanel: React.FC<SectionLayoutPanelProps> = ({ template, layout, customSections, onChange }) => {
    const order = resolveSectionOrder(template, layout, customSections);
    const hidden = new Set(layout.hidden);
    const ready = isLayoutReadyTemplate(template);

    const move = (idx: number, dir: -1 | 1) => {
        const to = idx + dir;
        if (to < 0 || to >= order.length) return;
        const next = [...order];
        [next[idx], next[to]] = [next[to], next[idx]];
        onChange({ ...layout, order: next });
    };

    const toggle = (id: string) =>
        onChange({
            ...layout,
            hidden: hidden.has(id) ? layout.hidden.filter(h => h !== id) : [...layout.hidden, id],
        });

    const isCustomized = layout.order !== null || layout.hidden.length > 0;

    return (
        <div className="space-y-4">
            {!ready && (
                <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed">
                    <Info size={15} className="flex-shrink-0 mt-0.5" />
                    <span>
                        Your changes are saved, but the selected template does not use the custom order,
                        new sections and extra fields yet. They will appear on the CV once this template is updated.
                    </span>
                </div>
            )}

            <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {order.map((id, idx) => {
                    const isHidden = hidden.has(id);
                    return (
                        <div key={id} className={`flex items-center gap-2 px-3 py-2.5 ${isHidden ? 'bg-slate-50' : ''}`}>
                            <span className="w-6 text-center text-xs font-semibold text-slate-400">{idx + 1}</span>
                            <span
                                className={`flex-1 min-w-0 truncate text-sm font-medium ${
                                    isHidden ? 'text-slate-400 line-through' : 'text-slate-800'
                                }`}
                            >
                                {getSectionTitle(id, customSections)}
                            </span>
                            <button
                                type="button"
                                onClick={() => move(idx, -1)}
                                disabled={idx === 0}
                                aria-label="Move up"
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ArrowUp size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => move(idx, 1)}
                                disabled={idx === order.length - 1}
                                aria-label="Move down"
                                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ArrowDown size={15} />
                            </button>
                            <button
                                type="button"
                                onClick={() => toggle(id)}
                                aria-label={isHidden ? 'Show on CV' : 'Hide from CV'}
                                title={isHidden ? 'Show on CV' : 'Hide from CV'}
                                className={`w-8 h-8 inline-flex items-center justify-center rounded-lg ${
                                    isHidden ? 'text-slate-400 hover:bg-slate-100' : 'text-purple-600 hover:bg-purple-50'
                                }`}
                            >
                                {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    );
                })}
            </div>

            {isCustomized && (
                <button
                    type="button"
                    onClick={() => onChange({ ...EMPTY_LAYOUT, hidden: [] })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold"
                >
                    <RotateCcw size={13} />
                    Reset to template default
                </button>
            )}
        </div>
    );
};

export default SectionLayoutPanel;
