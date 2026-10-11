// src/components/cv-builder/components/DocumentCard.tsx
// ✅ NEW: Paper-like design — click anywhere = editor
// ✅ 3-dot menu: Pin, Rename, Download (PDF/TXT), Delete
// ✅ PNG removed from direct download (available in editor only)

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    MoreVertical, Trash2, Pin, PinOff, Pencil, Download,
    FileText, FileType, ChevronRight,
} from 'lucide-react';
import { CVDocumentMeta } from '../types/documentTypes';
import DocumentThumbnail from './DocumentThumbnail';

interface DocumentCardProps {
    doc: CVDocumentMeta;
    isLatest?: boolean;
    kind?: 'resume' | 'cover-letter';
    userId?: string;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTogglePin: (id: string) => void;
    onRename: (id: string, newTitle: string) => void;
    onDownload?: (id: string, kind: 'resume' | 'cover-letter', format: 'pdf' | 'txt') => void;
}

// ✅ Menu positioning constants (px) — keep widths in sync with the rendered menus
const MENU_WIDTH_PX = 192;           // main 3-dot menu width
const SUBMENU_WIDTH_PX = 128;        // Download (PDF/TXT) submenu width
const SUBMENU_GAP_PX = 4;            // gap between menu and submenu
const MENU_GAP_PX = 6;               // gap between the 3-dot button and the menu
const VIEWPORT_MARGIN_PX = 8;        // minimum distance from the viewport edges
const MENU_Z_INDEX = 99999;

// Button position (viewport coordinates) captured when the menu is opened
interface MenuAnchor {
    top: number;
    bottom: number;
    right: number; // distance from the viewport's right edge to the button's right edge
}

