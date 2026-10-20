// App.tsx - Complete updated file with PATH ROUTING + SEO FIXES
// ✅ THEME: Unified with CVBuilder.tsx (slate-100 bg, purple scrollbar, purple-bordered toasts, purple gradients)
// ✅ FIX 1: Onboarding skip for public pages
// ✅ FIX 2: Backward compat — trailing slash handle
// ✅ FIX 3: URL sync — shortcut clicks update URL
// ✅ FIX 4: handleBackFromLegal — history.back() returns to referring page
// ✅ FIX 5: Landing page shows on `/` for first-time users
// ✅ Path-based routing
// ✅ Legal pages render BEFORE onboarding check

import { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Onboarding } from "./components/Onboarding";
import { SEOHead } from "./components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "./utils/seo";
import { initializeGA, trackPageView, setUserID } from "./utils/analytics";
import { getSEOConfig } from "./utils/seoPages";
import LandingPage from './components/Landing/LandingPage';

import { NavigationProvider, AppRoute } from './contexts/NavigationContext';

import { getOrCreateUserId, getUserId } from './utils/userId';
import { clearAuthToken, AUTH_TOKEN_STORAGE_KEY } from './services/sync/authToken';
import { syncService } from './services/sync/syncService';

import RestoreData from './components/RestoreData';
import LogoutWarningPopup from './components/LogoutWarningPopup';
import ClearCacheConfirm from './components/ClearCacheConfirm';
import DeleteAccountConfirm from './components/DeleteAccountConfirm';
import SetPinModal from './components/SetPinModal';
import PinEducationPopup from './components/PinEducationPopup';

import FeedbackFullScreen from './components/feedback/FeedbackFullScreen';
import { markFeedbackShown } from './services/feedbackService';

import GlobalSidebar from './components/global/GlobalSidebar';
import SidebarToggle from './components/global/SidebarToggle';
import ProfilePage from './components/profile/ProfilePage';
import { useSidebar, SidebarProvider } from './hooks/useSidebar';

import { STORAGE_QUOTA_EXCEEDED_EVENT } from './components/cv-builder/hooks/useAutoSave';

const CVBuilder = lazy(() => import("./components/cv-builder/CVBuilder"));
const CoverLetter = lazy(() => import("./components/cover-letter/CoverLetter"));
const CVTemplatesPage = lazy(() => import("./components/Templates/CVTemplatesPage"));
const CoverTemplatesPage = lazy(() => import("./components/Templates/CoverTemplatesPage"));

const WorkspacePage = lazy(() => import("./components/Workspace/WorkspacePage"));

const MyDocuments = lazy(() => import("./components/cv-builder/components/MyDocuments"));
const Founder = lazy(() => import("./pages/Founder"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));

import { localStorageDocumentService } from "./components/cv-builder/services/documentService";

import {
  Search as SearchIcon, Library as LibraryIcon,
  Globe, FileText, Settings as SettingsIcon, Plus, Pencil, Trash2,
  Copy, Check, Pin, ThumbsUp, ThumbsDown, RotateCcw, Edit, Sparkles, User,
  X, Code2, ArrowLeft, Terminal, Database, Cloud, Shield, Braces, Layout, Server, GitBranch, Cpu,
  BookOpen, Bug, Rocket, Target, Briefcase, Mail, LogOut, ChevronDown,
  CloudDownload,
  Download,
  ChevronRight,
  HardDrive,
  Lock,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { sendToAI, saveMemoryFromResponse } from "./services/ai";
import { saveMemory, loadMemory } from "./utils/memory";
import { LoadingScreen } from "./components/LoadingScreen";

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

const safeCopyToClipboard = (text: string): boolean => {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text).catch(() => { fallbackCopy(text); });
      return true;
    }
    return fallbackCopy(text);
  } catch (e) { return fallbackCopy(text); }
};

const fallbackCopy = (text: string): boolean => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) { return false; }
};

const safeGetItem = (key: string): string | null => {
  try { return window.localStorage.getItem(key); }
  catch (e) { return null; }
};

const safeSetItem = (key: string, value: string): void => {
  try { window.localStorage.setItem(key, value); }
  catch (e) {}
};

const safeRemoveItem = (key: string): void => {
  try { window.localStorage.removeItem(key); }
  catch (e) {}
};

const sessionGet = (key: string): string | null => {
  try { return window.sessionStorage.getItem(key); }
  catch (e) { return null; }
};

const sessionSet = (key: string, value: string): void => {
  try { window.sessionStorage.setItem(key, value); }
  catch (e) {}
};

const sessionRemove = (key: string): void => {
  try { window.sessionStorage.removeItem(key); }
  catch (e) {}
};

// ═══════════════════════════════════════════════════════════════
// ✅ Popup flags reset (PIN prompt + feedback) — logout / delete account par
//    taake naye login / naye account par ye popups fresh ki tarah dobara aayein
// ═══════════════════════════════════════════════════════════════
const resetPopupFlags = (): void => {
  try {
    const popupKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (
        k &&
        (k.startsWith('adin-feedback-') ||
          k.startsWith('adin-pdf-download-count') ||
          k.startsWith('adin-pin-prompt-count'))
      ) {
        popupKeys.push(k);
      }
    }
    popupKeys.forEach((k) => safeRemoveItem(k));
  } catch (e) {
    console.error('[App] Popup-flag cleanup failed:', e);
  }
  try {
    const sessionPopupKeys: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k && k.startsWith('adin-pin-prompt-session')) sessionPopupKeys.push(k);
    }
    sessionPopupKeys.forEach((k) => sessionRemove(k));
  } catch (e) {
    console.error('[App] Popup-session cleanup failed:', e);
  }
};

// ═══════════════════════════════════════════════════════════════
// ✅ THEME — identical to CVBuilder.tsx
// ═══════════════════════════════════════════════════════════════

const buildScrollbarCss = (force: boolean): string => {
  const imp = force ? ' !important' : '';
  return `
    ::-webkit-scrollbar { width: 6px${imp}; height: 6px${imp}; }
    ::-webkit-scrollbar-track { background: transparent${imp}; }
    ::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #a855f7, #7c3aed)${imp};
      border-radius: 10px${imp};
      transition: background 0.3s ease;
    }
    ::-webkit-scrollbar-thumb:hover { background: linear-gradient(to bottom, #9333ea, #6d28d9)${imp}; }
    ::-webkit-scrollbar-corner { background: transparent${imp}; }
    * { scrollbar-width: thin${imp}; scrollbar-color: #a855f7 transparent${imp}; }
    .overflow-auto, .overflow-y-auto, .overflow-x-auto { scroll-behavior: smooth; }
  `;
};

// Only the newest toast stays visible. Older ones are dismissed, so repeated /
// double notifications from sections, handlers or AI actions never pile up.
// (Raise MAX_VISIBLE_TOASTS if you ever want more than one at a time.)
const MAX_VISIBLE_TOASTS = 1;

const AdinToaster = () => {
  const { toasts } = useToasterStore();

  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= MAX_VISIBLE_TOASTS)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{
        position: 'fixed', top: '20px', left: '50%',
        transform: 'translateX(-50%)', zIndex: 999999,
        pointerEvents: 'none',
      }}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff', color: '#0f172a',
          border: '1px solid rgba(168, 85, 247, 0.25)',
          padding: '16px 24px', borderRadius: '12px',
          boxShadow: '0 20px 60px -10px rgba(2, 6, 23, 0.15)',
          pointerEvents: 'auto', maxWidth: '500px', width: 'auto',
        },
        success: { style: { border: '1px solid rgba(34, 197, 94, 0.3)' } },
        error: { style: { border: '1px solid rgba(239, 68, 68, 0.3)' } },
        loading: { style: { border: '1px solid rgba(168, 85, 247, 0.3)' } },
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════
// ✅ PATH-BASED ROUTING
// ═══════════════════════════════════════════════════════════════

type PageType = 'workspace' | 'my-documents' | 'app' | 'templates' | 'cover-templates' | 'founder' | 'legal';

interface PathRoute {
  page: PageType;
  active: string;
}

