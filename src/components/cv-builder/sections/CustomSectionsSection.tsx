// src/components/cv-builder/sections/CustomSectionsSection.tsx
// User-created sections (Volunteering, Publications, Courses...). Any number,
// each with its own title and entries. Every entry also supports "+ Add Field".

import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CustomField, CustomSection, CustomSectionEntry } from '../types/cvExtraTypes';
import { createCustomEntry, createCustomSection } from '../utils/cvExtras';
import CustomFieldsEditor from './CustomFieldsEditor';
import DescriptionFormatToggle from './DescriptionFormatToggle';
import { applyDescriptionFormat } from '../utils/descriptionFormat';

interface CustomSectionsSectionProps {
    sections: CustomSection[];
    onChange: (next: CustomSection[]) => void;
}

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

// Only quick-start IDEAS — users can name a section anything they like.
const SUGGESTIONS = ['Volunteering', 'Publications', 'Courses', 'Awards', 'Memberships', 'Hobbies', 'Training', 'Research', 'Conferences', 'Leadership'];

const CustomSectionsSection: React.FC<CustomSectionsSectionProps> = ({ sections, onChange }) => {
    const [newTitle, setNewTitle] = useState('');
    const addNamed = (title: string) => {
        onChange([...sections, createCustomSection(title.trim())]);
        setNewTitle('');
    };
    const patchSection = (id: string, patch: Partial<CustomSection>) =>
        onChange(sections.map(s => (s.id === id ? { ...s, ...patch } : s)));

    const patchEntry = (sid: string, eid: string, patch: Partial<CustomSectionEntry>) =>
        onChange(
            sections.map(s =>
                s.id === sid ? { ...s, entries: s.entries.map(e => (e.id === eid ? { ...e, ...patch } : e)) } : s
            )
        );

    const field = (
        sid: string, e: CustomSectionEntry, key: 'title' | 'subtitle' | 'date',
        label: string, ph: string
    ) => (
        <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">{label}</label>
            <input
                type="text"
                placeholder={ph}
                value={e[key]}
                onChange={ev => patchEntry(sid, e.id, { [key]: ev.target.value } as Partial<CustomSectionEntry>)}
                className={`${baseInput} ${normalInput}`}
            />
        </div>
    );

    return (
        <div className="space-y-4">
            {sections.length === 0 && (
                <div className="rounded-xl bg-white border border-slate-200 p-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-800">
                        Create your own section — you can give it <span className="text-purple-700">any name</span> and add as many as you like.
                    </p>
                    <div className="flex gap-2 mt-3">
                        <input
                            type="text"
                            value={newTitle}
                            maxLength={60}
                            placeholder="Type your section name (e.g., Research Grants)"
                            onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && newTitle.trim()) addNamed(newTitle);
                            }}
                            className={`${baseInput} ${normalInput} flex-1 min-w-0`}
                        />
                        <button
                            type="button"
                            onClick={() => addNamed(newTitle)}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 transition-all duration-200"
                        >
                            <Plus size={15} />
                            Add
                        </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 mb-2">Or start from an idea (you can rename it later):</p>
                    <div className="flex flex-wrap gap-2">
                        {SUGGESTIONS.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => addNamed(s)}
                                className="px-3 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-100 text-purple-800 text-xs font-semibold transition-colors"
                            >
                                + {s}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {sections.map(sec => (
                <div key={sec.id} className="rounded-xl bg-white border border-slate-200 p-4 md:p-5 space-y-4">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 min-w-0">
                            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Section Title</label>
                            <input
                                type="text"
                                placeholder="e.g., Volunteering"
                                value={sec.title}
                                maxLength={60}
                                onChange={e => patchSection(sec.id, { title: e.target.value })}
                                className={`${baseInput} ${normalInput} font-semibold`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => onChange(sections.filter(s => s.id !== sec.id))}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>

                    <div className="space-y-3">
                        {sec.entries.map((entry, idx) => (
                            <div key={entry.id} className="rounded-xl bg-slate-50/60 border border-slate-200 p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-semibold text-slate-700">Entry #{idx + 1}</span>
                                    {sec.entries.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                patchSection(sec.id, { entries: sec.entries.filter(x => x.id !== entry.id) })
                                            }
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                                        >
                                            <Trash2 size={12} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {field(sec.id, entry, 'title', 'Title', 'e.g., Volunteer Teacher')}
                                    {field(sec.id, entry, 'subtitle', 'Organization / Subtitle (Optional)', 'e.g., Edhi Foundation')}
                                    {field(sec.id, entry, 'date', 'Date (Optional)', 'e.g., 2022 - Present')}
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                            Description <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        <div className="mb-2">
                                            <DescriptionFormatToggle
                                                value={entry.descriptionFormat}
                                                align={entry.descriptionAlign}
                                                onAlignChange={a => patchEntry(sec.id, entry.id, { descriptionAlign: a })}
                                                onChange={f => patchEntry(sec.id, entry.id, {
                                                    descriptionFormat: f,
                                                    description: applyDescriptionFormat(entry.description, f),
                                                })}
                                            />
                                        </div>
                                        <textarea
                                            rows={6}
                                            placeholder={'One item per line (choose Bullets, Numbering or Paragraph above)'}
                                            value={entry.description}
                                            onChange={e => patchEntry(sec.id, entry.id, { description: e.target.value })}
                                            className={`${baseInput} ${normalInput} resize-none`}
                                        />
                                    </div>
                                    <CustomFieldsEditor
                                        fields={entry.customFields}
                                        onChange={(f: CustomField[]) => patchEntry(sec.id, entry.id, { customFields: f })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => patchSection(sec.id, { entries: [...sec.entries, createCustomEntry()] })}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200"
                    >
                        <Plus size={15} />
                        {sec.title.trim() ? `Add another entry to "${sec.title.trim()}"` : 'Add another entry to this section'}
                    </button>
                </div>
            ))}

            {sections.length > 0 && (
                <button
                    type="button"
                    onClick={() => onChange([...sections, createCustomSection('')])}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold shadow-md shadow-purple-600/20 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
                >
                    <Plus size={16} />
                    Create a New Section (different title)
                </button>
            )}
        </div>
    );
};

export default CustomSectionsSection;
