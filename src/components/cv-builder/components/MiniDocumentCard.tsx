// src/components/cv-builder/components/MiniDocumentCard.tsx
// ✅ Premium clean row — single source of truth

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit3, Trash2, Pin, PinOff, Pencil, Mail, Eye, FileText } from 'lucide-react';
import {
    getTemplateTheme,
    getTemplateLabel,
} from '../constants/templateThemes';

export interface MiniCardMeta {
    id: string;
    title: string;
    jobTitle?: string;
    template: string;
    lastEdited: number;
    pinned?: boolean;
    kind: 'resume' | 'cover-letter';
}

interface MiniDocumentCardProps {
    doc: MiniCardMeta;
    userId?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onQuickView?: (id: string, kind: 'resume' | 'cover-letter', title: string) => void;
}

const formatShortDate = (ts: number): string => {
    if (!ts) return '—';
    const d = new Date(ts);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const rest = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    return `${dayName}, ${rest}`;
};

const MiniDocumentCard: React.FC<MiniDocumentCardProps> = ({
    doc, userId, onEdit, onDelete, onTogglePin, onRename, onQuickView,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
    const [renameMode, setRenameMode] = useState(false);
    const [renameValue, setRenameValue] = useState(doc.title);
    const btnRef = useRef<HTMLButtonElement>(null);

    // ✅ Single source of truth
    const theme = getTemplateTheme(doc.template, doc.kind);
    const templateLabel = getTemplateLabel(doc.template);
    const isPinned = !!doc.pinned;
    const isCoverLetter = doc.kind === 'cover-letter';

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
                const portal = document.getElementById(`mini-menu-${doc.id}`);
                if (portal && portal.contains(e.target as Node)) return;
                setMenuOpen(false);
            }
        };
        const handleScroll = () => setMenuOpen(false);
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [menuOpen, doc.id]);

    const handleMenuToggle = () => {
        if (!menuOpen && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
        }
        setMenuOpen((v) => !v);
    };

    const handleDelete = () => {
        setMenuOpen(false);
        const label = doc.kind === 'resume' ? 'resume' : 'cover letter';
        if (window.confirm(`Are you sure you want to delete this ${label}?`)) onDelete(doc.id);
    };
    const handlePin = () => { setMenuOpen(false); onTogglePin(doc.id); };
    const handleRenameClick = () => { setMenuOpen(false); setRenameValue(doc.title); setRenameMode(true); };
    const handleRenameSave = () => {
        const trimmed = renameValue.trim();
        if (trimmed && trimmed !== doc.title) onRename(doc.id, trimmed);
        setRenameMode(false);
    };
    const handleRenameCancel = () => { setRenameMode(false); setRenameValue(doc.title); };

    const handleQuickView = () => {
        if (onQuickView) onQuickView(doc.id, doc.kind, doc.title);
    };

    return (
        <>
            <div className="group relative w-full rounded-xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-md transition-all duration-300 overflow-hidden flex items-stretch">
                {/* ✅ Colored band — template color (fixed) */}
                <div
                    className="flex-shrink-0 w-16 sm:w-20 relative overflow-hidden flex items-center justify-center"
                    style={{
                        background: `linear-gradient(135deg, ${theme.cardBandFrom} 0%, ${theme.cardBandTo} 100%)`,
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(6px)',
                        }}
                    >
                        {isCoverLetter ? (
                            <Mail size={16} style={{ color: theme.cardText }} />
                        ) : (
                            <FileText size={16} style={{ color: theme.cardText }} />
                        )}
                    </div>

                    {isPinned && (
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shadow-sm">
                            <Pin size={8} className="text-white fill-white" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 px-3 py-2.5 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                        {renameMode ? (
                            <div className="flex items-center gap-1.5">
                                <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleRenameSave();
                                        if (e.key === 'Escape') handleRenameCancel();
                                    }}
                                    autoFocus
                                    className="flex-1 px-2 py-1 rounded-md bg-slate-50 border border-purple-200 text-slate-900 text-xs outline-none focus:border-purple-500"
                                />
                                <button onClick={handleRenameSave} className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-medium transition flex-shrink-0">Save</button>
                                <button onClick={handleRenameCancel} className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition flex-shrink-0">Cancel</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 min-w-0">
                                    <h3 className="text-slate-900 font-medium text-sm truncate">{doc.title}</h3>
                                    {isPinned && (
                                        <div className="flex-shrink-0 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-semibold tracking-wide flex items-center gap-0.5">
                                            <Pin size={8} className="fill-white" /> PINNED
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                                    <span
                                        className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                                        style={{
                                            background: `${theme.cardAccent}15`,
                                            color: theme.cardAccent,
                                        }}
                                    >
                                        {isCoverLetter ? 'Cover Letter' : templateLabel}
                                    </span>
                                    {doc.jobTitle && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate">{doc.jobTitle}</span>
                                        </>
                                    )}
                                    <span>•</span>
                                    <span className="truncate">{formatShortDate(doc.lastEdited)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {!renameMode && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                                onClick={handleQuickView}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                                title="Quick view exact template"
                            >
                                <Eye size={14} />
                            </button>
                            <button
                                onClick={() => onEdit(doc.id)}
                                className={`px-2.5 py-1.5 rounded-lg text-white text-[11px] font-medium transition-all duration-300 flex items-center gap-1 ${
                                    isCoverLetter
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90'
                                        : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90'
                                }`}
                            >
                                <Edit3 size={11} />
                                Edit
                            </button>
                            <button
                                ref={btnRef}
                                onClick={handleMenuToggle}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                aria-label="More options"
                            >
                                <MoreVertical size={14} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {menuOpen && menuPos && createPortal(
                <div
                    id={`mini-menu-${doc.id}`}
                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 99999 }}
                    className="w-40 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
                >
                    <button onClick={handlePin} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors">
                        {isPinned ? <PinOff size={12} /> : <Pin size={12} />}
                        {isPinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={handleRenameClick} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors">
                        <Pencil size={12} /> Rename
                    </button>
                    <div className="h-px bg-slate-100" />
                    <button onClick={handleDelete} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 size={12} /> Delete
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

export default MiniDocumentCard;