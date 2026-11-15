// src/components/cv-builder/sections/ReferencesSection.tsx

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomField, ReferenceItem, ReferencesData } from '../types/cvExtraTypes';
import { createReference } from '../utils/cvExtras';
import CustomFieldsEditor from './CustomFieldsEditor';

interface ReferencesSectionProps {
    references: ReferencesData;
    onChange: (next: ReferencesData) => void;
}

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const ReferencesSection: React.FC<ReferencesSectionProps> = ({ references, onChange }) => {
    const items = references.items;

    const setItems = (next: ReferenceItem[]) => onChange({ ...references, items: next });
    const updateItem = (id: string, patch: Partial<ReferenceItem>) =>
        setItems(items.map(r => (r.id === id ? { ...r, ...patch } : r)));

    const text = (r: ReferenceItem, key: 'name' | 'position' | 'company' | 'email' | 'phone', label: string, ph: string, type = 'text') => (
        <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
            <input
                type={type}
                placeholder={ph}
                value={r[key]}
                onChange={e => updateItem(r.id, { [key]: e.target.value } as Partial<ReferenceItem>)}
                className={`${baseInput} ${normalInput}`}
            />
        </div>
    );

    return (
        <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-xl bg-white border border-slate-200 p-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={references.availableOnRequest}
                    onChange={e => onChange({ ...references, availableOnRequest: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-purple-600"
                />
                <span>
                    <span className="block text-sm font-semibold text-slate-800">
                        Show "References available on request"
                    </span>
                    <span className="block text-xs text-slate-500 mt-0.5">
                        Printed only when you have not added any reference below.
                    </span>
                </span>
            </label>

            <div className="space-y-3.5">
                {items.map((r, idx) => (
                    <div key={r.id} className="rounded-xl bg-white border border-slate-200 p-4 md:p-5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-slate-700">Reference #{idx + 1}</span>
                            <button
                                type="button"
                                onClick={() => setItems(items.filter(x => x.id !== r.id))}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                            >
                                <Trash2 size={12} />
                                Remove
                            </button>
                        </div>
                        <div className="space-y-3">
                            {text(r, 'name', 'Full Name', 'e.g., Dr. Sara Khan')}
                            {text(r, 'position', 'Position', 'e.g., Senior Manager')}
                            {text(r, 'company', 'Company / Organization', 'e.g., Acme Pvt Ltd')}
                            {text(r, 'email', 'Email', 'e.g., sara@example.com', 'email')}
                            {text(r, 'phone', 'Phone', 'e.g., +92 300 1234567', 'tel')}
                            <CustomFieldsEditor
                                fields={r.customFields}
                                onChange={(f: CustomField[]) => updateItem(r.id, { customFields: f })}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => setItems([...items, createReference()])}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Reference
            </button>
        </div>
    );
};

export default ReferencesSection;
