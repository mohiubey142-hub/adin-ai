// src/components/cv-builder/sections/InterestsSection.tsx
// Interests / Hobbies — same row UX as the Skills section:
// each interest is its own box with a bin icon, click the text to edit inline,
// "Add Interest" opens a new input row. Data stays a plain string[].

import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface InterestsSectionProps {
    interests: string[];
    onChange: (next: string[]) => void;
}

const MAX_INTERESTS = 30;

const InterestsSection: React.FC<InterestsSectionProps> = ({ interests, onChange }) => {
    const [isInputOpen, setIsInputOpen] = useState(false);
    const [newValue, setNewValue] = useState('');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingValue, setEditingValue] = useState('');

    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isInputOpen && inputRef.current) inputRef.current.focus();
    }, [isInputOpen]);

    useEffect(() => {
        if (editingIndex !== null && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingIndex]);

    const hasItems = interests.length > 0;
    const atLimit = interests.length >= MAX_INTERESTS;

    // ---------- add (commas still add several at once) ----------
    const addInterests = (raw: string): boolean => {
        const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) return false;

        const seen = new Set(interests.map(i => i.toLowerCase()));
        const next = [...interests];
        let duplicate = '';
        let limitHit = false;

        parts.forEach(p => {
            if (seen.has(p.toLowerCase())) {
                duplicate = p;
                return;
            }
            if (next.length >= MAX_INTERESTS) {
                limitHit = true;
                return;
            }
            seen.add(p.toLowerCase());
            next.push(p);
        });

        if (next.length === interests.length) {
            if (duplicate) toast.error(`"${duplicate}" already exists`);
            else if (limitHit) toast.error(`You can add up to ${MAX_INTERESTS} interests`);
            return false;
        }
        onChange(next);
        return true;
    };

    const handleAdd = () => {
        if (!newValue.trim()) return;
        if (addInterests(newValue)) {
            setNewValue('');
            setIsInputOpen(false);
        }
    };

    const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            setNewValue('');
            setIsInputOpen(false);
        }
    };

    // ---------- remove ----------
    const removeInterest = (index: number) => {
        onChange(interests.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
            setEditingValue('');
        }
    };

    // ---------- inline edit ----------
    const startEditing = (index: number) => {
        setEditingIndex(index);
        setEditingValue(interests[index]);
    };

    const commitEdit = () => {
        if (editingIndex === null) return;
        const trimmed = editingValue.trim();

        if (!trimmed) {
            removeInterest(editingIndex);
            setEditingIndex(null);
            setEditingValue('');
            return;
        }

        const isDuplicate = interests.some(
            (s, i) => i !== editingIndex && s.toLowerCase() === trimmed.toLowerCase()
        );
        if (isDuplicate) {
            toast.error(`"${trimmed}" already exists`);
            return;
        }

        const updated = [...interests];
        updated[editingIndex] = trimmed;
        onChange(updated);
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

    return (
        <div className="space-y-4">
            {/* ============ INTEREST ROWS — click text to edit ============ */}
            {hasItems && (
                <div className="space-y-2">
                    {interests.map((item, index) => (
                        <div key={`${item}-${index}`} className="flex items-center gap-2">
                            {editingIndex === index ? (
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editingValue}
                                    onChange={e => setEditingValue(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    onBlur={commitEdit}
                                    className="flex-1 min-w-0 rounded-xl bg-white border border-purple-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 outline-none transition-all duration-200 px-3 py-2.5 text-sm"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => startEditing(index)}
                                    className="flex-1 text-left px-3 py-2.5 rounded-xl bg-white hover:bg-purple-50/60 border border-slate-200 hover:border-purple-300 text-slate-900 text-sm min-w-0 transition-all duration-200 cursor-text"
                                >
                                    <span className="truncate block">{item}</span>
                                </button>
                            )}

                            {/* Bin button — removes this interest */}
                            <button
                                type="button"
                                onClick={() => removeInterest(index)}
                                className="shrink-0 w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 text-red-600 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-500/15"
                                aria-label={`Remove ${item}`}
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ============ NEW INTEREST INPUT ROW ============ */}
            {isInputOpen && (
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={newValue}
                        onChange={e => setNewValue(e.target.value)}
                        onKeyDown={handleAddKeyDown}
                        onBlur={() => {
                            // Outside click → close only if nothing typed
                            if (!newValue.trim()) setIsInputOpen(false);
                        }}
                        placeholder="e.g., Photography, Chess, Hiking..."
                        className="flex-1 min-w-0 rounded-xl bg-white border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 px-4 py-2.5 text-sm"
                    />
                    <button
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={handleAdd}
                        disabled={!newValue.trim()}
                        className="shrink-0 h-10 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold text-xs tracking-tight flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 focus:outline-none focus:ring-4 focus:ring-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md"
                        aria-label="Add interest"
                    >
                        <Plus size={14} />
                        Add
                    </button>
                </div>
            )}

            {/* ============ "ADD INTEREST" BUTTON — opens a new input row ============ */}
            {!isInputOpen && (
                <button
                    type="button"
                    onClick={() => (atLimit ? toast.error(`You can add up to ${MAX_INTERESTS} interests`) : setIsInputOpen(true))}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/50 text-slate-500 hover:text-purple-700 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-500/10"
                >
                    <Plus size={16} />
                    Add Interest / Hobby
                </button>
            )}

            <p className="text-xs text-slate-400">
                Click an item to edit it. Use commas to add several at once. Up to {MAX_INTERESTS}.
            </p>
        </div>
    );
};

export default InterestsSection;