const PATH_ROUTES: Record<string, PathRoute> = {
  '/':                  { page: 'workspace',       active: 'AI Chat' },
  '/workspace':         { page: 'workspace',       active: 'AI Chat' },
  '/templates':         { page: 'templates',       active: 'CV Templates' },
  '/cover-templates':   { page: 'cover-templates', active: 'Cover Templates' },
  '/cv-builder':        { page: 'app',             active: 'CV Builder' },
  '/cover-letter':      { page: 'app',             active: 'Cover Letter' },
  '/my-documents':      { page: 'my-documents',    active: 'My Documents' },
  '/founder':           { page: 'founder',         active: 'Founder' },
  '/privacy-policy':    { page: 'legal',           active: 'Privacy Policy' },
  '/terms-of-service':  { page: 'legal',           active: 'Terms of Service' },
  '/contact':           { page: 'legal',           active: 'Contact' },
};

const getPathRoute = (): PathRoute | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  return PATH_ROUTES[path] || null;
};

const navigateToPath = (path: string, replace = false): void => {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const targetPath = path.startsWith('/') ? path : `/${path}`;
  if (currentPath === targetPath) return;

  if (replace) {
    window.history.replaceState({}, '', targetPath);
  } else {
    window.history.pushState({}, '', targetPath);
  }
};

// ═══════════════════════════════════════════════════════════════
// LEGACY HASH ROUTING (backward compat)
// ═══════════════════════════════════════════════════════════════

const HASH_PRIVACY_POLICY = 'privacy-policy';
const HASH_TERMS_OF_SERVICE = 'terms-of-service';
const HASH_CONTACT = 'contact';
const HASH_FOUNDER = 'founder';

const PAGE_LEGAL = 'legal';
const PAGE_FOUNDER = 'founder';

const ACTIVE_PRIVACY_POLICY = 'Privacy Policy';
const ACTIVE_TERMS_OF_SERVICE = 'Terms of Service';
const ACTIVE_CONTACT = 'Contact';
const ACTIVE_FOUNDER = 'Founder';

const DEEP_LINK_ROUTES = {
  [HASH_PRIVACY_POLICY]: { page: PAGE_LEGAL, active: ACTIVE_PRIVACY_POLICY },
  [HASH_TERMS_OF_SERVICE]: { page: PAGE_LEGAL, active: ACTIVE_TERMS_OF_SERVICE },
  [HASH_CONTACT]: { page: PAGE_LEGAL, active: ACTIVE_CONTACT },
  [HASH_FOUNDER]: { page: PAGE_FOUNDER, active: ACTIVE_FOUNDER },
} as const;

type DeepLinkHash = keyof typeof DEEP_LINK_ROUTES;

const CLOSE_TAB_FALLBACK_MS = 150;

