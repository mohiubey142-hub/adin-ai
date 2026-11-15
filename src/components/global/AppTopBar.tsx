// src/components/global/AppTopBar.tsx
// ============================================
// Adin AI — shared page header (editor jaisa look, sab pages ke liye ek hi jagah)
// ============================================
// [☰]      Page Title        [right slot]
//        chhoti description
//
// Title / subtitle page ke andar nahi, header mein hota hai (jaise CV Builder ka header).
// Naya page add karna ho to sirf PAGE_CHROME mein ek entry add karo.

import React from 'react';
import SidebarToggle from './SidebarToggle';

export interface PageChrome {
  title: string;      // header ka main title
  subtitle: string;   // title ke neeche chhoti line
  bg: string;         // page wrapper ka background class
  sticky: boolean;    // true = page scroll ho to header upar chipka rahe
}

export const PAGE_CHROME: Record<'workspace' | 'my-documents' | 'templates' | 'cover-templates', PageChrome> = {
  workspace: {
    title: 'Adin AI',
    subtitle: 'Your AI-Powered Career Assistant',
    bg: 'bg-slate-50',
    sticky: true,
  },
  'my-documents': {
    title: 'My Documents',
    subtitle: 'Manage and continue working on your saved career documents',
    bg: 'bg-slate-100',
    sticky: false,
  },
  templates: {
    title: 'CV Templates',
    subtitle: 'Professional, modern and ATS-friendly templates',
    bg: 'bg-slate-100',
    sticky: false,
  },
  'cover-templates': {
    title: 'Cover Letter Templates',
    subtitle: 'Designed to make a strong first impression',
    bg: 'bg-slate-100',
    sticky: false,
  },
};

const TOP_BAR_MIN_HEIGHT_CLASS = 'min-h-[64px]';
const TOP_BAR_STICKY_CLASS = 'sticky top-0 z-20';

interface AppTopBarProps {
  title: string;
  subtitle?: string;
  onOpenSidebar: () => void;
  sticky?: boolean;
  right?: React.ReactNode;   // optional: status / button (jaise editor ka "Saved")
}

// NOTE: <header> tag jaan-boojh kar nahi use kiya — PWA / global CSS ke `header { ... }` rules
// (jaise safe-area padding) is bar par lag kar upar khaali jagah bana dete the.
export const AppTopBar: React.FC<AppTopBarProps> = ({ title, subtitle, onOpenSidebar, sticky = false, right }) => (
  <div
    data-app-top-bar
    className={`${TOP_BAR_MIN_HEIGHT_CLASS} shrink-0 grid grid-cols-[minmax(44px,1fr)_minmax(0,auto)_minmax(44px,1fr)] items-center gap-2 px-3 sm:px-5 py-2 bg-white border-b border-slate-200 ${
      sticky ? TOP_BAR_STICKY_CLASS : ''
    }`}
  >
    <div className="flex justify-start">
      <SidebarToggle onOpen={onOpenSidebar} />
    </div>

    <div className="min-w-0 text-center">
      <h1 className="text-lg sm:text-xl font-bold tracking-tight text-purple-600 truncate">{title}</h1>
      {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 truncate">{subtitle}</p>}
    </div>

    <div className="flex justify-end">{right}</div>
  </div>
);

// Bina bar ke sirf menu button (Home jaise pages ke liye): page upar se shuru hota hai, koi khaali patti nahi.
const FLOATING_MENU_POSITION_CLASS = 'fixed top-3 left-3 sm:left-5 z-30';

export const FloatingMenuButton: React.FC<{ onOpenSidebar: () => void }> = ({ onOpenSidebar }) => (
  <div className={FLOATING_MENU_POSITION_CLASS}>
    <SidebarToggle onOpen={onOpenSidebar} />
  </div>
);

export default AppTopBar;
