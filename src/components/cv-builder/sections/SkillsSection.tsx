// src/components/cv-builder/sections/SkillsSection.tsx
// ============================================
// SKILLS SECTION — Kickresume-style Skill Rows
// ============================================
// Har skill apna chhota input box + Bin icon (remove)
// Skill text pe click → inline edit
// "Add Skill" → naya input row (sirf Add button)
// ZERO feature break: suggestions, duplicate detection — all intact

import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Award, X, Plus, Minus, Trash2 } from 'lucide-react';

// ✅ Skills Suggester Import
import { getSkillsForProfession, matchProfession } from '../utils/skills-suggester';

interface SkillsSectionProps {
    skills: string;
    setSkills: (skills: string) => void;
    enhanceSkills: () => void;
    expandSkills?: () => void;
    generating: boolean;
    personalInfo?: any;
}

// ============================================
// GRAMMAR & SPELLING FIXER (UNCHANGED)
// ============================================
const fixSkillGrammar = (skill: string): string => {
    const corrections: Record<string, string> = {
        'javascrpt': 'JavaScript', 'javasript': 'JavaScript', 'js': 'JavaScript',
        'reactjs': 'React.js', 'react js': 'React.js',
        'nextjs': 'Next.js', 'next js': 'Next.js',
        'nodejs': 'Node.js', 'node js': 'Node.js',
        'typescript': 'TypeScript', 'typscript': 'TypeScript',
        'python': 'Python', 'pythn': 'Python',
        'aws': 'AWS', 'azure': 'Azure', 'gcp': 'Google Cloud Platform',
        'docker': 'Docker', 'kubernetes': 'Kubernetes', 'k8s': 'Kubernetes',
        'git': 'Git', 'github': 'GitHub', 'mysql': 'MySQL',
        'postgresql': 'PostgreSQL', 'mongodb': 'MongoDB', 'redis': 'Redis',
        'figma': 'Figma', 'photoshop': 'Adobe Photoshop',
        'illustrator': 'Adobe Illustrator', 'premier': 'Adobe Premiere Pro',
        'after effects': 'Adobe After Effects', 'excel': 'Microsoft Excel',
        'powerpoint': 'Microsoft PowerPoint', 'word': 'Microsoft Word',
        'outlook': 'Microsoft Outlook', 'quickbooks': 'QuickBooks',
        'salesforce': 'Salesforce', 'hubspot': 'HubSpot',
        'wordpress': 'WordPress', 'shopify': 'Shopify',
        'seo': 'SEO', 'ppc': 'PPC', 'google ads': 'Google Ads', 'meta ads': 'Meta Ads',
        'crm': 'CRM', 'erp': 'ERP', 'agile': 'Agile Methodologies',
        'scrum': 'Scrum', 'kanban': 'Kanban', 'jira': 'Jira',
        'jenkins': 'Jenkins', 'terraform': 'Terraform', 'ansible': 'Ansible',
        'linux': 'Linux', 'unix': 'Unix', 'windows': 'Windows Server',
        'sql': 'SQL', 'nosql': 'NoSQL', 'rest': 'REST APIs', 'graphql': 'GraphQL',
        'html': 'HTML5', 'css': 'CSS3', 'sass': 'SASS/SCSS',
        'tailwind': 'Tailwind CSS', 'bootstrap': 'Bootstrap',
        'mui': 'Material-UI', 'ant design': 'Ant Design'
    };

    const lower = skill.toLowerCase();
    for (const [wrong, correct] of Object.entries(corrections)) {
        if (lower === wrong || lower.includes(wrong)) {
            return correct;
        }
    }

    return skill.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

// ============================================
// ✅ SMART SUGGESTIONS (UNCHANGED)
// ============================================
const getSmartSuggestions = (jobTitle: string, existingSkills: string[]): string[] => {
    const suggestions = getSkillsForProfession(jobTitle);
    const existingLower = existingSkills.map(s => s.toLowerCase());

    const newSkills = suggestions.filter(s => {
        const lower = s.toLowerCase();
        return !existingLower.some(existing =>
            existing.includes(lower) || lower.includes(existing) ||
            existing.split(' ').some(w => lower.includes(w)) ||
            lower.split(' ').some(w => existing.includes(w))
        );
    });

    return newSkills;
};

// ============================================
// MAIN COMPONENT
// ============================================
const SkillsSection: React.FC<SkillsSectionProps> = ({
    skills,
    setSkills,
    enhanceSkills,
    generating,
    personalInfo
}) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [profession, setProfession] = useState('');
    const [matchedKey, setMatchedKey] = useState<string | null>(null);
    const [newSkillValue, setNewSkillValue] = useState('');
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // ✅ Job title detection (for suggestions)
    useEffect(() => {
        const title = personalInfo?.title || '';
        if (title.trim()) {
            const result = matchProfession(title);
            setProfession(title);
            setMatchedKey(result.matchedKey);
        } else {
            setProfession('');
            setMatchedKey(null);
        }
    }, [personalInfo]);

    // ✅ Focus input when opened
    useEffect(() => {
        if (isInputOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isInputOpen]);

    // ✅ Focus edit input when editing starts
    useEffect(() => {
        if (editingIndex !== null && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingIndex]);

    // ============================================
    // ✅ SKILL ARRAY HELPERS
    // ============================================
    const getSkillArray = (): string[] => {
        if (!skills.trim()) return [];
        if (skills.includes(',')) {
            return skills.split(',').map(s => s.trim()).filter(s => s);
        }
        return skills.split('\n')
            .map(s => s.trim())
            .map(s => s.replace(/^[•\-*]\s*/, ''))
            .filter(s => s);
    };

    const setSkillArray = (arr: string[]) => {
        setSkills(arr.join(', '));
    };

    const skillArray = getSkillArray();
    const hasSkills = skillArray.length > 0;

    // ============================================
    // ✅ ADD / REMOVE SKILLS
    // ============================================
    const addSkill = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        const fixed = fixSkillGrammar(trimmed);
        const isDuplicate = skillArray.some(s => s.toLowerCase() === fixed.toLowerCase());
        if (isDuplicate) {
            toast.error(`"${fixed}" already exists`);
            return;
        }

        setSkillArray([...skillArray, fixed]);
    };

    const removeSkill = (index: number) => {
        setSkillArray(skillArray.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    // ============================================
    // ✅ EDIT SKILL (inline)
    // ============================================
    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditingValue(skillArray[index]);
    };

    const commitEdit = () => {
        if (editingIndex === null) return;
        const trimmed = editingValue.trim();

        // Empty → remove skill
        if (!trimmed) {
            removeSkill(editingIndex);
            setEditingIndex(null);
            setEditingValue('');
            return;
        }

        const fixed = fixSkillGrammar(trimmed);

        // Duplicate check (excluding current index)
        const isDuplicate = skillArray.some(
            (s, i) => i !== editingIndex && s.toLowerCase() === fixed.toLowerCase()
        );
        if (isDuplicate) {
            toast.error(`"${fixed}" already exists`);
            return;
        }

        const updated = [...skillArray];
        updated[editingIndex] = fixed;
        setSkillArray(updated);
        setEditingIndex(null);
        setEditingValue('');
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingValue('');
    };

    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            cancelEdit();
        }
    };

    // ============================================
    // ✅ ADD NEW SKILL (input row flow)
    // ============================================
    const handleAddNewSkill = () => {
        if (!newSkillValue.trim()) return;
        addSkill(newSkillValue);
        setNewSkillValue('');
        setIsInputOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddNewSkill();
        } else if (e.key === 'Escape') {
            setNewSkillValue('');
            setIsInputOpen(false);
        }
    };

    // ============================================
    // ✅ FIX SKILLS (UNLOCKED)
    // ============================================
    const fixSkills = (): void => {
        if (!hasSkills) {
            toast.error('Add some skills first');
            return;
        }

        let fixedSkills = skillArray.map(s => fixSkillGrammar(s));

        const seen = new Set();
        fixedSkills = fixedSkills.filter(s => {
            const lower = s.toLowerCase();
            if (seen.has(lower)) return false;
            seen.add(lower);
            return true;
        });

        setSkillArray(fixedSkills);
        const removedCount = skillArray.length - fixedSkills.length;
        toast.success(`✅ Fixed ${removedCount > 0 ? removedCount + ' duplicate' + (removedCount > 1 ? 's' : '') + ' and ' : ''}grammar!`);
    };

    // ============================================
    // ✅ SMART SUGGESTIONS
    // ============================================
    const handleGetSuggestions = () => {
        const title = personalInfo?.title || '';

        if (!title.trim()) {
            toast.error('Please add your job title in Personal Information first');
            return;
        }

        const newSuggestions = getSmartSuggestions(title, skillArray);

        if (newSuggestions.length === 0) {
            toast.success('You already have all recommended skills!');
            return;
        }

        setSuggestions(newSuggestions);
        setSelectedSuggestions([]);
        setIsSuggesting(true);
        toast.success(`💡 ${newSuggestions.length} new skills found!`);
    };

    // ✅ AUTO-ADD on click (Kickresume-style)
    const toggleSuggestion = (skill: string) => {
        if (selectedSuggestions.includes(skill)) {
            const newSkills = skillArray.filter(s => s.toLowerCase() !== skill.toLowerCase());
            setSkillArray(newSkills);
            setSelectedSuggestions(prev => prev.filter(s => s !== skill));
        } else {
            const fixed = fixSkillGrammar(skill);
            const isDuplicate = skillArray.some(s => s.toLowerCase() === fixed.toLowerCase());
            if (isDuplicate) return;
            setSkillArray([...skillArray, fixed]);
            setSelectedSuggestions(prev => [...prev, skill]);
        }
    };

    const addAllSuggestions = () => {
        const notAdded = suggestions.filter(s => !selectedSuggestions.includes(s));
        if (notAdded.length === 0) return;
        const fixedNew = notAdded.map(s => fixSkillGrammar(s));
        setSkillArray([...skillArray, ...fixedNew]);
        setSelectedSuggestions([...suggestions]);
    };

    const removeAllSuggestions = () => {
        if (selectedSuggestions.length === 0) return;
        const lowerAdded = selectedSuggestions.map(s => s.toLowerCase());
        setSkillArray(skillArray.filter(s => !lowerAdded.includes(s.toLowerCase())));
        setSelectedSuggestions([]);
    };

    const closeSuggestor = () => {
        setIsSuggesting(false);
        setSuggestions([]);
        setSelectedSuggestions([]);
    };

    return (
        <div className="space-y-4">
            {/* ============================================
                ACTION BUTTONS (heading + icon removed)
            ============================================ */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    onClick={fixSkills}
                    disabled={!hasSkills}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-xs tracking-tight flex items-center gap-2 transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                    <Award size={13} />
                    Fix Skills
                </button>

                <button
                    onClick={handleGetSuggestions}
                    disabled={isSuggesting || generating}
                    className="h-9 px-3.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-tight flex items-center gap-2 transition-all duration-200 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                    AI Suggestor
                </button>
            </div>

            {/* ============================================
                ✅ SKILL ROWS — click text to edit
            ============================================ */}
            {hasSkills && (
                <div className="space-y-2">
                    {skillArray.map((skill, index) => (
                        <div key={`${skill}-${index}`} className="flex items-center gap-2">
                            {editingIndex === index ? (
                                // ✅ EDIT MODE
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingValue}
                                    onChange={(e) => setEditingValue(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    onBlur={commitEdit}
                                    className="flex-1 rounded-xl bg-white border border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 outline-none transition-all duration-200 px-3 py-2.5 text-sm"
                                />
                            ) : (
                                // ✅ VIEW MODE (click to edit)
                                <button
                                    type="button"
                                    onClick={() => startEditing(index)}
                                    className="flex-1 text-left px-3 py-2.5 rounded-xl bg-white hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-slate-900 text-sm min-w-0 transition-all duration-200 cursor-text"
                                >
                                    <span className="truncate block">{skill}</span>
                                </button>
                            )}

                            {/* Bin button — removes this skill */}
                            <button
                                type="button"
                                onClick={() => removeSkill(index)}
                                className="shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/15"
                                aria-label={`Remove ${skill}`}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ============================================
                ✅ NEW SKILL INPUT ROW (only Add button)
            ============================================ */}
            {isInputOpen && (
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newSkillValue}
                        onChange={(e) => setNewSkillValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => {
                            // Outside click → cancel (only if empty)
                            if (!newSkillValue.trim()) {
                                setIsInputOpen(false);
                            }
                        }}
                        placeholder="e.g., JavaScript, React, Python..."
                        className="flex-1 rounded-xl bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-2.5 text-sm"
                    />

                    {/* Only Add button */}
                    <button
                        type="button"
                        onClick={handleAddNewSkill}
                        disabled={!newSkillValue.trim()}
                        className="shrink-0 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-xs tracking-tight flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md"
                        aria-label="Add skill"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>
            )}

            {/* ============================================
                ✅ "ADD SKILL" BUTTON — opens new input row
            ============================================ */}
            {!isInputOpen && (
                <button
                    onClick={() => setIsInputOpen(true)}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                >
                    <Plus size={16} />
                    Add Skill
                </button>
            )}

            {/* ============================================
                DUPLICATE WARNING
            ============================================ */}
            {skillArray.length !== new Set(skillArray.map(s => s.toLowerCase())).size && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 flex items-center gap-2">
                        <Award size={14} />
                        Duplicate skills detected! Click <strong className="font-semibold">"Fix Skills"</strong> to remove them.
                    </p>
                </div>
            )}

            {/* ============================================
                AI SUGGESTOR MODAL (UNCHANGED — auto-add on click)
            ============================================ */}
            {isSuggesting && suggestions.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={closeSuggestor}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-black/20 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-2 duration-300"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 shrink-0">
                            <div>
                                <h3 className="text-sm font-semibold text-white tracking-tight">AI Suggestor</h3>
                                <p className="text-[10px] text-white/80">
                                    {selectedSuggestions.length}/{suggestions.length} added
                                </p>
                            </div>
                            <button
                                onClick={closeSuggestor}
                                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors duration-200"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto px-5 py-4">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] text-slate-400 font-medium">
                                    Tap + to add, − to remove
                                </span>
                                <div className="flex gap-3">
                                    <button onClick={addAllSuggestions} className="text-[10px] text-emerald-600 hover:text-emerald-700 transition-colors duration-200 font-medium">
                                        Add All
                                    </button>
                                    <button onClick={removeAllSuggestions} className="text-[10px] text-slate-500 hover:text-slate-900 transition-colors duration-200 font-medium">
                                        Remove All
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                {suggestions.map((skill, idx) => {
                                    const added = selectedSuggestions.includes(skill);
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border ${
                                                added
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-500/30'
                                                    : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>{skill}</span>
                                            <button
                                                onClick={() => toggleSuggestion(skill)}
                                                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                                                    added
                                                        ? 'bg-red-500 text-white shadow-sm shadow-red-500/30 hover:bg-red-600'
                                                        : 'bg-white text-slate-400 border border-slate-300 hover:border-emerald-500 hover:text-emerald-600'
                                                }`}
                                            >
                                                {added ? <Minus size={13} /> : <Plus size={13} />}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                            <button
                                onClick={closeSuggestor}
                                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs tracking-tight transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98"
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

export default SkillsSection;