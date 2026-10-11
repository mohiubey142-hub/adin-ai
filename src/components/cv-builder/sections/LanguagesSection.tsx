// src/components/cv-builder/sections/LanguagesSection.tsx
// Premium — transparent wrapper, nested cards white
// ZERO feature break: validation, capitalization, separators, multi-word logic — all intact

import React, { useState } from 'react';
import { Languages, AlertCircle, Trash2, Plus } from 'lucide-react';
import { LanguageItem } from '../types/cvTypes';

interface LanguagesSectionProps {
    languages: LanguageItem[];
    addLanguage: () => void;
    removeLanguage: (i: number) => void;
    updateLanguage: (i: number, field: keyof LanguageItem, value: string) => void;
}

const capitalizeLanguage = (lang: string): string => {
    if (!lang) return '';
    const languageMap: Record<string, string> = {
        urdu: 'Urdu', english: 'English', spanish: 'Spanish', french: 'French',
        german: 'German', chinese: 'Chinese', japanese: 'Japanese', arabic: 'Arabic',
        hindi: 'Hindi', bengali: 'Bengali', russian: 'Russian', portuguese: 'Portuguese',
        italian: 'Italian', turkish: 'Turkish', persian: 'Persian', pashto: 'Pashto',
        sindhi: 'Sindhi', punjabi: 'Punjabi',
    };
    const lowerLang = lang.toLowerCase().trim();
    return languageMap[lowerLang] || lang.charAt(0).toUpperCase() + lang.slice(1).toLowerCase();
};

const hasSeparator = (value: string): boolean => {
    const separators = [',', '/', ';', '|', '&', '+'];
    return separators.some(sep => value.includes(sep));
};

const hasMultipleWords = (value: string): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const words = trimmed.split(/\s+/);
    if (words.length <= 1) return false;
    const multiWordLanguages = [
        'brazilian portuguese', 'simplified chinese', 'traditional chinese',
        'sign language', 'american sign language', 'british sign language',
        'mandarin chinese', 'cantonese chinese', 'new zealand sign language',
        'australian sign language',
    ];
    const lowerValue = trimmed.toLowerCase();
    for (const lang of multiWordLanguages) {
        if (lowerValue.includes(lang)) return false;
    }
    return true;
};

const isValidSingleLanguage = (value: string): boolean => {
    if (!value || !value.trim()) return true;
    const trimmed = value.trim();
    if (hasSeparator(trimmed)) return false;
    if (hasMultipleWords(trimmed)) return false;
    return true;
};

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';
const errorInput =
    'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10';

const LanguagesSection: React.FC<LanguagesSectionProps> = ({
    languages, addLanguage, removeLanguage, updateLanguage,
}) => {
    const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});

    const handleLanguageChange = (idx: number, value: string) => {
        const capitalized = capitalizeLanguage(value);
        const isValid = isValidSingleLanguage(capitalized);
        if (!isValid && capitalized.trim() !== '') {
            setValidationErrors(prev => ({
                ...prev,
                [idx]: 'Please enter only one language. Click "Add Language" to add another language.',
            }));
            return;
        }
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[idx];
            return newErrors;
        });
        updateLanguage(idx, 'language', capitalized);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3.5">
                {languages.map((lang, idx) => (
                    <div
                        key={`language-${idx}`}
                        className="rounded-xl bg-white border border-slate-200 p-4 md:p-5"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm font-semibold text-slate-700">
                                Language #{idx + 1}
                            </span>
                            {languages.length > 1 && (
                                <button
                                    onClick={() => removeLanguage(idx)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                                >
                                    <Trash2 size={12} />
                                    Remove
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    Language
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., English"
                                    value={lang.language}
                                    onChange={e => handleLanguageChange(idx, e.target.value)}
                                    className={`${baseInput} ${validationErrors[idx] ? errorInput : normalInput}`}
                                />
                                {validationErrors[idx] && (
                                    <p className="flex items-start gap-1.5 text-xs text-red-600 mt-1.5 leading-relaxed">
                                        <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                                        <span>{validationErrors[idx]}</span>
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                    Proficiency Level
                                </label>
                                <div className="relative">
                                    <select
                                        value={lang.proficiency || ''}
                                        onChange={e => updateLanguage(idx, 'proficiency', e.target.value)}
                                        className="w-full appearance-none rounded-xl bg-white border border-slate-200 hover:border-slate-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 text-sm outline-none transition-all duration-200 px-4 py-3 pr-10 cursor-pointer"
                                    >
                                        <option value="">None</option>
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Professional Working Proficiency</option>
                                        <option value="Advanced">Advanced Professional Proficiency</option>
                                        <option value="Fluent">Native/Bilingual Proficiency</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={addLanguage}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Language
            </button>
        </div>
    );
};

export default LanguagesSection;