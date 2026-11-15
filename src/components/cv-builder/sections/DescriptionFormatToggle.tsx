// src/components/cv-builder/sections/DescriptionFormatToggle.tsx
// Small segmented control (Bullets | Numbering | Paragraph) shown above any description box.
// Controlled: parent stores the value on the item as `descriptionFormat`.

import React from 'react';
import { List, ListOrdered, AlignLeft, AlignJustify } from 'lucide-react';
import type { DescriptionAlign, DescriptionFormat } from '../types/cvExtraTypes';
import {
    DESCRIPTION_FORMATS,
    DESCRIPTION_FORMAT_LABELS,
    normalizeDescriptionFormat,
} from '../utils/descriptionFormat';

interface Props {
    value?: DescriptionFormat | string;
    onChange: (format: DescriptionFormat) => void;
    /** Paragraph alignment (Left | Justify) — the selector only shows while the format is Paragraph. */
    align?: DescriptionAlign | string;
    onAlignChange?: (align: DescriptionAlign) => void;
}

const ICONS: Record<DescriptionFormat, React.ReactNode> = {
    bullets: <List size={13} />,
    numbered: <ListOrdered size={13} />,
    paragraph: <AlignLeft size={13} />,
};

const DescriptionFormatToggle: React.FC<Props> = ({ value, onChange, align, onAlignChange }) => {
    const current = normalizeDescriptionFormat(value);
    const currentAlign: DescriptionAlign = align === 'justify' ? 'justify' : 'left';
    return (
        <div className="flex flex-wrap items-center gap-2">
        <div
            role="radiogroup"
            aria-label="Description format"
            className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
        >
            {DESCRIPTION_FORMATS.map(f => {
                const active = f === current;
                return (
                    <button
                        key={f}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => onChange(f)}
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                            active
                                ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                                : 'text-slate-500 hover:text-slate-700 border border-transparent'
                        }`}
                    >
                        {ICONS[f]}
                        {DESCRIPTION_FORMAT_LABELS[f]}
                    </button>
                );
            })}
        </div>
        {current === 'paragraph' && onAlignChange && (
            <div
                role="radiogroup"
                aria-label="Paragraph alignment"
                className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            >
                {(['left', 'justify'] as DescriptionAlign[]).map(a => {
                    const active = a === currentAlign;
                    return (
                        <button
                            key={a}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => onAlignChange(a)}
                            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                active
                                    ? 'bg-white text-purple-700 shadow-sm border border-purple-200'
                                    : 'text-slate-500 hover:text-slate-700 border border-transparent'
                            }`}
                        >
                            {a === 'left' ? <AlignLeft size={13} /> : <AlignJustify size={13} />}
                            {a === 'left' ? 'Left' : 'Justify'}
                        </button>
                    );
                })}
            </div>
        )}
        </div>
    );
};

export default DescriptionFormatToggle;