// Final menu position, computed after the menu has been measured
interface MenuPosition {
    top: number;
    right: number;
    submenuOpensLeft: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
    doc, isLatest = false, kind = 'resume', userId,
    onEdit, onDelete, onTogglePin, onRename, onDownload,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
    const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);
    const [downloadSubmenuOpen, setDownloadSubmenuOpen] = useState(false);
    const [renameMode, setRenameMode] = useState(false);
    const [renameValue, setRenameValue] = useState(doc.title);
    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isPinned = !!doc.pinned;
    const docData = (doc as any).data ?? null;
    const thumbnailUrl = (doc as any).thumbnailUrl ?? null;

    useEffect(() => {
        if (!menuOpen) {
            setDownloadSubmenuOpen(false);
            setMenuPos(null);
        }
    }, [menuOpen]);

    // ✅ Measure the menu, then place it fully inside the viewport.
    // Cards at the bottom of the list have no room below the button, so the menu
    // flips ABOVE the button (and is clamped to the viewport as a last resort).
    useLayoutEffect(() => {
        if (!menuOpen || !menuAnchor || !menuRef.current) return;

        const menuHeight = menuRef.current.offsetHeight;
        const spaceBelow = window.innerHeight - menuAnchor.bottom - MENU_GAP_PX - VIEWPORT_MARGIN_PX;
        const spaceAbove = menuAnchor.top - MENU_GAP_PX - VIEWPORT_MARGIN_PX;
        const openAbove = menuHeight > spaceBelow && spaceAbove > spaceBelow;

        const preferredTop = openAbove
            ? menuAnchor.top - MENU_GAP_PX - menuHeight
            : menuAnchor.bottom + MENU_GAP_PX;
        const maxTop = window.innerHeight - VIEWPORT_MARGIN_PX - menuHeight;
        const top = Math.max(VIEWPORT_MARGIN_PX, Math.min(preferredTop, maxTop));

        // Download submenu opens to the right of the menu; flip it to the left
        // when there isn't enough room (cards in the right-most column).
        const submenuOpensLeft =
            menuAnchor.right < SUBMENU_WIDTH_PX + SUBMENU_GAP_PX + VIEWPORT_MARGIN_PX;

        setMenuPos({ top, right: menuAnchor.right, submenuOpensLeft });
    }, [menuOpen, menuAnchor]);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
                const portal = document.getElementById(`doc-menu-${doc.id}`);
                if (portal && portal.contains(e.target as Node)) return;
                setMenuOpen(false);
            }
        };
        const handleScroll = () => setMenuOpen(false);
        const handleResize = () => setMenuOpen(false);
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('scroll', handleScroll, true);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleResize);
        };
    }, [menuOpen, doc.id]);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!menuOpen && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setMenuAnchor({ top: rect.top, bottom: rect.bottom, right: window.innerWidth - rect.right });
        }
        setMenuOpen((v) => !v);
    };

    const handleCardClick = () => {
        if (renameMode) return;
        if (menuOpen) return;
        onEdit(doc.id);
    };

    const handleDelete = () => {
        setMenuOpen(false);
        const label = kind === 'resume' ? 'resume' : 'cover letter';
        if (window.confirm(`Are you sure you want to delete this ${label}?`)) onDelete(doc.id);
    };

    const handlePin = () => {
        setMenuOpen(false);
        onTogglePin(doc.id);
    };

    const handleRenameClick = () => {
        setMenuOpen(false);
        setRenameValue(doc.title);
        setRenameMode(true);
    };

    const handleRenameSave = () => {
        const trimmed = renameValue.trim();
        if (trimmed && trimmed !== doc.title) onRename(doc.id, trimmed);
        setRenameMode(false);
    };

    const handleRenameCancel = () => {
        setRenameMode(false);
        setRenameValue(doc.title);
    };

    const handleDownloadClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onDownload) return;
        setDownloadSubmenuOpen((v) => !v);
    };

    const handleDownloadFormat = (format: 'pdf' | 'txt') => {
        setMenuOpen(false);
        setDownloadSubmenuOpen(false);
        onDownload?.(doc.id, kind, format);
    };

    return (
        <>
            <div
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !renameMode && !menuOpen) onEdit(doc.id);
                }}
                className={`group relative flex flex-col bg-white rounded-2xl transition-all duration-200 cursor-pointer overflow-hidden ${
                    isLatest && !isPinned
                        ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-slate-100 shadow-xl shadow-purple-900/10'
                        : 'shadow-md shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 hover:-translate-y-1 border border-slate-200 hover:border-purple-200'
                }`}
            >
                {/* Thumbnail */}
                <div className="relative w-full aspect-[3/4] bg-white overflow-hidden">
                    <DocumentThumbnail
                        documentId={doc.id}
                        template={doc.template}
                        kind={kind}
                        data={docData}
                        thumbnailUrl={thumbnailUrl}
                        title={doc.title}
                        jobTitle={doc.jobTitle}
                    />

                    {isPinned && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold tracking-wider flex items-center gap-1 shadow-md">
                            <Pin size={9} className="fill-white" />
                            PINNED
                        </div>
                    )}

                    {isLatest && !isPinned && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold tracking-wider shadow-md">
                            LATEST
                        </div>
                    )}

                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-200" />
                </div>

                {/* Bottom bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-t border-slate-100">
                    {renameMode ? (
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                            <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSave();
                                    if (e.key === 'Escape') handleRenameCancel();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="w-full px-2 py-1 rounded-lg bg-slate-50 border border-purple-300 text-slate-900 text-xs outline-none focus:border-purple-500"
                            />
                            <div className="flex gap-1.5">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRenameSave(); }}
                                    className="px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-medium transition"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRenameCancel(); }}
                                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-medium transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h3 className="flex-1 min-w-0 text-slate-900 font-semibold text-xs sm:text-sm truncate">
                                {doc.title}
                            </h3>

                            <button
                                ref={btnRef}
                                onClick={handleMenuToggle}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                                aria-label="More options"
                            >
                                <MoreVertical size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Portal Menu */}
            {/* Rendered hidden first (menuPos = null) so it can be measured, then positioned */}
            {menuOpen && menuAnchor && createPortal(
                <div
                    id={`doc-menu-${doc.id}`}
                    ref={menuRef}
                    style={{
                        position: 'fixed',
                        top: menuPos?.top ?? 0,
                        right: menuPos?.right ?? menuAnchor.right,
                        width: MENU_WIDTH_PX,
                        zIndex: MENU_Z_INDEX,
                        visibility: menuPos ? 'visible' : 'hidden',
                    }}
                    className="rounded-xl border border-slate-200 bg-white shadow-2xl overflow-visible"
                >
                    <button
                        onClick={handlePin}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                        {isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        {isPinned ? 'Unpin' : 'Pin'}
                    </button>

                    <button
                        onClick={handleRenameClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        <Pencil size={14} />
                        Rename
                    </button>

                    {onDownload && (
                        <div className="relative">
                            <button
                                onClick={handleDownloadClick}
                                onMouseEnter={() => setDownloadSubmenuOpen(true)}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <Download size={14} />
                                    Download
                                </span>
                                <ChevronRight
                                    size={12}
                                    className={`transition-transform duration-150 ${downloadSubmenuOpen ? 'rotate-90' : ''}`}
                                />
                            </button>

                            {downloadSubmenuOpen && (
                                <div
                                    style={{ width: SUBMENU_WIDTH_PX }}
                                    className={`absolute top-0 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden ${
                                        menuPos?.submenuOpensLeft ? 'right-full mr-1' : 'left-full ml-1'
                                    }`}
                                >
                                    <button
                                        onClick={() => handleDownloadFormat('pdf')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                    >
                                        <FileText size={13} className="text-red-500" />
                                        PDF
                                    </button>
                                    <button
                                        onClick={() => handleDownloadFormat('txt')}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                    >
                                        <FileType size={13} className="text-slate-500" />
                                        TXT
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="h-px bg-slate-100" />

                    <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

export default DocumentCard;