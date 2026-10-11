// src/components/cv-builder/sections/AchievementsSection.tsx
// Premium — transparent wrapper, nested cards white
// ZERO feature break: shortDescription AI context, word count validation, Groq — all intact
// ✅ NEW: "Generate AI Bullets" now opens a selection modal (same pattern as
//         Skills' "AI Suggestor" / Projects' bullet picker) — system can
//         generate as many bullet suggestions as it wants, user can only
//         SELECT up to 2.

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trophy, Trash2, Plus, Minus, X, AlertCircle, FileText, Info } from 'lucide-react';
import { AchievementItem } from '../types/cvTypes';

// Max bullets a user is allowed to SELECT from the AI suggestions.
// The AI/system can still generate any number of suggestions — this only caps selection.
const MAX_AI_BULLETS = 2;

interface AchievementsSectionProps {
    achievements: AchievementItem[];
    addAchievement: () => void;
    removeAchievement: (i: number) => void;
    updateAchievement: (i: number, field: keyof AchievementItem, value: string) => void;
    generateDescription: (index: number, ach: AchievementItem) => void;
    // ✅ generateAI may now return the list of AI-generated bullet suggestions
    //    (plain text, no leading "•") so they can be shown in the picker modal.
    //    Still fine to return void — AchievementsSection falls back to
    //    generateDescription in that case, so nothing breaks if the parent
    //    isn't updated yet.
    generateAI?: (index: number, ach: AchievementItem) => void | string[] | Promise<void | string[]>;
    generating: boolean;
    aiGenerating?: string | null;
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

const countWords = (text: string): number => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
    achievements, addAchievement, removeAchievement, updateAchievement,
    generateDescription, generateAI, generating, aiGenerating,
}) => {
    const [isGenerating, setIsGenerating] = useState<number | null>(null);

    // ============================================
    // ✅ AI BULLET SUGGESTOR MODAL STATE
    // (same select/deselect pattern as Skills' AI Suggestor / Projects' picker,
    //  capped at MAX_AI_BULLETS selections)
    // ============================================
    const [isBulletSuggesting, setIsBulletSuggesting] = useState(false);
    const [bulletSuggestions, setBulletSuggestions] = useState<string[]>([]);
    const [selectedBullets, setSelectedBullets] = useState<string[]>([]);
    const [suggestingIndex, setSuggestingIndex] = useState<number | null>(null);
    const [baseDescription, setBaseDescription] = useState('');

    // ============================================
    // ✅ GENERATE → opens the picker modal instead of
    //    writing straight into the textarea
    // ============================================
    const handleGenerateBullets = async (idx: number, ach: AchievementItem) => {
        // eslint-disable-next-line no-console
        console.log('[AchievementsSection] handleGenerateBullets called', { idx, title: ach.title, shortDescription: ach.shortDescription });

        if (!ach.title?.trim()) {
            console.warn('[AchievementsSection] Blocked: title is empty');
            return;
        }
        // ✅ Achievement Details is OPTIONAL — only the title is required.
        //    (More detail = more realistic bullets, but it is never a blocker.)
        setIsGenerating(idx);
        try {
            let bullets: string[] = [];

            console.log('[AchievementsSection] generateAI prop present?', typeof generateAI);

            if (generateAI) {
                const result = await generateAI(idx, ach);
                console.log('[AchievementsSection] generateAI raw result:', result, 'isArray:', Array.isArray(result));
                if (Array.isArray(result) && result.length > 0) {
                    bullets = result;
                }
            } else {
                console.warn('[AchievementsSection] No generateAI prop was passed from parent — modal cannot open, will fall back to generateDescription.');
            }

            // Fallback: no AI suggestions returned — keep old behaviour working
            // by generating straight into the field via generateDescription,
            // and skip opening the picker modal since there's nothing to pick from.
            if (bullets.length === 0) {
                console.warn('[AchievementsSection] bullets array is empty after generateAI — falling back to generateDescription(). Modal will NOT open. Check that your parent component\'s generateAI function returns a string[] (or Promise<string[]>) of plain-text bullets.');
                generateDescription(idx, ach);
                return;
            }

            console.log('[AchievementsSection] bullets received, opening modal:', bullets);

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
                console.warn('[AchievementsSection] bullets array became empty after normalize/dedupe step — modal will NOT open.');
                toast.error('AI could not generate any bullets. Try adding more detail.');
                return;
            }

            // ✅ Strip previously-added AI bullets from baseDescription so that
            //    regenerating does NOT stack new bullets on top of old ones.
            const stripBullets = (text: string) =>
                text
                    .split('\n')
                    .filter(line => !/^\s*[•\-*]\s+/.test(line))
                    .join('\n')
                    .trim();

            console.log('[AchievementsSection] setIsBulletSuggesting(true) — modal should now render', bullets);
            setBulletSuggestions(bullets);
            setSelectedBullets([]);
            setBaseDescription(stripBullets(ach.description || ''));
            setSuggestingIndex(idx);
            setIsBulletSuggesting(true);
        } catch (error) {
            console.error('[AchievementsSection] Failed to generate bullets — exception thrown:', error);
            toast.error('Failed to generate bullets');
        } finally {
            setIsGenerating(null);
        }
    };

    // ✅ Toggle a suggestion on/off — auto-applies to the description live,
    //    exactly like Skills' toggleSuggestion, but blocks a 4th selection.
    const toggleBullet = (bullet: string) => {
        const isSelected = selectedBullets.includes(bullet);
        let updated: string[];

        if (isSelected) {
            updated = selectedBullets.filter(b => b !== bullet);
        } else {
            if (selectedBullets.length >= MAX_AI_BULLETS) {
                toast.error(`You can select up to ${MAX_AI_BULLETS} bullets only`);
                return;
            }
            updated = [...selectedBullets, bullet];
        }

        setSelectedBullets(updated);

        if (suggestingIndex !== null) {
            const merged = [baseDescription, ...updated.map(b => `• ${b}`)]
                .map(part => part.trim())
                .filter(Boolean)
                .join('\n');
            updateAchievement(suggestingIndex, 'description', merged);
        }
    };

    // ✅ Clears only the AI-selected bullets, restores whatever was there before
    const clearSelectedBullets = () => {
        if (selectedBullets.length === 0) return;
        setSelectedBullets([]);
        if (suggestingIndex !== null) {
            updateAchievement(suggestingIndex, 'description', baseDescription);
        }
    };

    const closeBulletSuggestor = () => {
        setIsBulletSuggesting(false);
        setBulletSuggestions([]);
        setSelectedBullets([]);
        setSuggestingIndex(null);
        setBaseDescription('');
    };

    return (
        <div className="space-y-4">
            <div className="space-y-3.5">
                {achievements.map((ach, idx) => {
                    const isLoading = generating || isGenerating === idx || aiGenerating === `ach-${idx}`;
                    const shortDescWordCount = countWords(ach.shortDescription || '');
                    const canGenerate = !!ach.title?.trim();

                    return (
                        <div
                            key={`achievement-${idx}`}
                            className="rounded-xl bg-white border border-slate-200 p-4 md:p-5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold text-slate-700">
                                    Achievement #{idx + 1}
                                </span>
                                {achievements.length > 1 && (
                                    <button
                                        onClick={() => removeAchievement(idx)}
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
                                        Achievement Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Best Developer Award 2024"
                                        value={ach.title}
                                        onChange={e => updateAchievement(idx, 'title', e.target.value)}
                                        className={`${baseInput} ${normalInput}`}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                        Date Received
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Dec 2024"
                                        value={ach.date}
                                        onChange={e => updateAchievement(idx, 'date', e.target.value)}
                                        className={`${baseInput} ${normalInput}`}
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5 gap-3">
                                        <label className="text-sm font-medium text-slate-700">
                                            Achievement Details{' '}
                                            <span className="text-slate-400 font-normal">(Optional)</span>
                                        </label>
                                        {shortDescWordCount > 0 && (
                                            <span className="text-xs font-medium text-slate-400">
                                                {shortDescWordCount} word{shortDescWordCount !== 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>
                                    {/* ✅ Multi-line + auto-grows with the text, so everything the user
                                        typed stays visible (no hidden overflow like a 1-line input). */}
                                    <textarea
                                        placeholder="e.g., Recognized as Employee of the Month for strong customer service performance, handled 40+ customer queries daily and received positive feedback from my manager"
                                        value={ach.shortDescription || ''}
                                        onChange={e => updateAchievement(idx, 'shortDescription', e.target.value)}
                                        rows={3}
                                        ref={el => {
                                            if (el) {
                                                el.style.height = 'auto';
                                                el.style.height = `${el.scrollHeight}px`;
                                            }
                                        }}
                                        className={`${baseInput} ${normalInput} resize-none overflow-y-auto max-h-72 leading-relaxed`}
                                    />
                                    <p className="flex items-start gap-1.5 text-xs text-slate-400 mt-1.5">
                                        <Info size={12} className="flex-shrink-0 mt-0.5" />
                                        <span>
                                            <span className="text-slate-500 font-medium">Add details for the most realistic bullets.</span>{' '}
                                            The more you tell the AI (what you did, where, results), the more accurate your bullets will be.{' '}
                                            <span className="text-slate-500 font-medium">Not shown on your CV.</span>
                                        </span>
                                    </p>
                                </div>

                                <div>
                                    <div className="flex justify-end items-center mb-1.5 gap-3 flex-wrap">
                                        <button
                                            onClick={() => handleGenerateBullets(idx, ach)}
                                            disabled={isLoading || !canGenerate}
                                            className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-xs tracking-tight flex items-center gap-2 transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <AdinAILoadingIcon className="w-3.5 h-3.5" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <AdinAIIcon className="w-3.5 h-3.5" />
                                                    Generate AI Bullets
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <FileText size={14} className="text-purple-600" />
                                        Description <span className="text-slate-400 font-normal">(shown on CV)</span>
                                    </label>
                                    <textarea
                                        placeholder="Your final achievement description for the CV. Use 'Generate AI Bullets' to auto-fill with selected bullets, or type manually."
                                        value={ach.description || ''}
                                        onChange={e => updateAchievement(idx, 'description', e.target.value)}
                                        rows={6}
                                        className={`${baseInput} ${normalInput} resize-none`}
                                    />
                                    {!canGenerate && !isLoading && (
                                        <p className="flex items-center gap-1.5 text-xs text-amber-600 mt-1.5">
                                            <AlertCircle size={12} />
                                            Fill Achievement Title to enable generation
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={addAchievement}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Achievement
            </button>

            {/* ============================================
                ✅ AI BULLET SUGGESTOR MODAL
                Same select/deselect pattern as Skills' AI Suggestor / Projects.
                System can generate any number of suggestions — the user
                can only SELECT up to MAX_AI_BULLETS (2) of them.
            ============================================ */}
            {/* Hides the scrollbar visually across browsers while keeping
                the modal body fully scrollable (wheel, touch, drag, keyboard). */}
            <style>{`
                .scrollbar-none {
                    scrollbar-width: none;       /* Firefox */
                    -ms-overflow-style: none;     /* old Edge / IE */
                }
                .scrollbar-none::-webkit-scrollbar {
                    display: none;                /* Chrome, Safari, new Edge */
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
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-500 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-tight">AI Suggestor</h3>
                                <p className="text-[10px] text-white/80">
                                    {selectedBullets.length}/{MAX_AI_BULLETS} selected · {bulletSuggestions.length} generated
                                </p>
                            </div>
                            <button
                                onClick={closeBulletSuggestor}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body — min-h-0 is required inside a flex-col parent
                            or this child ignores its flex-1 height and never scrolls. */}
                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Tap + to select, − to remove (max {MAX_AI_BULLETS})
                                </span>
                                <button
                                    onClick={clearSelectedBullets}
                                    disabled={selectedBullets.length === 0}
                                    className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors duration-200 font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Clear Selected
                                </button>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {bulletSuggestions.map((bullet, idx) => {
                                    const selected = selectedBullets.includes(bullet);
                                    const disableAdd = !selected && selectedBullets.length >= MAX_AI_BULLETS;
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                                selected
                                                    ? 'bg-purple-50 text-purple-700 border-purple-500/30'
                                                    : disableAdd
                                                        ? 'bg-slate-50 text-slate-400 border-transparent'
                                                        : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="leading-snug">{bullet}</span>
                                            <button
                                                onClick={() => toggleBullet(bullet)}
                                                disabled={disableAdd}
                                                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                                                    selected
                                                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/30 hover:bg-red-600'
                                                        : disableAdd
                                                            ? 'bg-white text-slate-300 border border-slate-200 cursor-not-allowed'
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

                        {/* Modal Footer */}
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

export default AchievementsSection;