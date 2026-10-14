// src/components/global/GlobalSidebar.tsx
// ✅ FULL PROFESSIONAL POLISH
// ✅ UPDATED: Editors section labels → "CV Builder" + "Cover Letter"
// ✅ UPDATED: Sidebar user ID shows only first 8 characters + "..." (truncated)
//             Full ID is always visible in ProfilePage.
// - Toggle drawer design (ChatGPT/DeepSeek style)
// - Logo image from public/icon-1024x1024.png
// - Clean header (no purple glow)
// - Section labels: MAIN / TEMPLATES / EDITORS
// - Hidden scrollbar on nav (still scrollable)

import React from 'react';
import {
    X, Home, FileText, Palette, Mail,
    ChevronRight,
} from 'lucide-react';
import { useNavigation, AppRoute } from '../../contexts/NavigationContext';

interface GlobalSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentPage: AppRoute;
    userId?: string;
    userName?: string;
    hasPinSet?: boolean;
    onOpenProfile?: () => void;
}

interface SidebarItem {
    id: AppRoute;
    label: string;
    icon: React.ElementType;
    comingSoon?: boolean;
}

interface SidebarSection {
    title: string;
    items: SidebarItem[];
}

const sidebarSections: SidebarSection[] = [
    {
        title: 'Main',
        items: [
            { id: 'home', label: 'Home', icon: Home },
            { id: 'documents', label: 'My Documents', icon: FileText },
        ],
    },
    {
        title: 'Templates',
        items: [
            { id: 'templates', label: 'CV Templates', icon: Palette },
            { id: 'cover-templates', label: 'Cover Letter Templates', icon: Mail },
        ],
    },
    {
        title: 'Editors',
        items: [
            { id: 'cv-builder', label: 'CV Builder', icon: FileText },
            { id: 'cover-letter', label: 'Cover Letter', icon: Mail },
        ],
    },
];

const getAvatarLetter = (name: string): string => {
    if (!name || name === 'User') return 'U';
    return name.trim().charAt(0).toUpperCase();
};

const getAvatarGradient = (name: string): string => {
    const gradients = [
        'from-violet-500 via-purple-500 to-fuchsia-500',
        'from-blue-500 via-cyan-500 to-teal-500',
        'from-rose-500 via-pink-500 to-fuchsia-500',
        'from-amber-500 via-orange-500 to-red-500',
        'from-emerald-500 via-teal-500 to-cyan-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
};

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
    isOpen,
    onClose,
    currentPage,
    userId,
    userName = 'User',
    onOpenProfile,
}) => {
    const { navigate } = useNavigation();

    const handleItemClick = (item: SidebarItem) => {
        if (item.comingSoon) return;
        if (item.id === currentPage) {
            onClose();
            return;
        }
        navigate(item.id);
        onClose();
    };

    const handleProfileClick = () => {
        onClose();
        setTimeout(() => onOpenProfile?.(), 150);
    };

    const avatarLetter = getAvatarLetter(userName);
    const avatarGradient = getAvatarGradient(userName);

    // ✅ Sidebar shows only the first 8 characters of the user ID, followed by
    //    "..." to signal the rest is hidden. The full ID is always visible in
    //    ProfilePage (where the user needs it for backup / restore).
    const shortId = userId ? `${userId.slice(0, 8)}...` : null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* Sidebar drawer */}
            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className={`fixed top-0 left-0 bottom-0 z-50 w-[300px] max-w-[85vw] bg-white shadow-2xl shadow-slate-900/25 flex flex-col transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* ═══════ HEADER ═══════ */}
                <div className="shrink-0 px-5 pt-5 pb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                            {/* Logo image */}
                            <div className="shrink-0 w-11 h-11 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-purple-900/5 overflow-hidden flex items-center justify-center">
                                <img
                                    src="/icon-1024x1024.png"
                                    alt="Adin AI"
                                    className="w-full h-full object-contain"
                                    draggable={false}
                                />
                            </div>

                            <div className="min-w-0">
                                <h2 className="text-[15px] font-bold text-slate-900 leading-tight tracking-tight truncate">
                                    Adin AI
                                </h2>
                                <p className="text-[11px] text-slate-500 leading-tight truncate mt-0.5">
                                    Career Platform
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={onClose}
                            aria-label="Close navigation"
                            className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 border border-slate-200/60 transition-all duration-200 hover:scale-[0.96] active:scale-95"
                        >
                            <X size={16} strokeWidth={2.4} />
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent shrink-0" />

                {/* ═══════ NAV ITEMS ═══════ */}
                <nav className="sidebar-scroll-hide flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
                    {sidebarSections.map((section, sectionIndex) => (
                        <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
                            {/* Section label */}
                            <div className="px-3 mb-2">
                                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                    {section.title}
                                </span>
                            </div>

                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = item.id === currentPage;
                                    const isDisabled = !!item.comingSoon;

                                    return (
                                        <li key={item.id}>
                                            <button
                                                onClick={() => handleItemClick(item)}
                                                disabled={isDisabled}
                                                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 text-left ${
                                                    isActive
                                                        ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-purple-500 text-white shadow-lg shadow-purple-600/25'
                                                        : isDisabled
                                                        ? 'text-slate-300 cursor-not-allowed'
                                                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100'
                                                }`}
                                            >
                                                {/* Icon chip */}
                                                <span
                                                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                                                        isActive
                                                            ? 'bg-white/15 text-white'
                                                            : isDisabled
                                                            ? 'bg-slate-50 text-slate-300'
                                                            : 'bg-slate-50 text-slate-500 group-hover:bg-white group-hover:text-purple-600 group-hover:shadow-sm'
                                                    }`}
                                                >
                                                    <Icon size={15} strokeWidth={2.3} />
                                                </span>

                                                {/* Label */}
                                                <span className="flex-1 truncate">{item.label}</span>

                                                {/* Soon badge */}
                                                {isDisabled && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 shrink-0">
                                                        Soon
                                                    </span>
                                                )}

                                                {/* Active indicator dot */}
                                                {isActive && (
                                                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-white/80" />
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* ═══════ DIVIDER ═══════ */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent shrink-0" />

                {/* ═══════ PROFILE SECTION ═══════ */}
                <div className="shrink-0 p-3">
                    <button
                        onClick={handleProfileClick}
                        className="group relative w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-purple-200 hover:shadow-md hover:shadow-purple-900/5 transition-all duration-200 active:scale-[0.98]"
                    >
                        {/* Avatar with online dot */}
                        <div className="relative shrink-0">
                            <div
                                className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white font-bold text-base shadow-md`}
                            >
                                {avatarLetter}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                        </div>

                        {/* Name + ID (truncated) */}
                        <div className="min-w-0 flex-1 text-left">
                            <div className="text-[13.5px] font-bold text-slate-900 truncate leading-tight">
                                {userName || 'User'}
                            </div>
                            <div className="text-[10.5px] text-slate-500 font-mono tracking-wide truncate mt-0.5">
                                {shortId || 'Guest'}
                            </div>
                        </div>

                        {/* Chevron */}
                        <ChevronRight
                            size={16}
                            className="shrink-0 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all duration-200"
                        />
                    </button>

                    {/* Hint */}
                    <div className="mt-2 px-1 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400 font-medium">
                            Tap to manage account
                        </span>
                    </div>
                </div>

                {/* ═══════ FOOTER ═══════ */}
                <div className="shrink-0 px-5 py-3 border-t border-slate-100 bg-gradient-to-t from-slate-50/50 to-transparent">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-400 font-medium">
                            © 2026 Adin AI
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/60">
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                            <span className="text-[9.5px] font-semibold text-slate-500 tracking-wide">
                                v2.0
                            </span>
                        </span>
                    </div>
                </div>
            </aside>

            {/* Hidden scrollbar for nav */}
            <style>{`
                .sidebar-scroll-hide::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .sidebar-scroll-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default GlobalSidebar;