// src/contexts/NavigationContext.tsx
// Extend AppRoute with new routes

import React, { createContext, useContext, ReactNode } from 'react';

// ✅ Updated route types
export type AppRoute =
    | 'home'
    | 'documents'
    | 'templates'          // CV Templates
    | 'cv-builder'         // CV Builder editor
    | 'cover-templates'    // Cover Letter Templates
    | 'cover-letter'       // Cover Letter Editor
    // Future routes:
    // | 'career-assistance'
    // | 'networking'
    // | 'settings';

interface NavigationContextType {
    currentRoute?: AppRoute;
    navigate: (route: AppRoute) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
    children: ReactNode;
    onNavigate: (route: AppRoute) => void;
    currentRoute?: AppRoute;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({
    children,
    onNavigate,
    currentRoute,
}) => {
    return (
        <NavigationContext.Provider value={{ navigate: onNavigate, currentRoute }}>
            {children}
        </NavigationContext.Provider>
    );
};

export const useNavigation = (): NavigationContextType => {
    const context = useContext(NavigationContext);
    if (!context) {
        console.warn(
            '[useNavigation] NavigationProvider not found. ' +
            'Wrap your app in <NavigationProvider> for sidebar navigation to work.'
        );
        return {
            navigate: (route) => {
                console.warn(`[useNavigation] No provider — cannot navigate to "${route}"`);
            },
        };
    }
    return context;
};