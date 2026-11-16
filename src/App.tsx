// App.tsx - Complete updated file with PATH ROUTING + SEO FIXES + REALTIME SYNC
// ✅ THEME: Unified with CVBuilder.tsx
// ✅ FIX 1: Onboarding skip for public pages
// ✅ FIX 2: Backward compat — trailing slash handle
// ✅ FIX 3: URL sync — shortcut clicks update URL
// ✅ FIX 4: handleBackFromLegal — history.back()
// ✅ FIX 5: Landing page shows on `/`
// ✅ FIX 6: Manual logout guard — 429/network SIGNED_OUT is IGNORED
// ✅ FIX 7: Document sync v2 (versioned saves, pull on open/focus, conflict banner)

import { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Onboarding } from "./components/Onboarding";
import { SEOHead } from "./components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "./utils/seo";
import { initializeGA, trackPageView, setUserID } from "./utils/analytics";
import { getSEOConfig } from "./utils/seoPages";
import LandingPage from './components/Landing/LandingPage';
import { AuthScreen } from './components/auth/AuthScreen';

import { NavigationProvider, AppRoute } from './contexts/NavigationContext';

import { syncService } from './services/sync/syncService';
import { useDocSync } from './services/sync/docsync/useDocSync';
import { requestCaptchaToken } from './utils/captcha';
import { DocSyncBanner } from './components/sync/DocSyncBanner';
import { supabase, saveSessionBackup, clearSessionBackup, tryRecoverSession, forceLocalSignOut, setSessionRecoveryBlocked } from './services/sync/supabaseClient';

import LogoutWarningPopup from './components/LogoutWarningPopup';
import DeleteAccountConfirm from './components/DeleteAccountConfirm';

import FeedbackFullScreen from './components/feedback/FeedbackFullScreen';
import { markFeedbackShown } from './services/feedbackService';

import GlobalSidebar from './components/global/GlobalSidebar';
import { AppTopBar, FloatingMenuButton, PAGE_CHROME } from './components/global/AppTopBar';
import ProfilePage from './components/profile/ProfilePage';
import { useSidebar, SidebarProvider } from './hooks/useSidebar';

import { STORAGE_QUOTA_EXCEEDED_EVENT } from './components/cv-builder/hooks/useAutoSave';
import { IN_APP_STATE, FORCE_LANDING_KEY } from './utils/inAppNav';

const CVBuilder = lazy(() => import("./components/cv-builder/CVBuilder"));
const CoverLetter = lazy(() => import("./components/cover-letter/CoverLetter"));
const CVTemplatesPage = lazy(() => import("./components/Templates/CVTemplatesPage"));
const CoverTemplatesPage = lazy(() => import("./components/Templates/CoverTemplatesPage"));

const WorkspacePage = lazy(() => import("./components/Workspace/WorkspacePage"));

const MyDocuments = lazy(() => import("./components/cv-builder/components/MyDocuments"));
const Founder = lazy(() => import("./pages/Founder"));
const ToolLandingPage = lazy(() => import("./pages/ToolLandingPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

import { localStorageDocumentService } from "./components/cv-builder/services/documentService";

import {
  Search as SearchIcon, Library as LibraryIcon,
  Globe, FileText, Settings as SettingsIcon, Plus, Pencil, Trash2,
  Copy, Check, Pin, ThumbsUp, ThumbsDown, RotateCcw, Edit, Sparkles, User,
  X, Code2, ArrowLeft, Terminal, Database, Cloud, Shield, Braces, Layout, Server, GitBranch, Cpu,
  BookOpen, Bug, Rocket, Target, Briefcase, Mail, LogOut, ChevronDown,
  Download,
  ChevronRight,
  HardDrive,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster, useToasterStore } from "react-hot-toast";
import { sendToAI, saveMemoryFromResponse } from "./services/ai";
import { saveMemory, loadMemory } from "./utils/memory";
import { LoadingScreen } from "./components/LoadingScreen";
import { TOOL_LANDING_CONTENT } from "./config/toolLandingContent";

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

// Google DP (avatar) — login par ek baar save hota hai, taake refresh par purana rang flash na ho
// aur ProfilePage / GlobalSidebar ko Supabase se baar baar fetch na karna pade (429 rate limit)
const AVATAR_URL_STORAGE_KEY = 'adin-avatar-url';

// Purane ID+PIN system ke users ("ADN-XXXX") — naya Supabase login zaroori hai
const GUEST_SESSION_STORAGE_KEY = 'adin-guest-session';
const LEGACY_USER_ID_PREFIX = 'ADN-';
const LEGACY_USER_ID_BACKUP_KEY = 'adin-legacy-user-id';   // purani ID yaad rakhte hain (documents baad mein migrate ho sakte hain)
const LEGACY_UPGRADE_TOAST_ID = 'adin-legacy-upgrade';
const LEGACY_UPGRADE_TOAST_DURATION_MS = 10 * 1000;
const LEGACY_UPGRADE_MESSAGE = 'We upgraded to secure accounts. Please sign in to keep your documents synced.';
const isLegacyUserId = (id: string): boolean => id.startsWith(LEGACY_USER_ID_PREFIX);

// ============================================
// Cloud sync / auth constants (no magic values)
// ============================================
const SESSION_RECOVERY_RETRY_DELAYS_MS = [2 * 1000, 12 * 1000, 40 * 1000];
const SESSION_LOST_TOAST_ID = 'adin-session-lost';
const SESSION_LOST_TOAST_DURATION_MS = 12 * 1000;
const SESSION_LOST_MESSAGE = 'Cloud session expired — your work is saved on this device. Please sign in again to keep syncing.';

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

const resetPopupFlags = (): void => {
  try {
    const popupKeys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith('adin-feedback-') || k.startsWith('adin-pdf-download-count') || k.startsWith('adin-pin-prompt-count'))) {
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
    <>
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerStyle={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 999999, pointerEvents: 'none' }}
      toastOptions={{
        duration: 4000,
        style: { background: '#ffffff', color: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 20px 60px -10px rgba(2, 6, 23, 0.15)', pointerEvents: 'auto', maxWidth: '500px', width: 'auto' },
        success: { style: { border: '1px solid rgba(34, 197, 94, 0.3)' } },
        error: { style: { border: '1px solid rgba(239, 68, 68, 0.3)' } },
        loading: { style: { border: '1px solid rgba(168, 85, 247, 0.3)' } },
      }}
    />
    <DocSyncBanner />
    </>
  );
};

type PageType = 'workspace' | 'my-documents' | 'app' | 'templates' | 'cover-templates' | 'founder' | 'legal' | 'blog' | 'blog-post' | 'tool-landing' | 'reset-password' | 'login' | 'signup';

const BLOG_ROUTE_PATH = '/blog';
const BLOG_POST_ROUTE_PREFIX = '/blog/';
const ACTIVE_BLOG = 'Blog';
const PAGE_KEY_BLOG = 'blog';
const LANDING_SEEN_STORAGE_KEY = 'adin-has-seen-landing';

interface PathRoute { page: PageType; active: string; }

const PATH_ROUTES: Record<string, PathRoute> = {
  '/': { page: 'workspace', active: 'AI Chat' },
  '/workspace': { page: 'workspace', active: 'AI Chat' },
  '/templates': { page: 'templates', active: 'CV Templates' },
  '/cover-templates': { page: 'cover-templates', active: 'Cover Templates' },
  '/cv-builder': { page: 'app', active: 'CV Builder' },
  '/cover-letter': { page: 'app', active: 'Cover Letter' },
  '/my-documents': { page: 'my-documents', active: 'My Documents' },
  '/founder': { page: 'founder', active: 'Founder' },
  '/privacy-policy': { page: 'legal', active: 'Privacy Policy' },
  '/terms-of-service': { page: 'legal', active: 'Terms of Service' },
  '/contact': { page: 'legal', active: 'Contact' },
  [BLOG_ROUTE_PATH]: { page: 'blog', active: ACTIVE_BLOG },
  '/reset-password': { page: 'reset-password', active: 'Reset Password' },
  '/login': { page: 'login', active: 'Sign In' },
  '/signup': { page: 'signup', active: 'Sign Up' },
  '/free-cv-builder': { page: 'tool-landing', active: 'Free CV Builder' },
  '/free-cover-letter-generator': { page: 'tool-landing', active: 'Free Cover Letter Generator' },
};

const getPathRoute = (): PathRoute | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path.startsWith(BLOG_POST_ROUTE_PREFIX) && path.length > BLOG_POST_ROUTE_PREFIX.length) {
    return { page: 'blog-post', active: ACTIVE_BLOG };
  }
  return PATH_ROUTES[path] || null;
};