const getDeepLinkRoute = () => {
  if (typeof window === 'undefined') return null;
  let hash = window.location.hash.slice(1);
  hash = hash.replace(/^\//, '').replace(/\/$/, '');
  return Object.prototype.hasOwnProperty.call(DEEP_LINK_ROUTES, hash)
    ? DEEP_LINK_ROUTES[hash as DeepLinkHash]
    : null;
};

// ═══════════════════════════════════════════════════════════════
// ✅ PUBLIC PAGES FOR SEO (onboarding skipped)
// ═══════════════════════════════════════════════════════════════
const PUBLIC_PAGES_FOR_SEO: PageType[] = [
  'templates',
  'cover-templates',
  'founder',
  'legal',
];

// ═══════════════════════════════════════════════════════════════
// PROGRAMMING LANGUAGES (CodingExpert)
// ═══════════════════════════════════════════════════════════════

const programmingLanguages = [
  { id: "javascript", name: "JavaScript", icon: "braces", gradient: "from-amber-500 to-yellow-500", desc: "Web Development" },
  { id: "python", name: "Python", icon: "terminal", gradient: "from-blue-500 to-indigo-500", desc: "AI/ML, Backend" },
  { id: "react", name: "React", icon: "code2", gradient: "from-cyan-500 to-blue-500", desc: "Frontend Framework" },
  { id: "typescript", name: "TypeScript", icon: "braces", gradient: "from-blue-600 to-indigo-600", desc: "Type-safe JS" },
  { id: "nodejs", name: "Node.js", icon: "server", gradient: "from-green-600 to-emerald-600", desc: "Backend Runtime" },
  { id: "html-css", name: "HTML/CSS", icon: "layout", gradient: "from-orange-500 to-red-500", desc: "Web Fundamentals" },
  { id: "database", name: "Databases", icon: "database", gradient: "from-purple-500 to-pink-500", desc: "SQL & NoSQL" },
  { id: "devops", name: "DevOps", icon: "cloud", gradient: "from-slate-500 to-gray-500", desc: "Cloud & Infra" },
  { id: "security", name: "Security", icon: "shield", gradient: "from-rose-500 to-red-500", desc: "Cybersecurity" },
  { id: "git", name: "Git/GitHub", icon: "gitbranch", gradient: "from-orange-600 to-amber-600", desc: "Version Control" },
  { id: "ai-ml", name: "AI/ML", icon: "cpu", gradient: "from-violet-500 to-purple-500", desc: "Artificial Intel" },
  { id: "system-design", name: "System Design", icon: "server", gradient: "from-indigo-500 to-purple-500", desc: "Architecture" },
];

const iconMap: Record<string, any> = {
  braces: Braces, terminal: Terminal, code2: Code2, server: Server,
  layout: Layout, database: Database, cloud: Cloud, shield: Shield,
  gitbranch: GitBranch, cpu: Cpu,
};

function CodingExpert({ userId, onBack }: { userId: string; onBack?: () => void }) {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [webEnabled, setWebEnabled] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    const savedLevel = safeGetItem(`user_level_${userId}`);
    const savedLang = safeGetItem(`user_language_${userId}`);
    if (savedLevel) setUserLevel(savedLevel);
    if (savedLang) setSelectedLanguage(savedLang);
    if (!savedLevel) setMessages([{ role: "ai", text: "🌟 **Welcome!**\n\nSelect your level:" }]);
    else if (!savedLang) setMessages([{ role: "ai", text: `You're **${savedLevel}** level. Select tech:` }]);
    else {
      const lang = programmingLanguages.find(l => l.id === savedLang);
      setMessages([{ role: "ai", text: `**${lang?.name}** active.` }]);
    }
  }, [userId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetLevel = (level: string) => {
    setUserLevel(level);
    safeSetItem(`user_level_${userId}`, level);
    setMessages(prev => [...prev, { role: "user", text: level }, { role: "ai", text: `**${level}** selected.` }]);
  };

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    safeSetItem(`user_language_${userId}`, langId);
    const lang = programmingLanguages.find(l => l.id === langId);
    setMessages(prev => [...prev, { role: "user", text: lang?.name || langId }, { role: "ai", text: `**${lang?.name}** active.` }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);
    try {
      const context = `Level: ${userLevel || "beginner"}, Language: ${selectedLanguage || "javascript"}`;
      const res = await sendToAI([{ role: "user", text: `${context}\n\nUser: ${userMessage}` }], [], webEnabled, userId);
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "How can I help?";
      setMessages(prev => [...prev, { role: "ai", text: aiText }]);
    } catch (err) { toast.error("Connection error"); }
    finally { setLoading(false); }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={22} /> : null;
  };

  if (!userLevel) {
    return (
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900">
            <ArrowLeft size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            {["beginner", "intermediate", "advanced"].map(level => (
              <button key={level} onClick={() => handleSetLevel(level)} className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold text-white capitalize">{level}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!selectedLanguage) {
    return (
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
          <button onClick={() => { safeRemoveItem(`user_level_${userId}`); setUserLevel(null); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900">
            <ArrowLeft size={16} className="text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-4 gap-4 max-w-5xl mx-auto">
            {programmingLanguages.map(lang => (
              <button key={lang.id} onClick={() => handleSelectLanguage(lang.id)} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lang.gradient} flex items-center justify-center mb-3`}>
                  <div className="text-white">{getIcon(lang.icon)}</div>
                </div>
                <h3 className="font-semibold text-white text-sm">{lang.name}</h3>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentLang = programmingLanguages.find(l => l.id === selectedLanguage);

  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden">
      <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
        <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900">
          <ArrowLeft size={16} className="text-gray-400" />
        </button>
        <span className="text-sm font-semibold text-white">{currentLang?.name} Expert</span>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === "user" ? "bg-purple-600 text-white" : "bg-zinc-900"}`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-3 border-t border-zinc-900">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={`Ask about ${currentLang?.name}...`} className="flex-1 h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-white" />
          <button onClick={sendMessage} className="h-10 px-4 rounded-lg bg-purple-600 text-white">Send</button>
        </div>
      </div>
    </div>
  );
}

type MessageType = { role: string; text: string; files?: { name: string; content: string }[] };
type MemoryType = { id: number; text: string };
type ChatType = { id: number; title: string; pinned?: boolean; createdAt: number };

function AppInner() {
  const { isOpen: isSidebarOpen, open: openSidebar, close: closeSidebar } = useSidebar();

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    const guestSession = safeGetItem("adin-guest-session");
    const savedName = safeGetItem("adin_user_name");
    return !!(guestSession || savedName);
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return safeGetItem("adin-onboarding-completed") === "true";
  });

  const [userName, setUserName] = useState<string>(() => {
    return safeGetItem("adin_user_name") || "User";
  });

  const profileRef = useRef<HTMLDivElement>(null);

  const openedViaDeepLinkRef = useRef<boolean>(getDeepLinkRoute() !== null);

  // ✅ Onboarding se pehle template choose ho to doc abhi nahi banta —
  //    onboarding complete hote hi (naye userId ke saath) banta ha.
  const pendingTemplateRef = useRef<{ kind: 'cv' | 'cover'; templateId: string } | null>(null);

  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState<boolean>(false);
  const [showClearCache, setShowClearCache] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [showPinEducation, setShowPinEducation] = useState(false);

  const [showProfilePage, setShowProfilePage] = useState(false);

  const [showGlobalFeedback, setShowGlobalFeedback] = useState(false);

  // ═══════════════════════════════════════════════════════════════
  // ✅ FIX 5: showLanding — only on `/` for first-time users
  // ═══════════════════════════════════════════════════════════════
  const [showLanding, setShowLanding] = useState(() => {
    const currentPath = typeof window !== 'undefined'
      ? window.location.pathname.replace(/\/$/, '') || '/'
      : '/';
    const isRootPath = currentPath === '/' || currentPath === '/workspace';

    if (!isRootPath) {
      return false;
    }

    if (getDeepLinkRoute()) {
      return false;
    }

    const hasSeenLanding = safeGetItem('adin-has-seen-landing');
    const guestSession = safeGetItem('adin-guest-session');
    const onboardingCompleted = safeGetItem('adin-onboarding-completed');
    const userName = safeGetItem('adin_user_name');

    if (onboardingCompleted === 'true' || guestSession || userName) return false;
    if (hasSeenLanding) return false;

    return true;
  });

  // ✅ SECURE: ID always goes through utils/userId.ts validation.
  //    Old / tampered / test-format IDs are replaced with a fresh valid one.
  //    ✅ ID sirf onboarding complete hone ke BAAD banti ha. Landing → public page
  //       (templates/founder/legal) kholne se account auto-create nahi hota.
  const userId = useMemo(() => {
    if (!isOnboardingComplete) return '';
    return getUserId() || getOrCreateUserId();
  }, [isOnboardingComplete]);

  useEffect(() => {
    syncService.flushQueue().catch(() => {});
  }, []);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      console.warn('[App] Storage quota exceeded — opening clear cache dialog');
      setShowClearCache(true);
      toast.error('Storage full! Clear cache to continue.', { duration: 5000 });
    };

    window.addEventListener(STORAGE_QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    return () => {
      window.removeEventListener(STORAGE_QUOTA_EXCEEDED_EVENT, handleQuotaExceeded);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    if (!isOnboardingComplete) return;

    // ✅ Public status check — works even before this device has an auth token
    syncService.getPinStatus(userId).then(res => {
      setHasPinSet(res.status === 'has_pin');
    }).catch(() => {});
  }, [userId, isOnboardingComplete]);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const pathRoute = getPathRoute();
    if (pathRoute) return pathRoute.page;

    const deepLink = getDeepLinkRoute();
    if (deepLink) return deepLink.page;

    const saved = sessionGet('adin-session-page');
    if (saved && ['workspace', 'my-documents', 'app', 'templates', 'cover-templates', 'founder', 'legal'].includes(saved)) {
      return saved as PageType;
    }
    return 'workspace';
  });

  const [active, setActive] = useState<string>(() => {
    const pathRoute = getPathRoute();
    if (pathRoute) return pathRoute.active;

    const deepLink = getDeepLinkRoute();
    if (deepLink) return deepLink.active;

    const saved = sessionGet('adin-session-active');
    if (saved) return saved;
    return 'AI Chat';
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => {
    return sessionGet('adin-session-cv-doc') || null;
  });

  const [activeCoverLetterId, setActiveCoverLetterId] = useState<string | null>(() => {
    return sessionGet('adin-session-cl-doc') || null;
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(() => {
    return sessionGet('adin-session-template') || null;
  });

  const [selectedCoverTemplateId, setSelectedCoverTemplateId] = useState<string | null>(() => {
    return sessionGet('adin-session-cover-template') || null;
  });

  const [cvBuilderEntrySource, setCvBuilderEntrySource] = useState<'template-gallery' | 'documents' | 'sidebar' | null>(() => {
    const saved = sessionGet('adin-session-entry-source');
    if (saved === 'template-gallery' || saved === 'documents' || saved === 'sidebar') return saved;
    return null;
  });

  const [coverLetterEntrySource, setCoverLetterEntrySource] = useState<'template-gallery' | 'documents' | 'sidebar' | null>(() => {
    const saved = sessionGet('adin-session-cl-entry-source');
    if (saved === 'template-gallery' || saved === 'documents' || saved === 'sidebar') return saved;
    return null;
  });

  const [coverLetterKey, setCoverLetterKey] = useState<number>(0);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatType[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<number, MessageType[]>>({});
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [likedMessages, setLikedMessages] = useState<number[]>([]);
  const [dislikedMessages, setDislikedMessages] = useState<number[]>([]);
  const [webEnabled, setWebEnabled] = useState(true);
  const [editingMessage, setEditingMessage] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [aiMemory, setAiMemory] = useState<MemoryType[]>([]);
  const [pendingFiles, setPendingFiles] = useState<{ name: string; content: string }[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileUploadRef = useRef<FileUploadRef>(null);
  const loaded = useRef(false);
  const isSendingRef = useRef(false);

  useEffect(() => { sessionSet('adin-session-page', currentPage); }, [currentPage]);
  useEffect(() => { sessionSet('adin-session-active', active); }, [active]);
  useEffect(() => {
    if (activeDocumentId) sessionSet('adin-session-cv-doc', activeDocumentId);
    else sessionRemove('adin-session-cv-doc');
  }, [activeDocumentId]);
  useEffect(() => {
    if (activeCoverLetterId) sessionSet('adin-session-cl-doc', activeCoverLetterId);
    else sessionRemove('adin-session-cl-doc');
  }, [activeCoverLetterId]);
  useEffect(() => {
    if (selectedTemplateId) sessionSet('adin-session-template', selectedTemplateId);
    else sessionRemove('adin-session-template');
  }, [selectedTemplateId]);
  useEffect(() => {
    if (selectedCoverTemplateId) sessionSet('adin-session-cover-template', selectedCoverTemplateId);
    else sessionRemove('adin-session-cover-template');
  }, [selectedCoverTemplateId]);
  useEffect(() => {
    if (cvBuilderEntrySource) sessionSet('adin-session-entry-source', cvBuilderEntrySource);
    else sessionRemove('adin-session-entry-source');
  }, [cvBuilderEntrySource]);
  useEffect(() => {
    if (coverLetterEntrySource) sessionSet('adin-session-cl-entry-source', coverLetterEntrySource);
    else sessionRemove('adin-session-cl-entry-source');
  }, [coverLetterEntrySource]);

  // ✅ Account (onboarding) ke bina koi ID nahi — user ko pehle onboarding pe bhejo
  const startOnboarding = useCallback(() => {
    setCurrentPage('workspace');
    setActive('AI Chat');
    navigateToPath('/');
  }, []);

  const handleOpenBackupHelp = useCallback(() => {
    if (!userId) {
      if (!isOnboardingComplete) {
        startOnboarding();
        return;
      }
      toast.error('Session error. Please refresh.');
      return;
    }
    setShowPinEducation(true);
  }, [userId, isOnboardingComplete, startOnboarding]);

  const handlePinEducationSetPin = useCallback(() => {
    if (!userId) {
      toast.error('Session error. Please refresh.');
      return;
    }
    setShowPinEducation(false);
    safeSetItem('adin-pin-education-shown', 'true');
    setShowSetPin(true);
  }, [userId]);

  const handlePinEducationDismiss = useCallback(() => {
    setShowPinEducation(false);
  }, []);

  const getPageKey = useCallback((): string => {
    if (currentPage === 'workspace') return 'home';
    if (currentPage === 'my-documents') return 'my-documents';
    if (currentPage === 'templates') return 'templates';
    if (currentPage === 'cover-templates') return 'cover-templates';
    if (currentPage === 'founder') return 'founder';
    if (currentPage === 'legal') {
      if (active === 'Privacy Policy') return 'privacy-policy';
      if (active === 'Terms of Service') return 'terms-of-service';
      if (active === 'Contact') return 'contact';
    }
    if (currentPage === 'app') {
      if (active === 'CV Builder') return 'cv-builder';
      if (active === 'Cover Letter') return 'cover-letter';
    }
    return 'home';
  }, [active, currentPage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        // Profile dropdown is now in ProfilePage — this ref is unused but kept
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOnboardingComplete = async (
    profile: { name: string; userId: string },
  ) => {
    safeSetItem("adin_user_name", profile.name);
    safeSetItem("adin-user-id", profile.userId);
    safeSetItem("adin-guest-session", JSON.stringify({ isGuest: true, guestCreatedAt: new Date().toISOString() }));
    safeSetItem("adin-onboarding-completed", "true");

    // ✅ Onboarding se pehle jo template select hua tha, ab naye userId se doc banao
    const pending = pendingTemplateRef.current;
    pendingTemplateRef.current = null;
    if (pending) {
      try {
        if (pending.kind === 'cv') {
          const meta = await localStorageDocumentService.createEmpty(profile.userId);
          setActiveDocumentId(meta.id);
          setSelectedTemplateId(pending.templateId);
          setCvBuilderEntrySource('template-gallery');
        } else {
          const { localStorageCoverLetterService } = await import('./components/cover-letter/services/coverLetterService');
          const meta = await localStorageCoverLetterService.createEmpty(profile.userId);
          setActiveCoverLetterId(meta.id);
          setSelectedCoverTemplateId(pending.templateId);
          setCoverLetterEntrySource('template-gallery');
          setCoverLetterKey(prev => prev + 1);
        }
      } catch (e: any) {
        console.error('❌ Failed to create document after onboarding:', e);
        toast.error('Failed to create document');
      }
    }

    setIsGuest(true);
    setIsOnboardingComplete(true);
    setUserName(profile.name);
  };

  const handleRestoredFromOnboarding = () => {
    pendingTemplateRef.current = null; // restore pe naya doc nahi banana
    const restoredName = safeGetItem("adin_user_name");
    if (!safeGetItem("adin-guest-session")) {
      safeSetItem("adin-guest-session", JSON.stringify({ isGuest: true, guestCreatedAt: new Date().toISOString() }));
    }
    safeSetItem("adin-onboarding-completed", "true");
    setIsGuest(true);
    setIsOnboardingComplete(true);
    if (restoredName) setUserName(restoredName);
    setShowRestoreModal(false);
  };

  const handleLogoutClick = useCallback(() => {
    setShowLogoutWarning(true);
  }, []);

  const handleClearCacheClick = useCallback(() => {
    setShowClearCache(true);
  }, []);

  const handleConfirmClearCache = () => {
    setShowClearCache(false);

    const PRESERVE_KEYS = [
      'adin-user-id',
      AUTH_TOKEN_STORAGE_KEY,
      'adin_user_name',
      'adin-onboarding-completed',
      'adin-guest-session',
      'adin-has-seen-landing',
      'adin-pin-education-shown',
      'adin-sync-queue',
      'adin-backup-reminder-shown',
    ];
    const REMOVE_PREFIXES = [
      'adin_cv_document_',
      'adin_cv_documents_index_',
      'adin_cover_letter_document_',
      'adin_cover_letter_documents_index_',
      'adin_cv_builder_data_',
    ];

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || PRESERVE_KEYS.includes(key)) continue;
        if (key === 'cover_letter_data' || REMOVE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => safeRemoveItem(key));
    } catch (e) {
      console.error('[App] Clear cache failed:', e);
    }

    sessionRemove('adin-session-page');
    sessionRemove('adin-session-active');
    sessionRemove('adin-session-cv-doc');
    sessionRemove('adin-session-cl-doc');
    sessionRemove('adin-session-template');
    sessionRemove('adin-session-cover-template');
    sessionRemove('adin-session-entry-source');
    sessionRemove('adin-session-cl-entry-source');

    try {
      indexedDB.deleteDatabase('adin_cv_images');
    } catch (e) {
      console.error('[App] IndexedDB delete failed:', e);
    }

    toast.success('Local cache cleared — your data is safe in the cloud');
    setTimeout(() => window.location.reload(), 900);
  };

  const handleGuestLogout = () => {
    setShowLogoutWarning(false);
    safeRemoveItem("adin-guest-session");
    safeRemoveItem("adin_user_name");
    safeRemoveItem("adin-onboarding-completed");
    safeRemoveItem("adin-guest-user-id");
    clearAuthToken();
    safeRemoveItem("adin-user-id");
    safeRemoveItem('adin-has-seen-landing');
    safeRemoveItem('adin-pin-education-shown');
    safeRemoveItem('adin-backup-reminder-shown');

    // ✅ FIX: previous account ka cover letter / CV draft logout par saaf karo
    safeRemoveItem('cover_letter_data');
    safeRemoveItem('adin-selected-cover-template');
    try {
      const draftKeys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('cover_letter_data_') || k.startsWith('adin_cv_builder_data_'))) {
          draftKeys.push(k);
        }
      }
      draftKeys.forEach((k) => safeRemoveItem(k));
    } catch (e) {
      console.error('[App] Logout draft cleanup failed:', e);
    }

    // ✅ FIX: PIN prompt + feedback popup flags reset — naye login par dobara aayein
    resetPopupFlags();

    // ✅ FIX: in-memory state bhi reset karo warna sessionSet effects purani IDs wapas likh dete hain
    setActiveDocumentId(null);
    setActiveCoverLetterId(null);
    setSelectedTemplateId(null);
    setSelectedCoverTemplateId(null);
    setCvBuilderEntrySource(null);
    setCoverLetterEntrySource(null);
    setCoverLetterKey(prev => prev + 1);

    sessionRemove('adin-session-page');
    sessionRemove('adin-session-active');
    sessionRemove('adin-session-cv-doc');
    sessionRemove('adin-session-cl-doc');
    sessionRemove('adin-session-template');
    sessionRemove('adin-session-cover-template');
    sessionRemove('adin-session-entry-source');
    sessionRemove('adin-session-cl-entry-source');
    syncService.clearQueue();
    setIsGuest(false);
    setIsOnboardingComplete(false);
    setUserName("User");
    setShowPinEducation(false);
    setShowProfilePage(false);
    setShowLanding(true);
    toast.success("Logged out successfully");
  };

  const handleDeleteAccountConfirm = () => {
    setShowDeleteAccount(false);
    resetPopupFlags();
    setIsGuest(false);
    setIsOnboardingComplete(false);
    setUserName('User');
    setShowPinEducation(false);
    setShowProfilePage(false);
    setShowLanding(true);
    setTimeout(() => {
      window.location.href = '/';
      window.location.reload();
    }, 500);
  };

  const handleSetPinClick = useCallback(() => {
    if (!userId) return;
    setShowSetPin(true);
  }, [userId]);

  const handleSetPinSuccess = () => {
    setShowSetPin(false);
    setHasPinSet(true);
    safeSetItem('adin-pin-education-shown', 'true');
  };

  const handleLandingComplete = () => {
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
  };

  const handleDownloadMyId = useCallback(async () => {
    if (!userId) return;

    // ✅ Restore needs BOTH ID + PIN → the ID file is only given once a PIN is set.
    //    (If the local flag is not loaded yet, double-check with the server first.)
    if (!hasPinSet) {
      let pinIsSet = false;
      try {
        const pinStatus = await syncService.getPinStatus(userId);
        if (pinStatus.status === 'error') {
          toast.error('Could not check your PIN status. Please try again.');
          return;
        }
        pinIsSet = pinStatus.status === 'has_pin';
      } catch {
        toast.error('Could not check your PIN status. Please try again.');
        return;
      }

      if (!pinIsSet) {
        toast.error('Set your PIN first — restore needs both your ID and your PIN.', { duration: 4000 });
        setShowSetPin(true);
        return;
      }
      setHasPinSet(true);
    }

    try {
      const content = `ADIN AI — YOUR ACCOUNT ID
==========================

Your ID: ${userId}

IMPORTANT: Keep this safe.

This ID is your key to restoring your CVs and Cover Letters on any 
browser or device. Without this ID, you cannot recover your data.

How to use it:
1. Open Adin AI on any device
2. Go to your profile → "Restore from another device"
3. Enter this ID + your 4-digit PIN
4. Your data will be restored from the cloud

Save this file somewhere safe:
- Email it to yourself
- Save it in your notes
- Take a screenshot

Generated on: ${new Date().toLocaleString()}
Adin AI
`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'adin-ai-user-id.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('ID file downloaded!', { duration: 2500 });
    } catch (e) {
      toast.error('Download failed');
    }
  }, [userId, hasPinSet]);

  useEffect(() => {
    const pagePath = window.location.pathname + window.location.hash;
    trackPageView(pagePath);
  }, [active, currentPage]);

  const getLastCVDocument = useCallback(() => {
    try {
      const key = `adin_cv_documents_index_${userId}`;
      const raw = safeGetItem(key);
      if (!raw) return null;
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return null;
      const sorted = [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return sorted[0];
    } catch {
      return null;
    }
  }, [userId]);

  const getLastCoverLetterDocument = useCallback(() => {
    try {
      const key = `adin_cover_letter_documents_index_${userId}`;
      const raw = safeGetItem(key);
      if (!raw) return null;
      const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return null;
      const sorted = [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return sorted[0];
    } catch {
      return null;
    }
  }, [userId]);

  const handleWorkspaceNavigate = useCallback((page: string) => {
    if (page === 'cv-builder') {
      setActiveDocumentId(null);
      setActiveCoverLetterId(null);
      setCvBuilderEntrySource('template-gallery');
      setSelectedTemplateId(null);
      setCurrentPage('templates');
      setActive('CV Templates');
      navigateToPath('/templates');
    } else if (page === 'cover-letter') {
      setActiveDocumentId(null);
      setActiveCoverLetterId(null);
      setCoverLetterEntrySource('template-gallery');
      setSelectedCoverTemplateId(null);
      setCurrentPage('cover-templates');
      setActive('Cover Templates');
      navigateToPath('/cover-templates');
    } else if (page === 'founder') {
      setCurrentPage('founder');
      setActive('Founder');
      navigateToPath('/founder');
    } else if (page === 'my-documents') {
      setActiveDocumentId(null);
      setActiveCoverLetterId(null);
      setCvBuilderEntrySource(null);
      setCoverLetterEntrySource(null);
      setCurrentPage('my-documents');
      setActive('My Documents');
      navigateToPath('/my-documents');
    }
  }, []);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    // ✅ Onboarding baqi ha → doc abhi nahi, pehle onboarding (template yaad rakho)
    if (!isOnboardingComplete || !userId) {
      pendingTemplateRef.current = { kind: 'cv', templateId };
      setCurrentPage('app');
      setActive('CV Builder');
      navigateToPath('/cv-builder');
      return;
    }

    const shouldApplyToExisting = !!activeDocumentId;

    if (shouldApplyToExisting) {
      setSelectedTemplateId(templateId);
      if (!cvBuilderEntrySource) {
        setCvBuilderEntrySource('template-gallery');
      }
      setCurrentPage('app');
      setActive('CV Builder');
      navigateToPath('/cv-builder');
      return;
    }

    try {
      const meta = await localStorageDocumentService.createEmpty(userId);
      setActiveDocumentId(meta.id);
      setSelectedTemplateId(templateId);
      setCvBuilderEntrySource('template-gallery');
      setCurrentPage('app');
      setActive('CV Builder');
      navigateToPath('/cv-builder');
    } catch (e: any) {
      console.error('❌ Failed to create document from template:', e);
      toast.error('Failed to create document');
    }
  }, [userId, isOnboardingComplete, cvBuilderEntrySource, activeDocumentId]);

  const handleCoverTemplateSelect = useCallback(async (templateId: string) => {
    // ✅ Onboarding baqi ha → doc abhi nahi, pehle onboarding (template yaad rakho)
    if (!isOnboardingComplete || !userId) {
      pendingTemplateRef.current = { kind: 'cover', templateId };
      setCurrentPage('app');
      setActive('Cover Letter');
      navigateToPath('/cover-letter');
      return;
    }

    const shouldApplyToExisting = !!activeCoverLetterId;

    if (shouldApplyToExisting) {
      setSelectedCoverTemplateId(templateId);
      if (!coverLetterEntrySource) {
        setCoverLetterEntrySource('template-gallery');
      }
      setCurrentPage('app');
      setActive('Cover Letter');
      navigateToPath('/cover-letter');
      return;
    }

    try {
      const { localStorageCoverLetterService } = await import('./components/cover-letter/services/coverLetterService');
      const meta = await localStorageCoverLetterService.createEmpty(userId);

      setActiveCoverLetterId(meta.id);
      setSelectedCoverTemplateId(templateId);
      setCoverLetterEntrySource('template-gallery');
      setCurrentPage('app');
      setActive('Cover Letter');
      navigateToPath('/cover-letter');
      setCoverLetterKey(prev => prev + 1);
    } catch (e: any) {
      console.error('❌ Failed to create cover letter from template:', e);
      toast.error('Failed to create cover letter');
    }
  }, [userId, isOnboardingComplete, coverLetterEntrySource, activeCoverLetterId]);

  const navigateToWorkspace = useCallback(() => {
    setCurrentPage('workspace');
    setActiveDocumentId(null);
    setActiveCoverLetterId(null);
    setCvBuilderEntrySource(null);
    setCoverLetterEntrySource(null);
    setActive('AI Chat');
    navigateToPath('/');
  }, []);

  const navigateBackFromTemplates = useCallback(() => {
    setActiveDocumentId(null);
    setActiveCoverLetterId(null);
    setCvBuilderEntrySource(null);
    setCoverLetterEntrySource(null);
    setCurrentPage('my-documents');
    setActive('My Documents');
    navigateToPath('/my-documents');
  }, []);

  const navigateToMyDocuments = useCallback(() => {
    setActiveDocumentId(null);
    setActiveCoverLetterId(null);
    setCvBuilderEntrySource(null);
    setCoverLetterEntrySource(null);
    setCurrentPage('my-documents');
    setActive('My Documents');
    navigateToPath('/my-documents');
  }, []);

  const handleGlobalNavigate = useCallback((route: AppRoute) => {
    switch (route) {
      case 'home':
        navigateToWorkspace();
        break;

      case 'documents':
        navigateToMyDocuments();
        break;

      case 'templates':
        setSelectedTemplateId(null);
        setCvBuilderEntrySource(null);
        setCurrentPage('templates');
        setActive('CV Templates');
        navigateToPath('/templates');
        break;

      case 'cv-builder': {
        const lastCV = getLastCVDocument();
        if (lastCV?.id) {
          setSelectedTemplateId(null);
          setActiveDocumentId(lastCV.id);
          setCvBuilderEntrySource('sidebar');
          setCurrentPage('app');
          setActive('CV Builder');
          navigateToPath('/cv-builder');
        } else {
          setSelectedTemplateId(null);
          setCvBuilderEntrySource(null);
          setCurrentPage('templates');
          setActive('CV Templates');
          navigateToPath('/templates');
        }
        break;
      }

      case 'cover-templates':
        setSelectedCoverTemplateId(null);
        setCoverLetterEntrySource(null);
        setCurrentPage('cover-templates');
        setActive('Cover Templates');
        navigateToPath('/cover-templates');
        break;

      case 'cover-letter': {
        const lastCL = getLastCoverLetterDocument();
        if (lastCL?.id) {
          setSelectedCoverTemplateId(null);
          setActiveCoverLetterId(lastCL.id);
          setCoverLetterEntrySource('sidebar');
          setCurrentPage('app');
          setActive('Cover Letter');
          navigateToPath('/cover-letter');
          setCoverLetterKey(prev => prev + 1);
        } else {
          setSelectedCoverTemplateId(null);
          setCoverLetterEntrySource(null);
          setCurrentPage('cover-templates');
          setActive('Cover Templates');
          navigateToPath('/cover-templates');
        }
        break;
      }

      default:
        break;
    }
  }, [navigateToWorkspace, navigateToMyDocuments, getLastCVDocument, getLastCoverLetterDocument]);

  const handleCreateNewCV = useCallback(() => {
    sessionRemove('adin-session-cv-doc');
    sessionRemove('adin-session-template');
    sessionRemove('adin-session-entry-source');
    setActiveDocumentId(null);
    setActiveCoverLetterId(null);
    setSelectedTemplateId(null);
    setCvBuilderEntrySource('template-gallery');
    setCurrentPage('templates');
    setActive('CV Templates');
    navigateToPath('/templates');
  }, []);

  const handleCreateNewCoverLetter = useCallback(() => {
    sessionRemove('adin-session-cl-doc');
    sessionRemove('adin-session-cover-template');
    sessionRemove('adin-session-cl-entry-source');
    setActiveCoverLetterId(null);
    setActiveDocumentId(null);
    setSelectedCoverTemplateId(null);
    setCoverLetterEntrySource('template-gallery');
    setCurrentPage('cover-templates');
    setActive('Cover Templates');
    navigateToPath('/cover-templates');
    setCoverLetterKey(prev => prev + 1);
  }, []);

  const handleEditDocument = useCallback((documentId: string) => {
    setActiveDocumentId(documentId);
    setSelectedTemplateId(null);
    setCvBuilderEntrySource('documents');
    setCurrentPage('app');
    setActive('CV Builder');
    navigateToPath('/cv-builder');
  }, []);

  const handleEditCoverLetter = useCallback((documentId: string) => {
    setActiveCoverLetterId(documentId);
    setSelectedCoverTemplateId(null);
    setCoverLetterEntrySource('documents');
    setCurrentPage('app');
    setActive('Cover Letter');
    navigateToPath('/cover-letter');
    setCoverLetterKey(prev => prev + 1);
  }, []);

  const handleBackFromCVBuilder = useCallback(() => {
    setSelectedTemplateId(null);

    if (cvBuilderEntrySource === 'documents' || cvBuilderEntrySource === 'sidebar') {
      setActiveDocumentId(null);
      setActiveCoverLetterId(null);
      setCurrentPage('my-documents');
      setActive('My Documents');
      navigateToPath('/my-documents');
    } else {
      setCurrentPage('templates');
      setActive('CV Templates');
      navigateToPath('/templates');
    }

    setCvBuilderEntrySource(null);
  }, [cvBuilderEntrySource]);

  const handleBackFromCoverLetter = useCallback(() => {
    setSelectedCoverTemplateId(null);

    if (coverLetterEntrySource === 'documents' || coverLetterEntrySource === 'sidebar') {
      setActiveDocumentId(null);
      setActiveCoverLetterId(null);
      setCurrentPage('my-documents');
      setActive('My Documents');
      navigateToPath('/my-documents');
    } else {
      setCurrentPage('cover-templates');
      setActive('Cover Templates');
      navigateToPath('/cover-templates');
    }

    setCoverLetterEntrySource(null);
  }, [coverLetterEntrySource]);

  // ═══════════════════════════════════════════════════════════════
  // ✅ FIX 4: handleBackFromLegal — history.back() returns to referring page
  // ═══════════════════════════════════════════════════════════════
  const handleBackFromLegal = useCallback(() => {
    const cameFromLanding = sessionGet('adin-legal-from-landing') === 'true';
    sessionRemove('adin-legal-from-landing');

    // If user came from landing page → go back to landing
    if (cameFromLanding) {
      setCurrentPage('workspace');
      setActive('AI Chat');
      setShowLanding(true);
      navigateToPath('/');
      return;
    }

    // Otherwise → try history.back() first (returns to referring page)
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }

    // No history → fallback to /contact
    setCurrentPage('legal');
    setActive('Contact');
    navigateToPath('/contact');
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ✅ FIX 2: ROUTE CHANGE LISTENER
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const handleRouteChange = () => {
      const pathRoute = getPathRoute();
      if (pathRoute) {
        setCurrentPage(pathRoute.page);
        setActive(pathRoute.active);
        return;
      }

      let hash = window.location.hash.slice(1);
      hash = hash.replace(/^\//, '').replace(/\/$/, '');

      if (hash === "templates") { setCurrentPage('templates'); setActive("CV Templates"); }
      else if (hash === "cover-templates") { setCurrentPage('cover-templates'); setActive("Cover Templates"); }
      else if (hash === "my-documents") { setCurrentPage('my-documents'); setActive("My Documents"); }
      else if (hash === "cv-builder") { setCurrentPage('app'); setActive("CV Builder"); }
      else if (hash === "cover-letter") { setCurrentPage('app'); setActive("Cover Letter"); }
      else if (hash === "founder") { setCurrentPage('founder'); setActive("Founder"); }
      else if (hash === "privacy-policy") { setCurrentPage('legal'); setActive("Privacy Policy"); }
      else if (hash === "terms-of-service") { setCurrentPage('legal'); setActive("Terms of Service"); }
      else if (hash === "contact") { setCurrentPage('legal'); setActive("Contact"); }
      else if (hash === "" || hash === "workspace") {
        const path = window.location.pathname.replace(/\/$/, '') || '/';
        if (path === '/') {
          setCurrentPage('workspace');
          setActive('AI Chat');
        }
      }
    };

    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // ✅ FIX 3: URL SYNC
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const routeMap: Record<string, string> = {
      'workspace': '/',
      'my-documents': '/my-documents',
      'templates': '/templates',
      'cover-templates': '/cover-templates',
      'founder': '/founder',
    };

    let targetPath = routeMap[currentPage] || '/';

    if (currentPage === 'app') {
      targetPath = active === 'CV Builder' ? '/cv-builder' : '/cover-letter';
    } else if (currentPage === 'legal') {
      if (active === 'Privacy Policy') targetPath = '/privacy-policy';
      else if (active === 'Terms of Service') targetPath = '/terms-of-service';
      else if (active === 'Contact') targetPath = '/contact';
    }

    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath !== targetPath) {
      window.history.replaceState({}, '', targetPath);
    }
  }, [currentPage, active]);

  const sortChats = useCallback((chats: ChatType[]) => [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return b.id - a.id;
    return a.pinned ? -1 : 1;
  }), []);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const savedHistory = safeGetItem("adin-history");
      const savedMessages = safeGetItem("adin-messages");
      const savedCurrent = safeGetItem("adin-current-chat");
      const savedWeb = safeGetItem("adin-web-enabled");
      let historyData = savedHistory ? JSON.parse(savedHistory) : [];
      const messagesData = savedMessages ? JSON.parse(savedMessages) : {};
      const currentData = savedCurrent ? JSON.parse(savedCurrent) : null;
      historyData = sortChats(historyData);
      setChatHistory(historyData);
      setChatMessages(messagesData);
      setCurrentChatId(currentData);
      setAiMemory(loadMemory());
      if (savedWeb !== null) setWebEnabled(JSON.parse(savedWeb));
      if (currentData && messagesData[currentData]) setMessages(messagesData[currentData]);
    } catch (err) {}
  }, [sortChats]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => { saveMemory(aiMemory); }, [aiMemory]);

  const sendMessage = useCallback(async (retry?: string) => {
    if (isSendingRef.current) return;
    const finalInput = retry || input;
    if (!finalInput.trim() && pendingFiles.length === 0) return;
    isSendingRef.current = true;
    safeRemoveItem("adin-draft-input");
    let activeId = currentChatId;
    if (!activeId) {
      activeId = Date.now();
      const newChat = { id: activeId, title: finalInput.slice(0, 25) || "New Chat", createdAt: Date.now() };
      setChatHistory(prev => sortChats([newChat, ...prev]));
      setCurrentChatId(activeId);
    }
    let fullMessage = finalInput;
    const filesToSend = [...pendingFiles];
    if (filesToSend.length > 0) {
      filesToSend.forEach(file => { fullMessage += `\n\nFile: ${file.name}\nContent:\n${file.content}`; });
    }
    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
    setInput("");
    const userMsg: MessageType = { role: "user", text: fullMessage, files: filesToSend };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setLoading(true);
    setChatMessages(prev => ({ ...prev, [activeId!]: updated }));
    try {
      const res = await sendToAI(updated, aiMemory, webEnabled, userId);
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "No response";
      const final = [...updated, { role: "ai", text: aiText }];
      setMessages(final);
      setChatMessages(prev => ({ ...prev, [activeId!]: final }));
    } catch (err) { toast.error("Connection Error"); }
    finally { setLoading(false); isSendingRef.current = false; }
  }, [input, pendingFiles, currentChatId, messages, aiMemory, webEnabled, userId, sortChats]);

  const pageKey = getPageKey();
  const seoConfig = getSEOConfig(pageKey);

  const currentRoute: AppRoute = (() => {
    if (currentPage === 'workspace') return 'home';
    if (currentPage === 'my-documents') return 'documents';
    if (currentPage === 'templates') return 'templates';
    if (currentPage === 'cover-templates') return 'cover-templates';
    if (currentPage === 'app' && active === 'CV Builder') return 'cv-builder';
    if (currentPage === 'app' && active === 'Cover Letter') return 'cover-letter';
    return 'home';
  })();

  const isBuilderPage = currentPage === 'app' && (active === 'CV Builder' || active === 'Cover Letter');
  const isLegalPage = currentPage === 'legal' || currentPage === 'founder';

  const handleLandingBuildCV = useCallback(() => {
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('templates');
    setActive('CV Templates');
    navigateToPath('/templates');
  }, []);

  const handleLandingWriteCoverLetter = useCallback(() => {
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('cover-templates');
    setActive('Cover Templates');
    navigateToPath('/cover-templates');
  }, []);

  const handleLandingViewCVTemplates = useCallback(() => {
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('templates');
    setActive('CV Templates');
    navigateToPath('/templates');
  }, []);

  const handleLandingViewCoverTemplates = useCallback(() => {
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('cover-templates');
    setActive('Cover Templates');
    navigateToPath('/cover-templates');
  }, []);

  const handleLandingFounder = useCallback(() => {
    sessionSet('adin-legal-from-landing', 'true');
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('founder');
    setActive('Founder');
    navigateToPath('/founder');
  }, []);

  const handleLandingPrivacy = useCallback(() => {
    sessionSet('adin-legal-from-landing', 'true');
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('legal');
    setActive('Privacy Policy');
    navigateToPath('/privacy-policy');
  }, []);

  const handleLandingTerms = useCallback(() => {
    sessionSet('adin-legal-from-landing', 'true');
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('legal');
    setActive('Terms of Service');
    navigateToPath('/terms-of-service');
  }, []);

  const handleLandingContact = useCallback(() => {
    sessionSet('adin-legal-from-landing', 'true');
    safeSetItem('adin-has-seen-landing', 'true');
    setShowLanding(false);
    setCurrentPage('legal');
    setActive('Contact');
    navigateToPath('/contact');
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // 1. LANDING PAGE
  // ═══════════════════════════════════════════════════════════════
  if (showLanding) {
    return (
      <>
        <SEOHead
          title={seoConfig.title}
          description={seoConfig.description}
          keywords={seoConfig.keywords}
          canonicalUrl={seoConfig.canonicalUrl}
          ogType="website"
        />

        <style>{`
          html, body {
            height: auto !important;
            min-height: 100% !important;
            max-height: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            background: #f1f5f9;
            color: #0f172a;
          }
          body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * {
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
          }
          ${buildScrollbarCss(false)}
        `}</style>

        <LandingPage
          onGetStarted={handleLandingComplete}
          onBuildCV={handleLandingBuildCV}
          onWriteCoverLetter={handleLandingWriteCoverLetter}
          onViewCVTemplates={handleLandingViewCVTemplates}
          onViewCoverTemplates={handleLandingViewCoverTemplates}
          onOpenFounder={handleLandingFounder}
          onOpenSidebar={undefined}
          onOpenPrivacy={handleLandingPrivacy}
          onOpenTerms={handleLandingTerms}
          onOpenContact={handleLandingContact}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. LEGAL PAGES
  // ═══════════════════════════════════════════════════════════════
  if (isLegalPage) {
    return (
      <NavigationProvider onNavigate={handleGlobalNavigate} currentRoute={currentRoute}>
        <>
          <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} ogType="website" />
          <AdinToaster />

          <div className="w-full min-h-screen flex flex-col bg-slate-100">
            <Suspense fallback={<LoadingScreen />}>
              {currentPage === 'founder' ? (
                <Founder onBack={handleBackFromLegal} />
              ) : (
                <>
                  {active === "Privacy Policy" && <PrivacyPolicy onBack={handleBackFromLegal} />}
                  {active === "Terms of Service" && <TermsOfService onBack={handleBackFromLegal} />}
                  {active === "Contact" && <Contact onBack={handleBackFromLegal} />}
                </>
              )}
            </Suspense>
          </div>
        </>
      </NavigationProvider>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. ONBOARDING (skip for public SEO pages)
  // ═══════════════════════════════════════════════════════════════
  const isPublicPageForSEO = PUBLIC_PAGES_FOR_SEO.includes(currentPage);

  if (!isOnboardingComplete && !isPublicPageForSEO) {
    return (
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} ogType="website" />
        <Onboarding
          onComplete={handleOnboardingComplete}
          onRestoreClick={() => setShowRestoreModal(true)}
        />
        <RestoreData
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onRestored={handleRestoredFromOnboarding}
        />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. MAIN APP
  // ═══════════════════════════════════════════════════════════════
  return (
    <NavigationProvider onNavigate={handleGlobalNavigate} currentRoute={currentRoute}>
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} ogType="website" />
        <AdinToaster />

        <div className="app-guest-root w-screen min-h-screen flex bg-slate-100 text-slate-900">
          {currentPage === 'workspace' ? (
            <div className="w-full min-h-screen flex flex-col">
              <div className="h-[56px] flex justify-between items-center px-3 sm:px-5 border-b border-slate-200 shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-20">
                <SidebarToggle onOpen={openSidebar} />
                <button
                  onClick={handleOpenBackupHelp}
                  className="group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  aria-label="Backup Help"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Shield size={13} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
                    Backup Help
                  </span>
                </button>
              </div>
              <Suspense fallback={<LoadingScreen />}>
                <WorkspacePage
                  onNavigate={handleWorkspaceNavigate}
                  userId={userId}
                  onEditDocument={handleEditDocument}
                  onEditCoverLetter={handleEditCoverLetter}
                />
              </Suspense>
            </div>
          ) : currentPage === 'my-documents' ? (
            <div className="w-full h-screen flex flex-col overflow-hidden">
              <div className="h-[56px] flex justify-between items-center px-3 sm:px-5 border-b border-slate-200 shrink-0 bg-white/95 backdrop-blur-md">
                <SidebarToggle onOpen={openSidebar} />
                <button
                  onClick={handleOpenBackupHelp}
                  className="group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  aria-label="Backup Help"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Shield size={13} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
                    Backup Help
                  </span>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <Suspense fallback={<LoadingScreen />}>
                  <MyDocuments
                    userId={userId}
                    onCreateNew={handleCreateNewCV}
                    onEditDocument={handleEditDocument}
                    onCreateCoverLetter={handleCreateNewCoverLetter}
                    onEditCoverLetter={handleEditCoverLetter}
                  />
                </Suspense>
              </div>
            </div>
          ) : currentPage === 'templates' ? (
            <div className="w-full h-screen flex flex-col overflow-hidden">
              <div className="h-[56px] flex justify-between items-center px-3 sm:px-5 border-b border-slate-200 shrink-0 bg-white/95 backdrop-blur-md">
                <SidebarToggle onOpen={openSidebar} />
                <button
                  onClick={handleOpenBackupHelp}
                  className="group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  aria-label="Backup Help"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Shield size={13} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
                    Backup Help
                  </span>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <Suspense fallback={<LoadingScreen />}>
                  <CVTemplatesPage onBackToHome={navigateBackFromTemplates} onTemplateSelect={handleTemplateSelect} />
                </Suspense>
              </div>
            </div>
          ) : currentPage === 'cover-templates' ? (
            <div className="w-full h-screen flex flex-col overflow-hidden">
              <div className="h-[56px] flex justify-between items-center px-3 sm:px-5 border-b border-slate-200 shrink-0 bg-white/95 backdrop-blur-md">
                <SidebarToggle onOpen={openSidebar} />
                <button
                  onClick={handleOpenBackupHelp}
                  className="group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  aria-label="Backup Help"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Shield size={13} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
                    Backup Help
                  </span>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <Suspense fallback={<LoadingScreen />}>
                  <CoverTemplatesPage onBackToHome={navigateBackFromTemplates} onTemplateSelect={handleCoverTemplateSelect} />
                </Suspense>
              </div>
            </div>
          ) : currentPage === 'app' ? (
            <div className="w-screen h-screen flex flex-col overflow-hidden">
              <div className="flex-1 min-h-0">
                {active === "CV Builder" ? (
                  <Suspense fallback={<LoadingScreen />}>
                    <CVBuilder
                      userId={userId}
                      onBackToHome={handleBackFromCVBuilder}
                      onBackToDocuments={handleBackFromCVBuilder}
                      initialTemplateId={selectedTemplateId || undefined}
                      documentId={activeDocumentId || undefined}
                      onDocumentCreated={(docId) => setActiveDocumentId(docId)}
                      onDownloadId={handleDownloadMyId}
                      onSetPin={handleSetPinClick}
                      hasPinSet={hasPinSet}
                    />
                  </Suspense>
                ) : active === "Cover Letter" ? (
                  <Suspense fallback={<LoadingScreen />}>
                    <CoverLetter
                      key={`cover-letter-${coverLetterKey}-${activeCoverLetterId || 'new'}`}
                      userId={userId}
                      onBackToHome={handleBackFromCoverLetter}
                      onBackToDocuments={handleBackFromCoverLetter}
                      initialTemplateId={selectedCoverTemplateId || undefined}
                      documentId={activeCoverLetterId || undefined}
                      onDocumentCreated={(docId) => setActiveCoverLetterId(docId)}
                      onTemplateChange={(template) => {
                        setSelectedCoverTemplateId(template);
                      }}
                      onSetPin={handleSetPinClick}
                      hasPinSet={hasPinSet}
                    />
                  </Suspense>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500"><p>Loading...</p></div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full min-h-screen flex flex-col">
              <div className="h-[56px] flex justify-between items-center px-3 sm:px-5 border-b border-slate-200 shrink-0 bg-white/95 backdrop-blur-md sticky top-0 z-20">
                <SidebarToggle onOpen={openSidebar} />
                <button
                  onClick={handleOpenBackupHelp}
                  className="group inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                  aria-label="Backup Help"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-sm">
                    <Shield size={13} className="text-white" strokeWidth={2.4} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-purple-700 transition-colors">
                    Backup Help
                  </span>
                </button>
              </div>
              <Suspense fallback={<LoadingScreen />}>
                <WorkspacePage
                  onNavigate={handleWorkspaceNavigate}
                  userId={userId}
                  onEditDocument={handleEditDocument}
                  onEditCoverLetter={handleEditCoverLetter}
                />
              </Suspense>
            </div>
          )}

          {isBuilderPage ? (
            <style>{`
              html, body {
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
                background: #f1f5f9;
              }
              body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * {
                height: 100% !important;
                max-height: 100% !important;
                overflow: hidden !important;
              }
              .app-guest-root {
                display: block;
                width: 100%;
                height: 100vh;
                min-height: 100vh;
                max-height: 100vh;
                overflow: hidden;
              }
            `}</style>
          ) : (
            <style>{`
              html, body {
                height: auto !important;
                min-height: 100% !important;
                max-height: none !important;
                overflow-y: auto !important;
                overflow-x: hidden !important;
                background: #f1f5f9;
                color: #0f172a;
              }
              body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * {
                height: auto !important;
                max-height: none !important;
                overflow-y: visible !important;
                overflow-x: visible !important;
              }
              .app-guest-root {
                display: block;
                width: 100%;
                min-height: 100vh;
                height: auto;
                overflow: visible;
                position: relative;
              }
              ${buildScrollbarCss(true)}
            `}</style>
          )}
        </div>

        <GlobalSidebar
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          currentPage={currentRoute}
          userId={userId}
          userName={userName}
          hasPinSet={hasPinSet}
          onOpenProfile={() => { if (userId) setShowProfilePage(true); else startOnboarding(); }}
        />

        <ProfilePage
          isOpen={showProfilePage}
          onClose={() => setShowProfilePage(false)}
          userId={userId}
          userName={userName}
          hasPinSet={hasPinSet}
          onRestoreClick={() => setShowRestoreModal(true)}
          onDownloadIdClick={handleDownloadMyId}
          onSetPinClick={handleSetPinClick}
          onClearCacheClick={handleClearCacheClick}
          onDeleteAccountClick={() => setShowDeleteAccount(true)}
          onLogoutClick={handleLogoutClick}
        />

        <RestoreData
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onRestored={() => {
            console.log('[App] Data restored — reloading to show new docs');
          }}
        />

        <LogoutWarningPopup
          isOpen={showLogoutWarning}
          userId={userId}
          hasPinSet={hasPinSet}
          onSetPin={() => {
            setShowLogoutWarning(false);
            setShowSetPin(true);
          }}
          onCancel={() => setShowLogoutWarning(false)}
          onConfirmLogout={handleGuestLogout}
        />

        <ClearCacheConfirm
          isOpen={showClearCache}
          userId={userId}
          onConfirm={handleConfirmClearCache}
          onCancel={() => setShowClearCache(false)}
        />

        <DeleteAccountConfirm
          isOpen={showDeleteAccount}
          userId={userId}
          onConfirm={handleDeleteAccountConfirm}
          onCancel={() => setShowDeleteAccount(false)}
        />

        <SetPinModal
          key={`set-pin-${userId}`}
          isOpen={showSetPin}
          userId={userId}
          onClose={() => setShowSetPin(false)}
          onSuccess={handleSetPinSuccess}
        />

        {showPinEducation && userId && (
          <PinEducationPopup
            userId={userId}
            hasPinSet={hasPinSet}
            onSetPin={handlePinEducationSetPin}
            onDismiss={handlePinEducationDismiss}
          />
        )}

        <FeedbackFullScreen
          isOpen={showGlobalFeedback}
          onClose={() => {
            setShowGlobalFeedback(false);
            markFeedbackShown('global');
          }}
          source="global"
        />

        {!isBuilderPage && !showProfilePage && (
          <button
            onClick={() => setShowGlobalFeedback(true)}
            aria-label="Give feedback"
            className="fixed bottom-6 right-6 z-[9997] group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
          >
            <MessageSquare size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        )}
      </>
    </NavigationProvider>
  );
}

export default function App() {
  return (
    <SidebarProvider>
      <AppInner />
    </SidebarProvider>
  );
}