// src/components/global/SidebarToggle.tsx
// Premium animated menu button — ChatGPT/DeepSeek-style
// Reusable across all pages. Props are unchanged (onOpen, className).

import React from 'react';

interface SidebarToggleProps {
    onOpen: () => void;
    className?: string;
}

const SidebarToggle: React.FC<SidebarToggleProps> = ({ onOpen, className = '' }) => {
    return (
        <button
            type="button"
            onClick={onOpen}
            aria-label="Open navigation"
            title="Menu"
            className={`group relative inline-flex items-center justify-center w-11 h-11 rounded-2xl
                bg-white hover:bg-purple-50 border border-slate-200/80
                shadow-sm shadow-slate-900/5
                hover:border-purple-300/70 hover:shadow-md hover:shadow-purple-500/10
                active:scale-95
                transition-all duration-300 ease-out
                focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-500/20 ${className}`}
        >
            {/* Animated menu bars (staggered widths → equalize on hover) */}
            <span className="relative flex flex-col items-start gap-[5px]">
                <span className="block h-[2px] w-[18px] rounded-full bg-slate-700 group-hover:bg-purple-600 transition-all duration-300" />
                <span className="block h-[2px] w-[12px] rounded-full bg-slate-700 group-hover:w-[18px] group-hover:bg-purple-600 transition-all duration-300 delay-75" />
                <span className="block h-[2px] w-[15px] rounded-full bg-slate-700 group-hover:w-[18px] group-hover:bg-purple-600 transition-all duration-300 delay-100" />
            </span>
        </button>
    );
};

export default SidebarToggle;