const getBlogSlugFromPath = (): string | null => {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (!path.startsWith(BLOG_POST_ROUTE_PREFIX)) return null;
  const rawSlug = path.slice(BLOG_POST_ROUTE_PREFIX.length);
  if (!rawSlug) return null;
  try { return decodeURIComponent(rawSlug); } catch { return rawSlug; }
};

const navigateToPath = (path: string, replace = false): void => {
  if (typeof window === 'undefined') return;
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  const targetPath = path.startsWith('/') ? path : `/${path}`;
  if (currentPath === targetPath) return;
  if (replace) { window.history.replaceState(window.history.state ?? {}, '', targetPath); }
  else { window.history.pushState(IN_APP_STATE, '', targetPath); }
};

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
  return Object.prototype.hasOwnProperty.call(DEEP_LINK_ROUTES, hash) ? DEEP_LINK_ROUTES[hash as DeepLinkHash] : null;
};

const PUBLIC_PAGES_FOR_SEO: PageType[] = ['templates', 'cover-templates', 'founder', 'legal'];

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
    return !!safeGetItem(GUEST_SESSION_STORAGE_KEY);   // naam hone ka matlab guest nahi — asli account bhi naam rakhta hai
  });

  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(() => {
    return safeGetItem("adin-onboarding-completed") === "true";
  });

  const [userEmail, setUserEmail] = useState<string>('');
  const [showChangePassword, setShowChangePassword] = useState(false);

  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (window.location.pathname === '/reset-password' || /(^|[#&?])type=recovery(&|$)/.test(window.location.hash));
  });

  const [isAuthResolving, setIsAuthResolving] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const { hash, search } = window.location;
    return /(^|[#&])access_token=/.test(hash) || /[?&]code=/.test(search);
  });

  const [userName, setUserName] = useState<string>(() => {
    return safeGetItem("adin_user_name") || "User";
  });

  const profileRef = useRef<HTMLDivElement>(null);
  const isManualLogoutRef = useRef<boolean>(false);
  const signOutPendingRef = useRef<boolean>(false);
  const sessionLostRef = useRef<boolean>(false);
  const openedViaDeepLinkRef = useRef<boolean>(getDeepLinkRoute() !== null);

  const [showLogoutWarning, setShowLogoutWarning] = useState<boolean>(false);
  const [showClearCache, setShowClearCache] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [hasPinSet, setHasPinSet] = useState(false);
  const [showProfilePage, setShowProfilePage] = useState(false);
  const [showGlobalFeedback, setShowGlobalFeedback] = useState(false);

  const [showLanding, setShowLanding] = useState(() => {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname.replace(/\/$/, '') || '/' : '/';
    const isRootPath = currentPath === '/' || currentPath === '/workspace';
    if (!isRootPath) return false;
    if (getDeepLinkRoute()) return false;
    const hasSeenLanding = safeGetItem('adin-has-seen-landing');
    const guestSession = safeGetItem('adin-guest-session');
    const onboardingCompleted = safeGetItem('adin-onboarding-completed');
    const userName = safeGetItem('adin_user_name');
    if (onboardingCompleted === 'true' || guestSession || userName) return false;
    if (sessionGet(FORCE_LANDING_KEY) === 'true') return true;
    if (hasSeenLanding) return false;
    return true;
  });

  useEffect(() => { sessionRemove(FORCE_LANDING_KEY); }, []);

  const [authUserId, setAuthUserId] = useState<string>(() => safeGetItem("adin-user-id") || '');
  const [globalAvatarUrl, setGlobalAvatarUrl] = useState<string | null>(() => safeGetItem(AVATAR_URL_STORAGE_KEY) || null);

  const userId = useMemo(() => {
    if (!isOnboardingComplete) return '';
    return authUserId;
  }, [isOnboardingComplete, authUserId]);

  useEffect(() => { syncService.flushQueue().catch(() => {}); }, []);

  useEffect(() => {
    let cancelled = false;
    const NULL_SESSION_GRACE_MS = 10000;
    const AUTH_EVENT_LOG_TAG = '[auth-event]'; 
    let pendingSignOutTimer: number | undefined;
    const cancelPendingSignOut = () => {
      if (pendingSignOutTimer !== undefined) { window.clearTimeout(pendingSignOutTimer); pendingSignOutTimer = undefined; }
    };

    const applySignedIn = (user: { id: string; email?: string; user_metadata?: Record<string, any> }) => {
      cancelPendingSignOut(); 
      isManualLogoutRef.current = false; 
      setSessionRecoveryBlocked(false);   // naya / asli sign-in → recovery dobara allowed
      const name: string = user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '') || 'User';
      const wasComplete = safeGetItem("adin-onboarding-completed") === "true";
      safeSetItem("adin-user-id", user.id);
      safeSetItem("adin_user_name", name);
      const avatar: string | undefined = user.user_metadata?.avatar_url || user.user_metadata?.picture;
      if (avatar) safeSetItem(AVATAR_URL_STORAGE_KEY, avatar);
      else safeRemoveItem(AVATAR_URL_STORAGE_KEY);   // email/password user: purane account ki DP na dikhe
      setGlobalAvatarUrl(avatar || null);
      safeRemoveItem(GUEST_SESSION_STORAGE_KEY);   // asli account hai, guest nahi (purana flag bhi saaf)
      safeSetItem("adin-onboarding-completed", "true");
      safeRemoveItem("adin-just-signed-out"); 
      setAuthUserId(user.id);
      setUserEmail(user.email || '');
      setUserName(name);
      setIsGuest(false);
      setIsOnboardingComplete(true);
      if (!wasComplete) setShowLanding(false); 
    };

    const applySignedOut = (clearUserId: boolean) => {
      safeRemoveItem("adin-onboarding-completed");
      if (clearUserId) { safeRemoveItem("adin-user-id"); safeRemoveItem(AVATAR_URL_STORAGE_KEY); setGlobalAvatarUrl(null); }
      setAuthUserId(prev => (clearUserId ? '' : prev));
      setUserEmail('');
      setIsOnboardingComplete(false);
    };

    // Purane ID+PIN user: Supabase session kabhi thi hi nahi → "recover" ka koi faida nahi.
    // Seedha saaf message + login page, aur purani ID yaad rakho (documents local mein safe rehte hain).
    const handleLegacySessionUpgrade = (legacyId: string) => {
      safeSetItem(LEGACY_USER_ID_BACKUP_KEY, legacyId);
      safeRemoveItem(GUEST_SESSION_STORAGE_KEY);
      safeRemoveItem("adin_user_name");
      applySignedOut(true);
      setUserName('User');
      setIsGuest(false);
      safeSetItem('adin-has-seen-landing', 'true');
      setShowLanding(false);
      setCurrentPage('login');
      setActive('Sign In');
      navigateToPath('/login', true);
      toast(LEGACY_UPGRADE_MESSAGE, { id: LEGACY_UPGRADE_TOAST_ID, duration: LEGACY_UPGRADE_TOAST_DURATION_MS });
    };

    // ✅ Unexpected SIGNED_OUT (429 / refresh race) → pehle session wapas lane ki koshish, phir saaf message.
    //    Pehle sirf ignore hota tha → UI logged-in dikhata tha magar cloud sync chup-chaap band ho jata tha.
    let recovering = false;
    const recoverAfterUnexpectedSignOut = async () => {
      if (recovering) return;
      recovering = true;
      try {
        for (const delayMs of SESSION_RECOVERY_RETRY_DELAYS_MS) {
          await new Promise<void>((resolve) => window.setTimeout(resolve, delayMs));
          if (cancelled || isManualLogoutRef.current === true) return;
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) return;
          const recovered = await tryRecoverSession();
          if (recovered?.user) {
            applySignedIn(recovered.user);
            void syncService.retryQueueNow();
            return;
          }
        }
        if (!cancelled && !sessionLostRef.current) {
          sessionLostRef.current = true;
          toast.error(SESSION_LOST_MESSAGE, { id: SESSION_LOST_TOAST_ID, duration: SESSION_LOST_TOAST_DURATION_MS });
        }
      } catch (e) {
        console.error('[App] session recovery failed:', e);
      } finally {
        recovering = false;
      }
    };

    const resolveTimeout = window.setTimeout(() => { if (!cancelled) setIsAuthResolving(false); }, 10000);

    supabase.auth.getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data.session?.user) applySignedIn(data.session.user);
        setIsAuthResolving(false);
      })
      .catch((e) => {
        console.error('[App] getSession failed:', e);
        if (!cancelled) setIsAuthResolving(false);
      });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      console.log(AUTH_EVENT_LOG_TAG, event, { hasSession: !!session, expiresAt: session?.expires_at });
      // ✅ Logout chal raha hai → is dauran aane wale session events purane/stray hain, ignore karo
      if (signOutPendingRef.current && session?.user) {
        console.warn('[App] Ignoring stale session event during logout:', event);
        return;
      }
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
        saveSessionBackup(session);
      }
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        sessionLostRef.current = false;
        toast.dismiss(SESSION_LOST_TOAST_ID);
        void syncService.retryQueueNow();   // session wapas aayi → atke hue uploads foran bhejo
      }
      if (event === 'PASSWORD_RECOVERY') {
        window.history.replaceState({}, '', '/reset-password');
        setIsPasswordRecovery(true);
        setCurrentPage('reset-password');
      }
      if (session?.user) {
        applySignedIn(session.user);
      } else if (event === 'SIGNED_OUT') {
        if (isManualLogoutRef.current === true) {
          isManualLogoutRef.current = false; 
          signOutPendingRef.current = false;
          clearSessionBackup();
          applySignedOut(true);
          setShowLanding(true); 
        } else {
          console.warn('[App] Non-manual SIGNED_OUT — trying to recover session.');
          void recoverAfterUnexpectedSignOut();
        }
      } else if (event === 'INITIAL_SESSION') {
        const wasLoggedIn = safeGetItem("adin-onboarding-completed") === "true" && !!safeGetItem("adin-user-id");
        if (wasLoggedIn) {
          cancelPendingSignOut();
          pendingSignOutTimer = window.setTimeout(async () => {
            pendingSignOutTimer = undefined;
            if (cancelled) return;
            try {
              const { data: latest } = await supabase.auth.getSession();
              if (cancelled) return;
              if (latest.session?.user) { applySignedIn(latest.session.user); setIsAuthResolving(false); return; }
            } catch (e) { console.error('[App] getSession re-check failed:', e); }
            if (isManualLogoutRef.current === true) {
              isManualLogoutRef.current = false;
              applySignedOut(false);
            } else {
              const storedUserId = safeGetItem("adin-user-id") || '';
              if (isLegacyUserId(storedUserId)) {
                console.warn('[App] Legacy (ID+PIN) session found without Supabase login — asking user to sign in.');
                handleLegacySessionUpgrade(storedUserId);
              } else {
                console.warn('[App] Deferred INITIAL_SESSION had no session, but logout was not manual.');
                void recoverAfterUnexpectedSignOut();
              }
            }
            setIsAuthResolving(false);
          }, NULL_SESSION_GRACE_MS);
          return;
        }
        if (isManualLogoutRef.current === true) {
          isManualLogoutRef.current = false;
          applySignedOut(false);
        }
      }
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setIsAuthResolving(false);
      }
    });

    return () => {
      cancelled = true;
      cancelPendingSignOut();
      window.clearTimeout(resolveTimeout);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // ✅ Document sync v2: app open / focus / online / har 2 min par dusre device ka data pull + unsaved edits retry.
  //    Koi auto page-reload nahi, koi realtime socket nahi.
  useDocSync(userId, isOnboardingComplete);

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
    if (userId && isOnboardingComplete) setHasPinSet(true); 
  }, [userId, isOnboardingComplete]);

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const pathRoute = getPathRoute();
    if (pathRoute) return pathRoute.page;
    const deepLink = getDeepLinkRoute();
    if (deepLink) return deepLink.page;
    const saved = sessionGet('adin-session-page');
    if (saved && ['workspace', 'my-documents', 'app', 'templates', 'cover-templates', 'founder', 'legal'].includes(saved)) return saved as PageType;
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

  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(() => sessionGet('adin-session-cv-doc') || null);
  const [activeCoverLetterId, setActiveCoverLetterId] = useState<string | null>(() => sessionGet('adin-session-cl-doc') || null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(() => sessionGet('adin-session-template') || null);
  const [selectedCoverTemplateId, setSelectedCoverTemplateId] = useState<string | null>(() => sessionGet('adin-session-cover-template') || null);
  
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
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(() => getBlogSlugFromPath());
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
  useEffect(() => { if (activeDocumentId) sessionSet('adin-session-cv-doc', activeDocumentId); else sessionRemove('adin-session-cv-doc'); }, [activeDocumentId]);
  useEffect(() => { if (activeCoverLetterId) sessionSet('adin-session-cl-doc', activeCoverLetterId); else sessionRemove('adin-session-cl-doc'); }, [activeCoverLetterId]);
  useEffect(() => { if (selectedTemplateId) sessionSet('adin-session-template', selectedTemplateId); else sessionRemove('adin-session-template'); }, [selectedTemplateId]);
  useEffect(() => { if (selectedCoverTemplateId) sessionSet('adin-session-cover-template', selectedCoverTemplateId); else sessionRemove('adin-session-cover-template'); }, [selectedCoverTemplateId]);
  useEffect(() => { if (cvBuilderEntrySource) sessionSet('adin-session-entry-source', cvBuilderEntrySource); else sessionRemove('adin-session-entry-source'); }, [cvBuilderEntrySource]);
  useEffect(() => { if (coverLetterEntrySource) sessionSet('adin-session-cl-entry-source', coverLetterEntrySource); else sessionRemove('adin-session-cl-entry-source'); }, [coverLetterEntrySource]);

  const startOnboarding = useCallback(() => { setCurrentPage('workspace'); setActive('AI Chat'); navigateToPath('/'); }, []);

  const getPageKey = useCallback((): string => {
    if (currentPage === 'workspace') return 'home';
    if (currentPage === 'my-documents') return 'my-documents';
    if (currentPage === 'templates') return 'templates';
    if (currentPage === 'cover-templates') return 'cover-templates';
    if (currentPage === 'founder') return 'founder';
    if (currentPage === 'login') return 'login';
    if (currentPage === 'signup') return 'signup';
    if (currentPage === 'blog') return PAGE_KEY_BLOG;
    if (currentPage === 'blog-post') return PAGE_KEY_BLOG;
    if (currentPage === 'tool-landing') return active === 'Free Cover Letter Generator' ? 'free-cover-letter-generator' : 'free-cv-builder';
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
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) { }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOnboardingComplete = async (profile: { name: string; userId: string }) => {
    safeSetItem("adin_user_name", profile.name);
    safeSetItem("adin-user-id", profile.userId);
    safeRemoveItem(GUEST_SESSION_STORAGE_KEY);   // Onboarding sirf Supabase login ke baad chalta hai — asli account, guest nahi
    safeSetItem("adin-onboarding-completed", "true");
    setIsGuest(false);
    setIsOnboardingComplete(true);
    setUserName(profile.name);
  };

  const handleLogoutClick = useCallback(() => { setShowLogoutWarning(true); }, []);
  const handleClearCacheClick = useCallback(() => { setShowClearCache(true); }, []);

  const handleConfirmClearCache = () => {
    setShowClearCache(false);
    const PRESERVE_KEYS = ['adin-user-id', 'adin_user_name', 'adin-onboarding-completed', 'adin-guest-session', 'adin-has-seen-landing', 'adin-pin-education-shown', 'adin-sync-queue', 'adin-backup-reminder-shown', AVATAR_URL_STORAGE_KEY];
    const REMOVE_PREFIXES = ['adin_cv_document_', 'adin_cv_documents_index_', 'adin_cover_letter_document_', 'adin_cover_letter_documents_index_', 'adin_cv_builder_data_'];
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || PRESERVE_KEYS.includes(key)) continue;
        if (key === 'cover_letter_data' || REMOVE_PREFIXES.some((prefix) => key.startsWith(prefix))) keysToRemove.push(key);
      }
      keysToRemove.forEach((key) => safeRemoveItem(key));
    } catch (e) { console.error('[App] Clear cache failed:', e); }
    sessionRemove('adin-session-page'); sessionRemove('adin-session-active'); sessionRemove('adin-session-cv-doc'); sessionRemove('adin-session-cl-doc'); sessionRemove('adin-session-template'); sessionRemove('adin-session-cover-template'); sessionRemove('adin-session-entry-source'); sessionRemove('adin-session-cl-entry-source');
    try { indexedDB.deleteDatabase('adin_cv_images'); } catch (e) { console.error('[App] IndexedDB delete failed:', e); }
    toast.success('Local cache cleared — your data is safe in the cloud');
    setTimeout(() => window.location.reload(), 900);
  };

  const handleGuestLogout = () => {
    setShowLogoutWarning(false);
    isManualLogoutRef.current = true;
    signOutPendingRef.current = true;
    setSessionRecoveryBlocked(true);
    void forceLocalSignOut().finally(() => { signOutPendingRef.current = false; });
    safeSetItem("adin-just-signed-out", "1");
    safeRemoveItem("adin-guest-session"); safeRemoveItem("adin_user_name"); safeRemoveItem("adin-onboarding-completed"); safeRemoveItem("adin-guest-user-id"); safeRemoveItem("adin-user-id"); safeRemoveItem(AVATAR_URL_STORAGE_KEY); setGlobalAvatarUrl(null); safeRemoveItem('adin-has-seen-landing'); safeRemoveItem('adin-pin-education-shown'); safeRemoveItem('adin-backup-reminder-shown');
    safeRemoveItem('cover_letter_data'); safeRemoveItem('adin-selected-cover-template');
    try {
      const draftKeys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i);
        if (k && (k.startsWith('cover_letter_data_') || k.startsWith('adin_cv_builder_data_'))) draftKeys.push(k);
      }
      draftKeys.forEach((k) => safeRemoveItem(k));
    } catch (e) { console.error('[App] Logout draft cleanup failed:', e); }
    resetPopupFlags();
    setActiveDocumentId(null); setActiveCoverLetterId(null); setSelectedTemplateId(null); setSelectedCoverTemplateId(null); setCvBuilderEntrySource(null); setCoverLetterEntrySource(null); setCoverLetterKey(prev => prev + 1);
    sessionRemove('adin-session-page'); sessionRemove('adin-session-active'); sessionRemove('adin-session-cv-doc'); sessionRemove('adin-session-cl-doc'); sessionRemove('adin-session-template'); sessionRemove('adin-session-cover-template'); sessionRemove('adin-session-entry-source'); sessionRemove('adin-session-cl-entry-source');
    syncService.clearQueue(); setIsGuest(false); setIsOnboardingComplete(false); setUserName("User"); setUserEmail(''); setShowProfilePage(false); setShowLanding(true); toast.success("Logged out successfully");
  };

  const handleChangePassword = async () => {
    if (!userEmail) { toast.error('No email found for this account.'); return; }
    try {
      const captchaToken = await requestCaptchaToken();
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo: `${window.location.origin}/reset-password`, captchaToken });
      if (error) throw error;
      toast.success('Password reset link sent to your email!');
    } catch (err: any) { toast.error(err.message || 'Failed to send reset link.'); }
  };

  const handleDeleteAccountConfirm = () => {
    setShowDeleteAccount(false);
    isManualLogoutRef.current = true;
    signOutPendingRef.current = true;
    setSessionRecoveryBlocked(true);
    void forceLocalSignOut().finally(() => { signOutPendingRef.current = false; });
    safeSetItem("adin-just-signed-out", "1");
    safeRemoveItem("adin-guest-session"); safeRemoveItem("adin_user_name"); safeRemoveItem("adin-onboarding-completed"); safeRemoveItem("adin-guest-user-id"); safeRemoveItem("adin-user-id"); safeRemoveItem(AVATAR_URL_STORAGE_KEY); setGlobalAvatarUrl(null); safeRemoveItem("adin-has-seen-landing");
    resetPopupFlags(); setIsGuest(false); setIsOnboardingComplete(false); setUserName('User'); setUserEmail(''); setShowProfilePage(false); setShowLanding(true);
    setTimeout(() => { window.location.href = '/'; window.location.reload(); }, 500);
  };

  const handleLandingComplete = () => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); };
  const goToAuthPage = useCallback((mode: 'signin' | 'signup', replace = false) => {
    safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage(mode === 'signin' ? 'login' : 'signup'); setActive(mode === 'signin' ? 'Sign In' : 'Sign Up'); navigateToPath(mode === 'signin' ? '/login' : '/signup', replace);
  }, []);

  const handleLandingGetStarted = useCallback(() => {
    if (isOnboardingComplete) { handleLandingComplete(); return; }
    goToAuthPage('signup');
  }, [isOnboardingComplete, goToAuthPage]);

  const handleLandingLogin = useCallback(() => goToAuthPage('signin'), [goToAuthPage]);
  const handleLandingSignup = useCallback(() => goToAuthPage('signup'), [goToAuthPage]);

  useEffect(() => {
    if (isOnboardingComplete && (currentPage === 'login' || currentPage === 'signup')) { setCurrentPage('workspace'); setActive('AI Chat'); navigateToPath('/', true); }
  }, [isOnboardingComplete, currentPage]);

  useEffect(() => {
    const pagePath = window.location.pathname + window.location.hash;
    trackPageView(pagePath);
  }, [active, currentPage]);

  const getLastCVDocument = useCallback(() => {
    try {
      const key = `adin_cv_documents_index_${userId}`; const raw = safeGetItem(key);
      if (!raw) return null; const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return null;
      return [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    } catch { return null; }
  }, [userId]);

  const getLastCoverLetterDocument = useCallback(() => {
    try {
      const key = `adin_cover_letter_documents_index_${userId}`; const raw = safeGetItem(key);
      if (!raw) return null; const list = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) return null;
      return [...list].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    } catch { return null; }
  }, [userId]);

  const handleWorkspaceNavigate = useCallback((page: string) => {
    if (page === 'cv-builder') { setActiveDocumentId(null); setActiveCoverLetterId(null); setCvBuilderEntrySource('template-gallery'); setSelectedTemplateId(null); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); }
    else if (page === 'cover-letter') { setActiveDocumentId(null); setActiveCoverLetterId(null); setCoverLetterEntrySource('template-gallery'); setSelectedCoverTemplateId(null); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); }
    else if (page === 'founder') { setCurrentPage('founder'); setActive('Founder'); navigateToPath('/founder'); }
    else if (page === 'my-documents') { setActiveDocumentId(null); setActiveCoverLetterId(null); setCvBuilderEntrySource(null); setCoverLetterEntrySource(null); setCurrentPage('my-documents'); setActive('My Documents'); navigateToPath('/my-documents'); }
  }, []);

  const handleTemplateSelect = useCallback(async (templateId: string) => {
    if (!isOnboardingComplete || !userId) {
      // ✅ Login se pehle bhi chuna hua template yaad rakho (sessionStorage mein save hota hai) — login ke baad editor wahi template kholega, "Modern" default nahi
      setSelectedTemplateId(templateId);
      setCvBuilderEntrySource('template-gallery');
      setCurrentPage('app'); setActive('CV Builder'); navigateToPath('/cv-builder');
      return;
    }
    const shouldApplyToExisting = !!activeDocumentId;
    if (shouldApplyToExisting) { setSelectedTemplateId(templateId); if (!cvBuilderEntrySource) setCvBuilderEntrySource('template-gallery'); setCurrentPage('app'); setActive('CV Builder'); navigateToPath('/cv-builder'); return; }
    try {
      const meta = await localStorageDocumentService.createEmpty(userId);
      setActiveDocumentId(meta.id); setSelectedTemplateId(templateId); setCvBuilderEntrySource('template-gallery'); setCurrentPage('app'); setActive('CV Builder'); navigateToPath('/cv-builder');
    } catch (e: any) { console.error('❌ Failed to create document from template:', e); toast.error('Failed to create document'); }
  }, [userId, isOnboardingComplete, cvBuilderEntrySource, activeDocumentId]);

  const handleCoverTemplateSelect = useCallback(async (templateId: string) => {
    if (!isOnboardingComplete || !userId) {
      // ✅ Cover letter ka chuna hua template bhi login se pehle yaad rakho
      setSelectedCoverTemplateId(templateId);
      setCoverLetterEntrySource('template-gallery');
      setCurrentPage('app'); setActive('Cover Letter'); navigateToPath('/cover-letter');
      return;
    }
    const shouldApplyToExisting = !!activeCoverLetterId;
    if (shouldApplyToExisting) { setSelectedCoverTemplateId(templateId); if (!coverLetterEntrySource) setCoverLetterEntrySource('template-gallery'); setCurrentPage('app'); setActive('Cover Letter'); navigateToPath('/cover-letter'); return; }
    try {
      const { localStorageCoverLetterService } = await import('./components/cover-letter/services/coverLetterService');
      const meta = await localStorageCoverLetterService.createEmpty(userId);
      setActiveCoverLetterId(meta.id); setSelectedCoverTemplateId(templateId); setCoverLetterEntrySource('template-gallery'); setCurrentPage('app'); setActive('Cover Letter'); navigateToPath('/cover-letter'); setCoverLetterKey(prev => prev + 1);
    } catch (e: any) { console.error('❌ Failed to create cover letter from template:', e); toast.error('Failed to create cover letter'); }
  }, [userId, isOnboardingComplete, coverLetterEntrySource, activeCoverLetterId]);

  const navigateToWorkspace = useCallback(() => {
    setCurrentPage('workspace'); setActiveDocumentId(null); setActiveCoverLetterId(null); setCvBuilderEntrySource(null); setCoverLetterEntrySource(null); setActive('AI Chat'); navigateToPath('/');
  }, []);

  const navigateBackFromTemplates = useCallback(() => {
    setActiveDocumentId(null); setActiveCoverLetterId(null); setCvBuilderEntrySource(null); setCoverLetterEntrySource(null);
    if (!isOnboardingComplete) { setCurrentPage('workspace'); setActive('AI Chat'); setShowLanding(true); navigateToPath('/'); return; }
    setCurrentPage('my-documents'); setActive('My Documents'); navigateToPath('/my-documents');
  }, [isOnboardingComplete]);

  const navigateToMyDocuments = useCallback(() => {
    setActiveDocumentId(null); setActiveCoverLetterId(null); setCvBuilderEntrySource(null); setCoverLetterEntrySource(null); setCurrentPage('my-documents'); setActive('My Documents'); navigateToPath('/my-documents');
  }, []);

  const navigateToBlog = useCallback(() => { setCurrentPage('blog'); setActive(ACTIVE_BLOG); navigateToPath(BLOG_ROUTE_PATH); }, []);
  const navigateToBlogPost = useCallback((slug: string) => { setActiveBlogSlug(slug); setCurrentPage('blog-post'); setActive(ACTIVE_BLOG); navigateToPath(`${BLOG_POST_ROUTE_PREFIX}${slug}`); }, []);

  const handleGlobalNavigate = useCallback((route: AppRoute) => {
    switch (route) {
      case 'home': navigateToWorkspace(); break;
      case 'documents': navigateToMyDocuments(); break;
      case 'templates': setSelectedTemplateId(null); setCvBuilderEntrySource(null); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); break;
      case 'cv-builder': {
        const lastCV = getLastCVDocument();
        if (lastCV?.id) { setSelectedTemplateId(null); setActiveDocumentId(lastCV.id); setCvBuilderEntrySource('sidebar'); setCurrentPage('app'); setActive('CV Builder'); navigateToPath('/cv-builder'); }
        else { setSelectedTemplateId(null); setCvBuilderEntrySource(null); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); }
        break;
      }
      case 'cover-templates': setSelectedCoverTemplateId(null); setCoverLetterEntrySource(null); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); break;
      case 'cover-letter': {
        const lastCL = getLastCoverLetterDocument();
        if (lastCL?.id) { setSelectedCoverTemplateId(null); setActiveCoverLetterId(lastCL.id); setCoverLetterEntrySource('sidebar'); setCurrentPage('app'); setActive('Cover Letter'); navigateToPath('/cover-letter'); setCoverLetterKey(prev => prev + 1); }
        else { setSelectedCoverTemplateId(null); setCoverLetterEntrySource(null); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); }
        break;
      }
      case 'blog': navigateToBlog(); break;
      default: break;
    }
  }, [navigateToWorkspace, navigateToMyDocuments, navigateToBlog, getLastCVDocument, getLastCoverLetterDocument]);

  const handleCreateNewCV = useCallback(() => {
    sessionRemove('adin-session-cv-doc'); sessionRemove('adin-session-template'); sessionRemove('adin-session-entry-source');
    setActiveDocumentId(null); setActiveCoverLetterId(null); setSelectedTemplateId(null); setCvBuilderEntrySource('template-gallery'); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates');
  }, []);

  const handleCreateNewCoverLetter = useCallback(() => {
    sessionRemove('adin-session-cl-doc'); sessionRemove('adin-session-cover-template'); sessionRemove('adin-session-cl-entry-source');
    setActiveCoverLetterId(null); setActiveDocumentId(null); setSelectedCoverTemplateId(null); setCoverLetterEntrySource('template-gallery'); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); setCoverLetterKey(prev => prev + 1);
  }, []);

  const handleEditDocument = useCallback((documentId: string) => {
    setActiveDocumentId(documentId); setSelectedTemplateId(null); setCvBuilderEntrySource('documents'); setCurrentPage('app'); setActive('CV Builder'); navigateToPath('/cv-builder');
  }, []);

  const handleEditCoverLetter = useCallback((documentId: string) => {
    setActiveCoverLetterId(documentId); setSelectedCoverTemplateId(null); setCoverLetterEntrySource('documents'); setCurrentPage('app'); setActive('Cover Letter'); navigateToPath('/cover-letter'); setCoverLetterKey(prev => prev + 1);
  }, []);

  const handleBackFromCVBuilder = useCallback(() => {
    setSelectedTemplateId(null);
    if (cvBuilderEntrySource === 'documents' || cvBuilderEntrySource === 'sidebar') { setActiveDocumentId(null); setActiveCoverLetterId(null); setCurrentPage('my-documents'); setActive('My Documents'); navigateToPath('/my-documents'); }
    else { setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); }
    setCvBuilderEntrySource(null);
  }, [cvBuilderEntrySource]);

  const handleBackFromCoverLetter = useCallback(() => {
    setSelectedCoverTemplateId(null);
    if (coverLetterEntrySource === 'documents' || coverLetterEntrySource === 'sidebar') { setActiveDocumentId(null); setActiveCoverLetterId(null); setCurrentPage('my-documents'); setActive('My Documents'); navigateToPath('/my-documents'); }
    else { setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); }
    setCoverLetterEntrySource(null);
  }, [coverLetterEntrySource]);

  const handleBackFromLegal = useCallback(() => {
    const cameFromLanding = sessionGet('adin-legal-from-landing') === 'true'; sessionRemove('adin-legal-from-landing');
    if (cameFromLanding) { setCurrentPage('workspace'); setActive('AI Chat'); setShowLanding(true); navigateToPath('/'); return; }
    if (typeof window !== 'undefined' && window.history.length > 1) { window.history.back(); return; }
    setCurrentPage('legal'); setActive('Contact'); navigateToPath('/contact');
  }, []);

  const isOnboardingCompleteRef = useRef(isOnboardingComplete);
  isOnboardingCompleteRef.current = isOnboardingComplete;

  useEffect(() => {
    const handleRouteChange = () => {
      const pathRoute = getPathRoute();
      if (pathRoute) {
        if (pathRoute.page === 'blog-post') setActiveBlogSlug(getBlogSlugFromPath());
        setCurrentPage(pathRoute.page); setActive(pathRoute.active);
        if (pathRoute.page === 'login' || pathRoute.page === 'signup') setShowLanding(false);
        if (pathRoute.page === 'workspace' && !isOnboardingCompleteRef.current) setShowLanding(true);
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
          setCurrentPage('workspace'); setActive('AI Chat');
          if (!isOnboardingCompleteRef.current) setShowLanding(true);
        }
      }
    };
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
    return () => { window.removeEventListener("popstate", handleRouteChange); window.removeEventListener("hashchange", handleRouteChange); };
  }, []);

  useEffect(() => {
    const routeMap: Record<string, string> = { 'workspace': '/', 'my-documents': '/my-documents', 'templates': '/templates', 'cover-templates': '/cover-templates', 'founder': '/founder', 'blog': BLOG_ROUTE_PATH, 'login': '/login', 'signup': '/signup' };
    let targetPath = routeMap[currentPage] || '/';
    if (currentPage === 'blog-post') targetPath = activeBlogSlug ? `${BLOG_POST_ROUTE_PREFIX}${activeBlogSlug}` : BLOG_ROUTE_PATH;
    if (currentPage === 'app') targetPath = active === 'CV Builder' ? '/cv-builder' : '/cover-letter';
    else if (currentPage === 'legal') {
      if (active === 'Privacy Policy') targetPath = '/privacy-policy';
      else if (active === 'Terms of Service') targetPath = '/terms-of-service';
      else if (active === 'Contact') targetPath = '/contact';
    }
    if (currentPage === 'tool-landing') targetPath = active === 'Free Cover Letter Generator' ? '/free-cover-letter-generator' : '/free-cv-builder';
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath !== targetPath) window.history.replaceState(window.history.state ?? {}, '', targetPath);
  }, [currentPage, active, activeBlogSlug]);

  const sortChats = useCallback((chats: ChatType[]) => [...chats].sort((a, b) => {
    if (a.pinned === b.pinned) return b.id - a.id;
    return a.pinned ? -1 : 1;
  }), []);

  useEffect(() => {
    if (loaded.current) return; loaded.current = true;
    try {
      const savedHistory = safeGetItem("adin-history"); const savedMessages = safeGetItem("adin-messages"); const savedCurrent = safeGetItem("adin-current-chat"); const savedWeb = safeGetItem("adin-web-enabled");
      let historyData = savedHistory ? JSON.parse(savedHistory) : []; const messagesData = savedMessages ? JSON.parse(savedMessages) : {}; const currentData = savedCurrent ? JSON.parse(savedCurrent) : null;
      historyData = sortChats(historyData);
      setChatHistory(historyData); setChatMessages(messagesData); setCurrentChatId(currentData); setAiMemory(loadMemory());
      if (savedWeb !== null) setWebEnabled(JSON.parse(savedWeb));
      if (currentData && messagesData[currentData]) setMessages(messagesData[currentData]);
    } catch (err) {}
  }, [sortChats]);

  useEffect(() => { if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);
  useEffect(() => { saveMemory(aiMemory); }, [aiMemory]);

  const sendMessage = useCallback(async (retry?: string) => {
    if (isSendingRef.current) return;
    const finalInput = retry || input;
    if (!finalInput.trim() && pendingFiles.length === 0) return;
    isSendingRef.current = true; safeRemoveItem("adin-draft-input");
    let activeId = currentChatId;
    if (!activeId) {
      activeId = Date.now();
      const newChat = { id: activeId, title: finalInput.slice(0, 25) || "New Chat", createdAt: Date.now() };
      setChatHistory(prev => sortChats([newChat, ...prev])); setCurrentChatId(activeId);
    }
    let fullMessage = finalInput; const filesToSend = [...pendingFiles];
    if (filesToSend.length > 0) filesToSend.forEach(file => { fullMessage += `\n\nFile: ${file.name}\nContent:\n${file.content}`; });
    setPendingFiles([]); fileUploadRef.current?.clearFile(); setInput("");
    const userMsg: MessageType = { role: "user", text: fullMessage, files: filesToSend };
    const updated = [...messages, userMsg]; setMessages(updated); setLoading(true); setChatMessages(prev => ({ ...prev, [activeId!]: updated }));
    try {
      const res = await sendToAI(updated, aiMemory, webEnabled, userId); const data = await res.json(); const aiText = data.choices?.[0]?.message?.content || "No response";
      const final = [...updated, { role: "ai", text: aiText }]; setMessages(final); setChatMessages(prev => ({ ...prev, [activeId!]: final }));
    } catch (err) { toast.error("Connection Error"); }
    finally { setLoading(false); isSendingRef.current = false; }
  }, [input, pendingFiles, currentChatId, messages, aiMemory, webEnabled, userId, sortChats]);

  const pageKey = getPageKey();
  const seoConfig = getSEOConfig(pageKey);

  const currentRoute: AppRoute = (() => {
    if (currentPage === 'workspace') return 'home'; if (currentPage === 'my-documents') return 'documents'; if (currentPage === 'templates') return 'templates'; if (currentPage === 'cover-templates') return 'cover-templates';
    if (currentPage === 'app' && active === 'CV Builder') return 'cv-builder'; if (currentPage === 'app' && active === 'Cover Letter') return 'cover-letter'; return 'home';
  })();

  const isBuilderPage = currentPage === 'app' && (active === 'CV Builder' || active === 'Cover Letter');
  const isLegalPage = currentPage === 'legal' || currentPage === 'founder';

  const handleLandingBuildCV = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); }, []);
  const handleLandingWriteCoverLetter = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); }, []);
  const handleLandingViewCVTemplates = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('templates'); setActive('CV Templates'); navigateToPath('/templates'); }, []);
  const handleLandingViewCoverTemplates = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('cover-templates'); setActive('Cover Templates'); navigateToPath('/cover-templates'); }, []);
  const handleLandingViewBlog = useCallback(() => { safeSetItem(LANDING_SEEN_STORAGE_KEY, 'true'); setShowLanding(false); navigateToBlog(); }, [navigateToBlog]);
  const handleLandingFounder = useCallback(() => { sessionSet('adin-legal-from-landing', 'true'); safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('founder'); setActive('Founder'); navigateToPath('/founder'); }, []);
  const handleLandingPrivacy = useCallback(() => { sessionSet('adin-legal-from-landing', 'true'); safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('legal'); setActive('Privacy Policy'); navigateToPath('/privacy-policy'); }, []);
  const handleLandingTerms = useCallback(() => { sessionSet('adin-legal-from-landing', 'true'); safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('legal'); setActive('Terms of Service'); navigateToPath('/terms-of-service'); }, []);
  const handleLandingContact = useCallback(() => { sessionSet('adin-legal-from-landing', 'true'); safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('legal'); setActive('Contact'); navigateToPath('/contact'); }, []);
  const handleLandingFreeCVBuilder = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('tool-landing'); setActive('Free CV Builder'); navigateToPath('/free-cv-builder'); }, []);
  const handleLandingFreeCoverLetter = useCallback(() => { safeSetItem('adin-has-seen-landing', 'true'); setShowLanding(false); setCurrentPage('tool-landing'); setActive('Free Cover Letter Generator'); navigateToPath('/free-cover-letter-generator'); }, []);
  const handleBlogBackToLanding = useCallback(() => { navigateToWorkspace(); setShowLanding(true); }, [navigateToWorkspace]);
  const handleOnboardingBackToLanding = useCallback(() => { navigateToWorkspace(); setShowLanding(true); }, [navigateToWorkspace]);

  useEffect(() => {
    const onGoLanding = (e: Event) => { e.preventDefault(); navigateToWorkspace(); setShowLanding(true); };
    window.addEventListener('adin:go-landing', onGoLanding);
    return () => window.removeEventListener('adin:go-landing', onGoLanding);
  }, [navigateToWorkspace]);

  if (isPasswordRecovery || window.location.pathname === '/reset-password') return <Suspense fallback={<LoadingScreen />}><ResetPassword /></Suspense>;

  if (isAuthResolving) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <img src="/icon-1024x1024.png" alt="Adin AI" className="w-16 h-16 rounded-2xl shadow-lg shadow-purple-600/20" />
        <div className="w-7 h-7 rounded-full border-[3px] border-purple-200 border-t-purple-600 animate-spin" aria-hidden="true" />
        <p className="text-sm text-slate-500 font-medium">Signing you in…</p>
      </div>
    );
  }

  if (showLanding) {
    return (
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} ogType="website" />
        <style>{`
          html, body { height: auto !important; min-height: 100% !important; max-height: none !important; overflow-y: auto !important; overflow-x: hidden !important; background: #f1f5f9; color: #0f172a; }
          body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * { height: auto !important; max-height: none !important; overflow-y: visible !important; overflow-x: visible !important; }
          ${buildScrollbarCss(false)}
        `}</style>
        <LandingPage onGetStarted={handleLandingGetStarted} isLoggedIn={isOnboardingComplete} onOpenLogin={handleLandingLogin} onOpenSignup={handleLandingSignup} onBuildCV={handleLandingBuildCV} onWriteCoverLetter={handleLandingWriteCoverLetter} onViewCVTemplates={handleLandingViewCVTemplates} onViewCoverTemplates={handleLandingViewCoverTemplates} onOpenBlog={handleLandingViewBlog} onOpenFounder={handleLandingFounder} onOpenSidebar={undefined} onOpenPrivacy={handleLandingPrivacy} onOpenTerms={handleLandingTerms} onOpenContact={handleLandingContact} onOpenFreeCVBuilder={handleLandingFreeCVBuilder} onOpenFreeCoverLetter={handleLandingFreeCoverLetter} />
      </>
    );
  }

  if (isLegalPage) {
    return (
      <NavigationProvider onNavigate={handleGlobalNavigate} currentRoute={currentRoute}>
        <>
          {currentPage !== 'founder' && <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} ogType="website" />}
          <AdinToaster />
          <div className="w-full min-h-screen flex flex-col bg-slate-100">
            <Suspense fallback={<LoadingScreen />}>
              {currentPage === 'founder' ? <Founder onBack={handleBackFromLegal} /> : (
                <>{active === "Privacy Policy" && <PrivacyPolicy onBack={handleBackFromLegal} />}{active === "Terms of Service" && <TermsOfService onBack={handleBackFromLegal} />}{active === "Contact" && <Contact onBack={handleBackFromLegal} />}</>
              )}
            </Suspense>
          </div>
        </>
      </NavigationProvider>
    );
  }

  if (currentPage === 'blog') {
    return (
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} />
        <style>{buildScrollbarCss(true)}</style>
        <AdinToaster />
        <Suspense fallback={<LoadingScreen />}><Blog onOpenArticle={navigateToBlogPost} onBackToLanding={handleBlogBackToLanding} /></Suspense>
      </>
    );
  }

  if (currentPage === 'blog-post' && activeBlogSlug) {
    return (
      <>
        <style>{buildScrollbarCss(true)}</style>
        <AdinToaster />
        <Suspense fallback={<LoadingScreen />}><BlogPost slug={activeBlogSlug} onBackToBlog={navigateToBlog} onBuildCV={handleLandingBuildCV} onWriteCoverLetter={handleLandingWriteCoverLetter} /></Suspense>
      </>
    );
  }

  if (currentPage === 'tool-landing') {
    const toolContent = active === 'Free Cover Letter Generator' ? TOOL_LANDING_CONTENT['free-cover-letter-generator'] : TOOL_LANDING_CONTENT['free-cv-builder'];
    return (
      <>
        <style>{buildScrollbarCss(true)}</style>
        <AdinToaster />
        <Suspense fallback={<LoadingScreen />}>
          <ToolLandingPage content={toolContent} onStart={toolContent.ctaTarget === 'cover-letter' ? handleLandingWriteCoverLetter : handleLandingBuildCV} onBack={handleBlogBackToLanding} />
        </Suspense>
      </>
    );
  }

  const isPublicPageForSEO = PUBLIC_PAGES_FOR_SEO.includes(currentPage);

  if ((currentPage === 'login' || currentPage === 'signup') && !isOnboardingComplete) {
    return (
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} ogType="website" />
        <AuthScreen mode={currentPage === 'login' ? 'signin' : 'signup'} onModeChange={(next) => goToAuthPage(next, true)} onSuccess={async () => {
            const { authService } = await import('./services/sync/authService');
            const user = await authService.getUser();
            if (user) {
              await handleOnboardingComplete({ name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', userId: user.id });
              setShowLanding(false); setCurrentPage('workspace'); setActive('AI Chat'); navigateToPath('/');
            }
          }} onBack={handleOnboardingBackToLanding} />
      </>
    );
  }

  if (!isOnboardingComplete && !isPublicPageForSEO) {
    return (
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} ogType="website" />
        <Onboarding onComplete={handleOnboardingComplete} onBack={handleOnboardingBackToLanding} />
      </>
    );
  }

  return (
    <NavigationProvider onNavigate={handleGlobalNavigate} currentRoute={currentRoute}>
      <>
        <SEOHead title={seoConfig.title} description={seoConfig.description} keywords={seoConfig.keywords} canonicalUrl={seoConfig.canonicalUrl} noIndex={seoConfig.noIndex} noFollow={seoConfig.noFollow} ogType="website" />
        <AdinToaster />

        <div className="app-guest-root w-screen min-h-screen flex bg-slate-100 text-slate-900">
          {currentPage === 'workspace' ? (
            <div className={`w-full min-h-screen flex flex-col ${PAGE_CHROME['workspace'].bg}`}>
              <FloatingMenuButton onOpenSidebar={openSidebar} />
              <Suspense fallback={<LoadingScreen />}><WorkspacePage onNavigate={handleWorkspaceNavigate} userId={userId} onEditDocument={handleEditDocument} onEditCoverLetter={handleEditCoverLetter} /></Suspense>
            </div>
          ) : currentPage === 'my-documents' ? (
            <div className={`w-full h-screen flex flex-col overflow-hidden ${PAGE_CHROME['my-documents'].bg}`} style={{ height: '100dvh' }}>
              <AppTopBar title={PAGE_CHROME['my-documents'].title} subtitle={PAGE_CHROME['my-documents'].subtitle} onOpenSidebar={openSidebar} />
              <div className="flex-1 min-h-0 overflow-hidden"><Suspense fallback={<LoadingScreen />}><MyDocuments userId={userId} onCreateNew={handleCreateNewCV} onEditDocument={handleEditDocument} onCreateCoverLetter={handleCreateNewCoverLetter} onEditCoverLetter={handleEditCoverLetter} /></Suspense></div>
            </div>
          ) : currentPage === 'templates' ? (
            <div className={`w-full h-screen flex flex-col overflow-hidden ${PAGE_CHROME['templates'].bg}`} style={{ height: '100dvh' }}>
              <AppTopBar title={PAGE_CHROME['templates'].title} subtitle={PAGE_CHROME['templates'].subtitle} onOpenSidebar={openSidebar} />
              <div className="flex-1 min-h-0 overflow-hidden"><Suspense fallback={<LoadingScreen />}><CVTemplatesPage onBackToHome={navigateBackFromTemplates} onTemplateSelect={handleTemplateSelect} /></Suspense></div>
            </div>
          ) : currentPage === 'cover-templates' ? (
            <div className={`w-full h-screen flex flex-col overflow-hidden ${PAGE_CHROME['cover-templates'].bg}`} style={{ height: '100dvh' }}>
              <AppTopBar title={PAGE_CHROME['cover-templates'].title} subtitle={PAGE_CHROME['cover-templates'].subtitle} onOpenSidebar={openSidebar} />
              <div className="flex-1 min-h-0 overflow-hidden"><Suspense fallback={<LoadingScreen />}><CoverTemplatesPage onBackToHome={navigateBackFromTemplates} onTemplateSelect={handleCoverTemplateSelect} /></Suspense></div>
            </div>
          ) : currentPage === 'app' ? (
            <div className="w-screen h-screen flex flex-col overflow-hidden" style={{ height: '100dvh' }}>
              <div className="flex-1 min-h-0">
                {active === "CV Builder" ? (
                  <Suspense fallback={<LoadingScreen />}><CVBuilder userId={userId} onBackToHome={handleBackFromCVBuilder} onBackToDocuments={handleBackFromCVBuilder} initialTemplateId={selectedTemplateId || undefined} documentId={activeDocumentId || undefined} onDocumentCreated={(docId) => setActiveDocumentId(docId)} /></Suspense>
                ) : active === "Cover Letter" ? (
                  <Suspense fallback={<LoadingScreen />}><CoverLetter key={`cover-letter-${coverLetterKey}-${activeCoverLetterId || 'new'}`} userId={userId} onBackToHome={handleBackFromCoverLetter} onBackToDocuments={handleBackFromCoverLetter} initialTemplateId={selectedCoverTemplateId || undefined} documentId={activeCoverLetterId || undefined} onDocumentCreated={(docId) => setActiveCoverLetterId(docId)} onTemplateChange={(template) => { setSelectedCoverTemplateId(template); }} /></Suspense>
                ) : (<div className="flex items-center justify-center h-full text-slate-500"><p>Loading...</p></div>)}
              </div>
            </div>
          ) : (
            <div className={`w-full min-h-screen flex flex-col ${PAGE_CHROME['workspace'].bg}`}>
              <FloatingMenuButton onOpenSidebar={openSidebar} />
              <Suspense fallback={<LoadingScreen />}><WorkspacePage onNavigate={handleWorkspaceNavigate} userId={userId} onEditDocument={handleEditDocument} onEditCoverLetter={handleEditCoverLetter} /></Suspense>
            </div>
          )}

          {isBuilderPage ? (
            <style>{`html, body { height: 100% !important; max-height: 100% !important; overflow: hidden !important; background: #f1f5f9; } body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * { height: 100% !important; max-height: 100% !important; overflow: hidden !important; } .app-guest-root { display: block; width: 100%; height: 100vh; min-height: 100vh; max-height: 100vh; overflow: hidden; }`}</style>
          ) : (
            <style>{`html, body { height: auto !important; min-height: 100% !important; max-height: none !important; overflow-y: auto !important; overflow-x: hidden !important; background: #f1f5f9; color: #0f172a; } body > *:not([data-portal-root]), body > *:not([data-portal-root]) > *, #root, #root > * { height: auto !important; max-height: none !important; overflow-y: visible !important; overflow-x: visible !important; } .app-guest-root { display: block; width: 100%; min-height: 100vh; height: auto; overflow: visible; position: relative; } ${buildScrollbarCss(true)}`}</style>
          )}
        </div>

        <GlobalSidebar isOpen={isSidebarOpen} onClose={closeSidebar} currentPage={currentRoute} userId={userId} userEmail={userEmail} userName={userName} avatarUrl={globalAvatarUrl} onOpenProfile={() => { if (userId) setShowProfilePage(true); else startOnboarding(); }} />
        <ProfilePage isOpen={showProfilePage} onClose={() => setShowProfilePage(false)} userId={userId} userName={userName} userEmail={userEmail} avatarUrl={globalAvatarUrl} onDeleteAccountClick={() => setShowDeleteAccount(true)} onLogoutClick={handleLogoutClick} />
        <LogoutWarningPopup isOpen={showLogoutWarning} onCancel={() => setShowLogoutWarning(false)} onConfirmLogout={handleGuestLogout} />
        <DeleteAccountConfirm isOpen={showDeleteAccount} userId={userId} onConfirm={handleDeleteAccountConfirm} onCancel={() => setShowDeleteAccount(false)} />
        <FeedbackFullScreen isOpen={showGlobalFeedback} onClose={() => { setShowGlobalFeedback(false); markFeedbackShown('global'); }} source="global" />

        {!isBuilderPage && !showProfilePage && (
          <button onClick={() => setShowGlobalFeedback(true)} aria-label="Give feedback" className="fixed bottom-6 right-6 z-[9997] group flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105">
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