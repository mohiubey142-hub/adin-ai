// src/components/cv-builder/sections/ExperienceSection.tsx
// Premium — transparent wrapper, nested cards white with subtle border
// Level selector removed from UI. All other features intact.
// ✅ UPDATED: Full clean on regenerate — old bullets, plain lines, text sab remove
// ✅ NEW: Validation — Job Title, Company, Start Date, End Date required before generating

import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    Briefcase, Building2, Calendar, Trash2, Plus, Minus, X, Lightbulb, FileText,
} from 'lucide-react';
import { ExperienceItem } from '../types/cvTypes';

interface ExperienceSectionProps {
    experiences: ExperienceItem[];
    addExperience: () => void;
    removeExperience: (i: number) => void;
    updateExperience: (i: number, field: keyof ExperienceItem, value: string) => void;
    generateDescription: (index: number, exp: ExperienceItem) => void;
    generateAI?: (index: number, exp: ExperienceItem) => void | string[] | Promise<void | string[]>;
    generating: string | null;   // ✅ FIX: section-specific key
    aiGenerating?: string | null;   // ✅ ONE-AT-A-TIME (CVBuilder already passes this)
}

const AdinAIIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

const AdinAILoadingIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path d="M12 2L14 6L12 10L10 6L12 2Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 14L14 18L12 22L10 18L12 14Z" fill="#A855F7" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" fill="#3B82F6" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinejoin="round" />
    </svg>
);

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const ExperienceItemComponent: React.FC<{
    exp: ExperienceItem;
    idx: number;
    updateExperience: (i: number, field: keyof ExperienceItem, value: string) => void;
    removeExperience: (i: number) => void;
    onGenerateClick: (index: number, exp: ExperienceItem) => void;
    isLoading: boolean;
    isBusy: boolean;   // ✅ ONE-AT-A-TIME: koi aur generation chal rahi ho to button disabled (spinner nahi)
    totalExperiences: number;
}> = ({ exp, idx, updateExperience, removeExperience, onGenerateClick, isLoading, isBusy, totalExperiences }) => {
    const titleInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-xl bg-white border border-slate-200 hover:border-purple-200 transition-all duration-200 p-4 md:p-5">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm shadow-purple-600/20">
                        <Briefcase size={14} className="text-white" strokeWidth={2.4} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 tracking-tight">
                        Experience #{idx + 1}
                    </span>
                </div>
                {totalExperiences > 1 && (
                    <button
                        onClick={() => removeExperience(idx)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 text-xs font-semibold transition-all duration-200"
                    >
                        <Trash2 size={12} />
                        Remove
                    </button>
                )}
            </div>

            <div className="space-y-3.5">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                        <FileText size={14} className="text-purple-600" />
                        Position Title
                    </label>
                    <input
                        ref={titleInputRef}
                        type="text"
                        placeholder="e.g., Software Engineer"
                        value={exp.title}
                        onChange={e => updateExperience(idx, 'title', e.target.value)}
                        className={`${baseInput} ${normalInput}`}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                        <Building2 size={14} className="text-purple-600" />
                        Company Name
                    </label>
                    <input
                        type="text"
                        placeholder="e.g., Google, Microsoft"
                        value={exp.company}
                        onChange={e => updateExperience(idx, 'company', e.target.value)}
                        className={`${baseInput} ${normalInput}`}
                    />
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                        <Calendar size={14} className="text-purple-600" />
                        Duration
                    </label>
                    <div className="flex gap-2.5">
                        <input
                            type="text"
                            placeholder="Start Date (e.g., Jan 2022)"
                            value={exp.startDate}
                            onChange={e => updateExperience(idx, 'startDate', e.target.value)}
                            className={`${baseInput} w-1/2 ${normalInput}`}
                        />
                        <input
                            type="text"
                            placeholder="End Date (e.g., Present or Dec 2024)"
                            value={exp.endDate}
                            onChange={e => updateExperience(idx, 'endDate', e.target.value)}
                            className={`${baseInput} w-1/2 ${normalInput}`}
                        />
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1.5 gap-3 flex-wrap">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <Lightbulb size={14} className="text-purple-600" />
                            Description <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <button
                            onClick={() => onGenerateClick(idx, exp)}
                            disabled={isLoading || isBusy}
                            className={`h-9 px-3.5 rounded-lg font-semibold text-xs tracking-tight flex items-center gap-2 transition-all duration-200 ${
                                isLoading || isBusy
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20'
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <AdinAILoadingIcon className="w-3.5 h-3.5" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <AdinAIIcon className="w-3.5 h-3.5" />
                                    Generate AI Description
                                </>
                            )}
                        </button>
                    </div>
                    <textarea
                        placeholder="Describe your responsibilities, achievements, and impact..."
                        value={exp.description}
                        onChange={e => updateExperience(idx, 'description', e.target.value)}
                        rows={6}
                        className={`${baseInput} ${normalInput} resize-none`}
                    />
                </div>
            </div>
        </div>
    );
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
    experiences, addExperience, removeExperience, updateExperience,
    generateDescription, generateAI, generating, aiGenerating,
}) => {
    const [isGenerating, setIsGenerating] = useState<number | null>(null);
    // ✅ ONE-AT-A-TIME: kisi bhi section mein generation chal rahi ho to naya start nahi hoga
    const isBusy = !!generating || !!aiGenerating || isGenerating !== null;

    // ============================================
    // ✅ AI BULLET SUGGESTOR MODAL STATE
    // ============================================
    const [isBulletSuggesting, setIsBulletSuggesting] = useState(false);
    const [bulletSuggestions, setBulletSuggestions] = useState<string[]>([]);
    const [selectedBullets, setSelectedBullets] = useState<string[]>([]);
    const [suggestingIndex, setSuggestingIndex] = useState<number | null>(null);

    // ============================================
    // ✅ GENERATE → opens the picker modal
    //    FULL CLEAN: purana sab kuch remove
    //
    // ✅ NEW VALIDATION:
    //    Job Title, Company, Start Date, End Date — chaaron zaroori.
    //    Agar koi bhi khaali ho → toast error + return.
    //    AI call nahi hogi, koi output nahi aayega.
    // ============================================
    const handleGenerateClick = async (idx: number, exp: ExperienceItem) => {
        // ✅ ONE-AT-A-TIME guard
        if (isBusy) {
            toast.error('Please wait — another generation is already in progress.', { id: 'gen-busy' });
            return;
        }

        // ✅ VALIDATION — AI call se PEHLE check karo
        const titleOk = exp.title?.trim();
        const companyOk = exp.company?.trim();
        const startOk = exp.startDate?.trim();
        const endOk = exp.endDate?.trim();

        if (!titleOk || !companyOk || !startOk || !endOk) {
            toast.error('Please fill Job Title, Company, Start Date, and End Date before generating.');
            return;
        }

        setIsGenerating(idx);
        try {
            let bullets: string[] = [];

            if (generateAI) {
                const result = await generateAI(idx, exp);
                if (Array.isArray(result) && result.length > 0) {
                    bullets = result;
                }
            }

            // Fallback: no AI suggestions returned
            if (bullets.length === 0) {
                generateDescription(idx, exp);
                return;
            }

            // Normalize: plain text, no leading bullet marks, no empties/dupes
            const seen = new Set<string>();
            bullets = bullets
                .map(b => b.replace(/^[•\-*]\s*/, '').trim())
                .filter(b => {
                    if (!b) return false;
                    const lower = b.toLowerCase();
                    if (seen.has(lower)) return false;
                    seen.add(lower);
                    return true;
                });

            if (bullets.length === 0) {
                toast.error('AI could not generate any bullets. Try adding more detail.');
                return;
            }

            // ============================================
            // ✅ FULL CLEAN — Description box poori tarah clear karo
            //    Purane bullets, plain lines, text — sab kuch remove
            //    User ko sirf naye bullets dikhein
            // ============================================
            updateExperience(idx, 'description', '');  // ✅ Description box clear

            setBulletSuggestions(bullets);
            setSelectedBullets([]);
            setSuggestingIndex(idx);
            setIsBulletSuggesting(true);
        } catch (error) {
            console.error('Failed to generate experience bullets:', error);
            toast.error('Failed to generate bullets');
        } finally {
            setIsGenerating(null);
        }
    };

    // ✅ Toggle a suggestion on/off — auto-applies to the description live
    //    No selection cap for Experience: pick as many as you want.
    const toggleBullet = (bullet: string) => {
        const isSelected = selectedBullets.includes(bullet);
        const updated = isSelected
            ? selectedBullets.filter(b => b !== bullet)
            : [...selectedBullets, bullet];

        setSelectedBullets(updated);

        if (suggestingIndex !== null) {
            const merged = updated.map(b => `• ${b}`).join('\n');
            updateExperience(suggestingIndex, 'description', merged);
        }
    };

    const addAllBullets = () => {
        const notSelected = bulletSuggestions.filter(b => !selectedBullets.includes(b));
        if (notSelected.length === 0) return;
        const updated = [...bulletSuggestions];
        setSelectedBullets(updated);
        if (suggestingIndex !== null) {
            const merged = updated.map(b => `• ${b}`).join('\n');
            updateExperience(suggestingIndex, 'description', merged);
        }
    };

    const clearSelectedBullets = () => {
        if (selectedBullets.length === 0) return;
        setSelectedBullets([]);
        if (suggestingIndex !== null) {
            updateExperience(suggestingIndex, 'description', '');
        }
    };

    const closeBulletSuggestor = () => {
        setIsBulletSuggesting(false);
        setBulletSuggestions([]);
        setSelectedBullets([]);
        setSuggestingIndex(null);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3.5">
                {experiences.map((exp, idx) => (
                    <ExperienceItemComponent
                        key={idx}
                        exp={exp}
                        idx={idx}
                        updateExperience={updateExperience}
                        removeExperience={removeExperience}
                        onGenerateClick={handleGenerateClick}
                        isLoading={generating === `exp-${idx}` || isGenerating === idx || aiGenerating === `exp-${idx}`}
                        isBusy={isBusy}
                        totalExperiences={experiences.length}
                    />
                ))}
            </div>

            <button
                onClick={addExperience}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Experience
            </button>

            <style>{`
                .scrollbar-none {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {isBulletSuggesting && bulletSuggestions.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeBulletSuggestor}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                    >
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-500 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-tight">AI Suggestor</h3>
                                <p className="text-[10px] text-white/80">
                                    {selectedBullets.length}/{bulletSuggestions.length} selected
                                </p>
                            </div>
                            <button
                                onClick={closeBulletSuggestor}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Tap + to select, − to remove
                                </span>
                                <div className="flex gap-3">
                                    <button onClick={addAllBullets} className="text-[10px] text-purple-600 hover:text-purple-700 transition-colors duration-200 font-medium">
                                        Select All
                                    </button>
                                    <button
                                        onClick={clearSelectedBullets}
                                        disabled={selectedBullets.length === 0}
                                        className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors duration-200 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Clear Selected
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {bulletSuggestions.map((bullet, idx) => {
                                    const selected = selectedBullets.includes(bullet);
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 border ${
                                                selected
                                                    ? 'bg-slate-100 text-slate-900 font-medium border-purple-300'
                                                    : 'bg-slate-50 text-slate-600 font-medium border-transparent hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="leading-snug">{bullet}</span>
                                            <button
                                                onClick={() => toggleBullet(bullet)}
                                                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                                                    selected
                                                        ? 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
                                                        : 'bg-white text-slate-400 border border-slate-300 hover:border-purple-500 hover:text-purple-600'
                                                }`}
                                            >
                                                {selected ? <Minus size={13} /> : <Plus size={13} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={closeBulletSuggestor}
                                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium text-xs tracking-tight transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 active:scale-98"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExperienceSection;