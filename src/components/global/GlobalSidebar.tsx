// src/components/global/GlobalSidebar.tsx
import React, { useState } from 'react';
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
    userEmail?: string;
    userName?: string;
    avatarUrl?: string | null;   // ✅ App.tsx se aata hai (login par save hoti hai) — ab Supabase se fetch nahi hota
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

// Google jaisa color generate karne ke liye (agar DP na ho)
const getAvatarColor = (name: string): string => {
    const colors = [
        'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    if (!name || name === 'User') return colors[0];
    const charCode = name.trim().charAt(0).toUpperCase().charCodeAt(0);
    return colors[charCode % colors.length];
};

const GlobalSidebar: React.FC<GlobalSidebarProps> = ({
    isOpen,
    onClose,
    currentPage,
    userId,
    userEmail,
    userName = 'User',
    avatarUrl = null,
    onOpenProfile,
}) => {
    const { navigate } = useNavigation();
    // DP load na ho (link expire / Google ne rok diya) to letter wala avatar dikhao
    const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

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

    const isSignedIn = !!userId;
    const displayName = isSignedIn ? (userName || 'User') : 'Guest';
    const avatarLetter = isSignedIn ? getAvatarLetter(userName) : 'G';
    const avatarColor = getAvatarColor(displayName);

    // Sidebar shows Email instead of ID
    const displayEmail = userEmail ? (userEmail.length > 22 ? userEmail.slice(0, 22) + '...' : userEmail) : null;

    return (
        <>
            <div
                onClick={onClose}
                aria-hidden="true"
                className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation"
                className={`fixed top-0 left-0 bottom-0 z-50 w-[300px] max-w-[85vw] bg-white shadow-2xl shadow-slate-900/25 flex flex-col transition-transform duration-300 ease-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="shrink-0 px-5 pt-5 pb-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
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

                        <button
                            onClick={onClose}
                            aria-label="Close navigation"
                            className="shrink-0 w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 border border-slate-200/60 transition-all duration-200 hover:scale-[0.96] active:scale-95"
                        >
                            <X size={16} strokeWidth={2.4} />
                        </button>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent shrink-0" />

                <nav className="sidebar-scroll-hide flex-1 overflow-y-auto overflow-x-hidden px-3 py-4">
                    {sidebarSections.map((section, sectionIndex) => (
                        <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
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

                                                <span className="flex-1 truncate">{item.label}</span>

                                                {isDisabled && (
                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 shrink-0">
                                                        Soon
                                                    </span>
                                                )}

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

                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent shrink-0" />

                <div className="shrink-0 p-3">
                    <button
                        onClick={handleProfileClick}
                        className="group relative w-full flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/70 hover:border-purple-200 hover:shadow-md hover:shadow-purple-900/5 transition-all duration-200 active:scale-[0.98]"
                    >
                        <div className="relative shrink-0">
                            {/* ✅ Google DP agar hai, warna letter wala color */}
                            {isSignedIn && avatarUrl && avatarUrl !== failedAvatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt={displayName} 
                                    className="w-11 h-11 rounded-full object-cover shadow-md border border-slate-200"
                                    referrerPolicy="no-referrer"
                                    onError={() => setFailedAvatarUrl(avatarUrl)}
                                />
                            ) : (
                                <div
                                    className={`w-11 h-11 rounded-full ${avatarColor} flex items-center justify-center text-white font-bold text-base shadow-md`}
                                >
                                    {avatarLetter}
                                </div>
                            )}
                            {isSignedIn && (
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
                            )}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                            <div className="text-[13.5px] font-bold text-slate-900 truncate leading-tight">
                                {displayName}
                            </div>
                            <div className={`text-[10.5px] text-slate-500 truncate mt-0.5 ${isSignedIn ? 'font-medium' : 'font-medium'}`}>
                                {isSignedIn ? displayEmail : 'Tap to create your account'}
                            </div>
                        </div>

                        <ChevronRight
                            size={16}
                            className="shrink-0 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all duration-200"
                        />
                    </button>

                    <div className="mt-2 px-1 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400 font-medium">
                            {isSignedIn ? 'Tap to manage account' : 'Your account is created when you get started'}
                        </span>
                    </div>
                </div>

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