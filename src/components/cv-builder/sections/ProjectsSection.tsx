// src/components/cv-builder/sections/ProjectsSection.tsx
// Premium — transparent wrapper, nested cards white with subtle border
// ZERO feature break: bullet logic, AI generation — all intact (scoring & weak-point badges removed)
//
// UI STRUCTURE (per project):
//   1. Project Name *                (user input)
//   2. Technologies / Tools Used *   (user input — METADATA, not evidence)
//   3. Project Details               (user input, optional → proj.details)
//   4. Generate with AI → opens AI Suggestor modal
//   5. Description                   (output field shown on CV; manual editing allowed)
//
// AI input: { name, tech, details }
// AI output: string[]  →  bulletSuggestions  →  user selects up to 3 (no minimum)  →  description
//
// ✅ NEW: Validation — Project Name and Technologies required before generating
// ✅ NEW: Button ALWAYS enabled (only disabled while loading) — blank fields pe toast error
//         (same behavior as ExperienceSection)

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Plus, Minus, X, FileText, Info } from 'lucide-react';
import { ProjectItem } from '../types/cvTypes';

// Selection: user may pick ANY number from 0 up to MAX (minimum is up to the user).
const MAX_AI_BULLETS = 3;
const TARGET_AI_BULLETS = 5;

