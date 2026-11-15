// src/components/cv-builder/sections/CustomFieldsEditor.tsx
// Reusable "+ Add Field" (Label: Value) editor. Drop it inside ANY item card.
// Controlled: parent owns `fields`, this only calls onChange with the new array.

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomField } from '../types/cvExtraTypes';
import { createCustomField } from '../utils/cvExtras';

interface CustomFieldsEditorProps {
    fields?: CustomField[];
    onChange: (fields: CustomField[]) => void;
    /** Placeholder hints, e.g. "GPA" / "3.9" */
    labelPlaceholder?: string;
    valuePlaceholder?: string;
}

const smallInput =
    'w-full rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-3 py-2 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const CustomFieldsEditor: React.FC<CustomFieldsEditorProps> = ({
    fields,
    onChange,
    labelPlaceholder = 'Label (e.g., Supervisor)',
    valuePlaceholder = 'Value (e.g., Dr. Ahmed)',
}) => {
    const list = fields || [];

    const update = (id: string, key: 'label' | 'value', v: string) =>
        onChange(list.map(f => (f.id === id ? { ...f, [key]: v } : f)));
    const remove = (id: string) => onChange(list.filter(f => f.id !== id));
    const add = () => onChange([...list, createCustomField()]);

    return (
        <div className="pt-1">
            {list.length > 0 && (
                <div className="space-y-2 mb-2.5">
                    {list.map(f => (
                        <div key={f.id} className="flex items-center gap-2">
                            {/* Label on top, value below (stacked) */}
                            <div className="flex flex-col gap-2 flex-1 min-w-0">
                                <input
                                    type="text"
                                    value={f.label}
                                    placeholder={labelPlaceholder}
                                    onChange={e => update(f.id, 'label', e.target.value)}
                                    className={smallInput}
                                    aria-label="Field label"
                                />
                                <input
                                    type="text"
                                    value={f.value}
                                    placeholder={valuePlaceholder}
                                    onChange={e => update(f.id, 'value', e.target.value)}
                                    className={smallInput}
                                    aria-label="Field value"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => remove(f.id)}
                                aria-label="Remove field"
                                className="shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/15"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-xs font-semibold transition-all duration-200"
            >
                <Plus size={13} />
                Add Field
            </button>
        </div>
    );
};

export default CustomFieldsEditor;
