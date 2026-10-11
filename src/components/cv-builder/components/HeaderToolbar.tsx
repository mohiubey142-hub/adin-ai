// src/components/cv-builder/components/HeaderToolbar.tsx
// ✅ UPDATED: SVG cloud icon size 16

import React from 'react';
import { CheckCircle2, Loader2, CloudOff, AlertCircle } from 'lucide-react';
import SidebarToggle from '../../global/SidebarToggle';
import { useSaveStatus } from '../../../hooks/useSaveStatus';

interface HeaderToolbarProps {
    onClearAll: () => void;
    saveStatus: 'saved' | 'saving';
    onOpenSidebar: () => void;
}

// ✅ Custom SVG: Solid cloud with checkmark
const SavedCloudIcon: React.FC<{ size?: number; className?: string }> = ({
    size = 16,
    className = '',
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <path
            d="M6.5 19C4.01472 19 2 16.9853 2 14.5C2 12.1564 3.79151 10.2313 6.07901 10.0309C6.49946 6.65144 9.37418 4 12.85 4C16.3917 4 19.3076 6.76373 19.5765 10.2378C21.5676 10.5467 23 12.2665 23 14.3C23 16.5673 21.1623 18.4 18.9 18.4H6.5V19Z"
            fill="currentColor"
        />
        <path
            d="M10 13.5L11.5 15L14.5 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
    onClearAll,
    saveStatus,
    onOpenSidebar,
}) => {
    const combinedStatus = useSaveStatus({ localSaveStatus: saveStatus });

    const renderStatus = () => {
        switch (combinedStatus) {
            case 'saving':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 transition-all duration-300">
                        <Loader2 size={13} className="animate-spin" />
                        <span className="hidden sm:inline">Saving...</span>
                    </span>
                );
            case 'syncing':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 transition-all duration-300">
                        <Loader2 size={13} className="animate-spin" />
                        <span className="hidden sm:inline">Syncing...</span>
                    </span>
                );
            case 'failed':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 transition-all duration-300">
                        <AlertCircle size={13} />
                        <span className="hidden sm:inline">Sync failed</span>
                    </span>
                );
            case 'offline':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-all duration-300">
                        <CloudOff size={13} />
                        <span className="hidden sm:inline">Offline</span>
                    </span>
                );
            case 'saved':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 transition-all duration-300">
                        <SavedCloudIcon size={16} className="text-emerald-600" />
                        <span className="hidden sm:inline">Saved</span>
                    </span>
                );
        }
    };

    return (
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
            <div className="relative flex items-center justify-between gap-3 px-3 sm:px-4 lg:px-6 h-16">

                <div className="flex items-center shrink-0 z-10">
                    <SidebarToggle onOpen={onOpenSidebar} />
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none max-w-[60%] sm:max-w-[55%] text-center">
                    <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent tracking-tight truncate">
                        Adin AI CV Builder
                    </h1>
                    <p className="hidden sm:block text-[13px] text-slate-500 truncate mt-0.5">
                        Create professional CV • ATS Optimized
                    </p>
                </div>

                <div className="flex items-center shrink-0 z-10 ml-auto">
                    {renderStatus()}
                </div>
            </div>
        </div>
    );
};

export default HeaderToolbar;