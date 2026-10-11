// src/hooks/useSidebar.tsx
// ✅ Context-based sidebar state — shared across all pages
// Escape key + body scroll lock
// Use `SidebarProvider` at the top of the app

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface SidebarContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

interface SidebarProviderProps {
    children: ReactNode;
    initialOpen?: boolean;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children, initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen(prev => !prev), []);

    // ✅ Escape key closes sidebar
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') close();
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, close]);

    // ✅ Body scroll lock while sidebar open
    useEffect(() => {
        if (!isOpen) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow || '';
        };
    }, [isOpen]);

    const value: SidebarContextValue = { isOpen, open, close, toggle };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};

// ✅ Hook — must be used inside SidebarProvider
export const useSidebar = (): SidebarContextValue => {
    const ctx = useContext(SidebarContext);
    if (!ctx) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return ctx;
};