interface ProjectsSectionProps {
    projects: ProjectItem[];
    addProject: () => void;
    removeProject: (i: number) => void;
    updateProject: (i: number, field: keyof ProjectItem, value: string) => void;
    generateDescription: (index: number, proj: ProjectItem) => void;
    generateAI?: (index: number, proj: ProjectItem) => void | string[] | Promise<void | string[]>;
    generating: string | null;   // ✅ FIX: section-specific key
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

const baseInput =
    'w-full rounded-xl bg-white border text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-3 text-sm';
const normalInput =
    'border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-slate-300';

// Strips ALL leading markers ("• • Text", "1. - Text", "- Text") so the UI's own
// "• " prefix is the only marker that ever appears.
const stripBulletMarkers = (input: string): string => {
    let s = input.trim();
    let prev: string;
    do {
        prev = s;
        s = s
            .replace(/^\s*[•●▪◦·‣∙]\s*/, '')
            .replace(/^\s*[-–—*]\s+/, '')
            .replace(/^\s*\(?\d+[.)]\s+/, '')
            .trim();
    } while (s !== prev);
    return s.replace(/\*\*|__/g, '').trim();
};

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
    projects, addProject, removeProject, updateProject,
    generateDescription, generateAI, generating, aiGenerating,
}) => {
    const [isGenerating, setIsGenerating] = useState<number | null>(null);
    // ✅ ONE-AT-A-TIME: kisi bhi section mein generation chal rahi ho to naya start nahi hoga
    const isBusy = !!generating || !!aiGenerating || isGenerating !== null;

    // ============================================
    // AI BULLET SUGGESTOR MODAL STATE
    // ============================================
    const [isBulletSuggesting, setIsBulletSuggesting] = useState(false);
    const [bulletSuggestions, setBulletSuggestions] = useState<string[]>([]);
    const [selectedBullets, setSelectedBullets] = useState<string[]>([]);
    const [suggestingIndex, setSuggestingIndex] = useState<number | null>(null);
    const [baseDescription, setBaseDescription] = useState('');

    // `description` is the OUTPUT field. `details` is the INPUT field for AI.
    const handleDescriptionChange = (idx: number, value: string) => {
        const lines = value.split('\n');
        const hasBullets = lines.some(line => line.trim().startsWith('•'));
        if (hasBullets) {
            updateProject(idx, 'description', value);
        } else {
            const bulletLines = lines
                .filter(line => line.trim())
                .map(line => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('•')) return `• ${trimmed}`;
                    return trimmed;
                });
            updateProject(idx, 'description', bulletLines.join('\n'));
        }
    };

    // ============================================
    // GENERATE → opens the picker modal
    //
    // ✅ NEW VALIDATION (same as ExperienceSection):
    //    Project Name + Technologies — dono zaroori.
    //    Agar koi bhi khaali ho → toast error + return.
    //    AI call nahi hogi, koi output nahi aayega.
    //    (Button click se pehle hi check — silent return nahi)
    // ============================================
    const handleGenerateBullets = async (idx: number, proj: ProjectItem) => {
        // ✅ ONE-AT-A-TIME guard
        if (isBusy) {
            toast.error('Please wait — another generation is already in progress.', { id: 'gen-busy' });
            return;
        }

        // ✅ VALIDATION — AI call se PEHLE check karo
        const nameOk = proj.name?.trim();
        const techOk = proj.tech?.trim();

        if (!nameOk || !techOk) {
            toast.error('Please fill Project Name and Technologies / Tools Used before generating.');
            return;
        }

        setIsGenerating(idx);
        try {
            let bullets: string[] = [];
            let usedLocalFallback = false;

            // Primary source: the AI service. Use the returned array directly
            // — no fallback merged on top, no Project Details appended, no
            // Technologies appended.
            if (generateAI) {
                const result = await generateAI(idx, proj);
                console.log(
                    `[ProjectsSection] generateAI returned: ${
                        Array.isArray(result) ? `${result.length} bullets` : typeof result
                    } | Project Details length: ${(proj.details || '').length}`,
                );
                if (Array.isArray(result) && result.length > 0) {
                    bullets = result.filter((b): b is string => typeof b === 'string');
                }
            }

            // Fallback ONLY when the AI produced nothing usable.
            // Derived exclusively from Project Details sentences (never
            // from the Project Name or Technologies).
            if (bullets.length === 0) {
                bullets = buildGroundedFallback(proj.details || '');
                usedLocalFallback = bullets.length > 0;
            }
            // Project Details is OPTIONAL: if it is empty and AI returned nothing,
            // still offer basic bullets built from Project Name + Technologies.
            if (bullets.length === 0 && !(proj.details || '').trim()) {
                bullets = buildBasicFallback(proj.name || '', proj.tech || '');
            }

            // Normalize: strip bullet markers/numbering, dedupe, drop empties.
            const seen = new Set<string>();
            bullets = bullets
                .map(b => stripBulletMarkers(b))
                .filter(b => {
                    if (!b) return false;
                    const lower = b.toLowerCase();
                    if (seen.has(lower)) return false;
                    seen.add(lower);
                    return true;
                });

            // Hard cap — never exceed the target, even if something upstream
            // accidentally returned more.
            bullets = bullets.slice(0, TARGET_AI_BULLETS);

            if (bullets.length === 0) {
                toast.error('AI could not generate any bullets. Add more Project Details and try again.');
                return;
            }

            if (usedLocalFallback && (proj.details || '').trim()) {
                console.warn('[ProjectsSection] AI returned no usable bullets — showing sentences from Project Details.');
                toast('AI did not return usable bullets. Showing sentences from your Project Details instead.', {
                    icon: 'ℹ️',
                });
            }

            // Strip previously-added AI bullets from baseDescription so that
            // regenerating does NOT stack new bullets on top of old ones.
            const stripBullets = (text: string) =>
                text
                    .split('\n')
                    .filter(line => !/^\s*[•\-*]\s+/.test(line))
                    .join('\n')
                    .trim();

            setBulletSuggestions(bullets);
            setSelectedBullets([]);
            setBaseDescription(stripBullets(proj.description || ''));
            setSuggestingIndex(idx);
            setIsBulletSuggesting(true);
        } catch (error) {
            console.error('Failed to generate bullets:', error);
            toast.error('Failed to generate bullets');
        } finally {
            setIsGenerating(null);
        }
    };

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
            updateProject(suggestingIndex, 'description', merged);
        }
    };

    const clearSelectedBullets = () => {
        if (selectedBullets.length === 0) return;
        setSelectedBullets([]);
        if (suggestingIndex !== null) {
            updateProject(suggestingIndex, 'description', baseDescription);
        }
    };

    // No minimum — the user decides how many bullets (0–MAX) to keep.
    const handleDone = () => {
        closeBulletSuggestor();
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
                {projects.map((proj, idx) => {
                    const isLoading = generating === `proj-${idx}` || isGenerating === idx || aiGenerating === `proj-${idx}`;

                    return (
                        <div
                            key={idx}
                            className="rounded-xl bg-white border border-slate-200 p-4 md:p-5"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold text-slate-700">
                                    Project #{idx + 1}
                                </span>
                                <div className="flex items-center gap-3">
                                    {projects.length > 1 && (
                                        <button
                                            onClick={() => removeProject(idx)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 text-xs font-medium transition-all duration-200"
                                        >
                                            <Trash2 size={12} />
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* (1) Project Name * */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                        Project Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., AI Career Assistant"
                                        value={proj.name ?? ''}
                                        onChange={e => updateProject(idx, 'name', e.target.value)}
                                        className={`${baseInput} ${normalInput}`}
                                    />
                                </div>

                                {/* (2) Technologies / Tools Used * */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                                        Technologies / Tools Used <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., React, Node.js, MongoDB"
                                        value={proj.tech ?? ''}
                                        onChange={e => updateProject(idx, 'tech', e.target.value)}
                                        className={`${baseInput} ${normalInput}`}
                                    />
                                </div>

                                {/* (3) Project Details — AI INPUT only, optional */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <FileText size={14} className="text-purple-600" />
                                        Project Details <span className="text-slate-400 font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        placeholder="Describe your project, what you built, your role, features, implementation details, results, or any other relevant information..."
                                        value={proj.details || ''}
                                        onChange={e => updateProject(idx, 'details', e.target.value)}
                                        rows={5}
                                        className={`${baseInput} ${normalInput} resize-none`}
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

                                {/* (4) Generate with AI button — ALWAYS enabled (except while loading) */}
                                {/*     Blank fields pe click karne par toast error aayega */}
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={() => handleGenerateBullets(idx, proj)}
                                        disabled={isLoading || isBusy}
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
                                                Generate with AI
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* (5) Description — output field shown on CV */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                                        <FileText size={14} className="text-purple-600" />
                                        Description <span className="text-slate-400 font-normal">(shown on CV)</span>
                                    </label>
                                    <textarea
                                        placeholder="Your final project description for the CV. Use 'Generate with AI' to auto-fill with selected bullets, or type manually."
                                        value={proj.description || ''}
                                        onChange={e => handleDescriptionChange(idx, e.target.value)}
                                        rows={6}
                                        className={`${baseInput} ${normalInput} resize-none`}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={addProject}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
            >
                <Plus size={16} />
                Add Project
            </button>

            {/* AI BULLET SUGGESTOR MODAL — separate UI from Project Details */}
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
                    onClick={handleDone}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                    >
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-purple-600 to-purple-500 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-tight">AI Suggestor</h3>
                                <p className="text-[10px] text-white/80">
                                    {selectedBullets.length}/{MAX_AI_BULLETS} selected · {bulletSuggestions.length} generated
                                </p>
                            </div>
                            <button
                                onClick={handleDone}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Tap + to select, − to remove (up to {MAX_AI_BULLETS})
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

                        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={handleDone}
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

// ----------------------------------------------------------------
// STRICTLY GROUNDED LOCAL FALLBACK
//
// Used ONLY when the AI service returned no usable bullets.
// Derives bullets EXCLUSIVELY from the user's own Project Details
// sentences. Technologies and Project Name are NEVER used here, and
// no filler is added ("Project: X" is not a valid bullet). If there
// are no Project Details, it returns an empty array.
// ----------------------------------------------------------------
function buildGroundedFallback(details: string): string[] {
    const cleanDetails = (details || '').trim();
    if (!cleanDetails) return [];

    const sentences = cleanDetails
        .split(/(?<=[.!?])\s+|\n+/)
        .map(s => s.trim())
        .filter(Boolean);

    const seen = new Set<string>();
    const final: string[] = [];

    for (const raw of sentences) {
        let clean = stripBulletMarkers(raw)
            .replace(/^(?:also|and)\s+/i, '')
            .replace(/[.]+$/, '')
            .trim();
        if (!clean || clean.length < 8) continue;
        clean = clean.charAt(0).toUpperCase() + clean.slice(1);

        const k = clean.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        final.push(clean);
        if (final.length >= TARGET_AI_BULLETS) break;
    }
    return final;
}

// Used ONLY when Project Details is empty AND the AI service returned nothing.
// Project Details is optional, so we still give the user something to pick from,
// using only the project name and the technologies the user listed.
function buildBasicFallback(name: string, tech: string): string[] {
    const n = name.trim();
    const techs = tech.split(/[,;|/]+/).map(t => t.trim()).filter(Boolean);
    if (!n || techs.length === 0) return [];
    const list =
        techs.length === 1
            ? techs[0]
            : `${techs.slice(0, -1).join(', ')} and ${techs[techs.length - 1]}`;
    return [
        `Developed ${n} using ${list}.`,
        `Built core features of ${n} with ${list}.`,
        `Designed and implemented the functionality of ${n}.`,
    ];
}

export default ProjectsSection;