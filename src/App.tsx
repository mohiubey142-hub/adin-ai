// App.tsx - Complete updated file with SEO & Lazy Loading + Founder Profile + Legal Pages (No 404)
import { useState, useEffect, useRef, lazy, Suspense, useMemo, useCallback } from "react";
import ReactMarkdown from "react-markdown";
// ❌ Clerk removed - Guest Mode only
import Login from "./Login";
import { Onboarding } from "./components/Onboarding";
import VoiceMic from "./components/VoiceMic";
import SpeakButton from "./components/SpeakButton";
import FileUpload, { FileUploadRef } from "./components/FileUpload";
import { SEOHead } from "./components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "./utils/seo";
import { initializeGA, trackPageView, setUserID } from "./utils/analytics";

// ✅ SEO Page Configs
import { getSEOConfig } from "./utils/seoPages";

// ✅ LAZY LOADING - SEO friendly code splitting
const CVBuilder = lazy(() => import("./components/cv-builder/CVBuilder"));
const CoverLetter = lazy(() => import("./components/cover-letter/CoverLetter"));
const CVTemplatesPage = lazy(() => import("./components/Templates/CVTemplatesPage"));
const CoverTemplatesPage = lazy(() => import("./components/Templates/CoverTemplatesPage"));
const WorkspacePage = lazy(() => import("./components/Workspace").then(m => ({ default: m.WorkspacePage })));
// ✅ Founder Page Lazy Loading
const Founder = lazy(() => import("./pages/Founder"));
// ✅ Legal Pages Lazy Loading
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Contact = lazy(() => import("./pages/Contact"));

import {
  MessageSquare, Search as SearchIcon, Compass, Library as LibraryIcon,
  Globe, FileText, Settings as SettingsIcon, Plus, Pencil, Trash2,
  Copy, Check, Wifi, Pin, ThumbsUp, ThumbsDown, RotateCcw, Edit, Sparkles, User,
  X, Code2, ArrowLeft, Terminal, Database, Cloud, Shield, Braces, Layout, Server, GitBranch, Cpu,
  BookOpen, Bug, Rocket, Target, Briefcase, Mail, LogOut, ChevronDown
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { sendToAI, saveMemoryFromResponse } from "./services/ai";
import { saveMemory, loadMemory } from "./utils/memory";
import { LoadingScreen } from "./components/LoadingScreen";

// Premium Programming Languages - Colors matching your interface (Purple/Violet/Blue theme)
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
  braces: Braces,
  terminal: Terminal,
  code2: Code2,
  server: Server,
  layout: Layout,
  database: Database,
  cloud: Cloud,
  shield: Shield,
  gitbranch: GitBranch,
  cpu: Cpu,
};

function CodingExpert({ userId, onBack }: { userId: string; onBack?: () => void }) {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [webEnabled, setWebEnabled] = useState(true);
  const [activeTool, setActiveTool] = useState("dashboard");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedLevel = localStorage.getItem(`user_level_${userId}`);
    const savedLang = localStorage.getItem(`user_language_${userId}`);
    if (savedLevel) setUserLevel(savedLevel);
    if (savedLang) setSelectedLanguage(savedLang);

    if (!savedLevel) {
      setMessages([{
        role: "ai",
        text: "🌟 **Welcome to Adin Coding Expert!**\n\nI'm your personal coding mentor. Let me help you master any programming language.\n\n**Select your experience level:**"
      }]);
    } else if (!savedLang) {
      setMessages([{
        role: "ai",
        text: `Great! You're a **${savedLevel}** level developer.\n\n**Select a technology to master:**`
      }]);
    } else {
      const lang = programmingLanguages.find(l => l.id === savedLang);
      setMessages([{
        role: "ai",
        text: `**${lang?.name}** expert mentor active.\n\nWhat would you like to learn?\n\n• Core concepts\n• Best practices\n• Build a project\n• Debug code\n• Interview prep`
      }]);
    }
  }, [userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSetLevel = (level: string) => {
    setUserLevel(level);
    localStorage.setItem(`user_level_${userId}`, level);
    setMessages(prev => [...prev,
      { role: "user", text: level },
      { role: "ai", text: `**${level}** level selected.\n\n**Select a technology to master:**` }
    ]);
  };

  const handleSelectLanguage = (langId: string) => {
    setSelectedLanguage(langId);
    localStorage.setItem(`user_language_${userId}`, langId);
    const lang = programmingLanguages.find(l => l.id === langId);
    setMessages(prev => [...prev,
      { role: "user", text: lang?.name || langId },
      { role: "ai", text: `**${lang?.name}** expert mentor active.\n\nWhat would you like to learn?\n\n• Core concepts\n• Best practices\n• Build a project\n• Debug code\n• Interview prep` }
    ]);
    setActiveTool("dashboard");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const context = `User Level: ${userLevel || "beginner"}, Current Language: ${selectedLanguage || "javascript"}`;
      const fullMessage = `${context}\n\nUser: ${userMessage}`;

      const res = await sendToAI(
        [{ role: "user", text: fullMessage }],
        [],
        webEnabled,
        userId
      );
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "How can I help you master coding?";

      setMessages(prev => [...prev, { role: "ai", text: aiText }]);
    } catch (err) {
      console.error(err);
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { name: "Generate Code", prompt: "Generate a complete working example for" },
    { name: "Debug Code", prompt: "Help me debug this code:" },
    { name: "Explain Concept", prompt: "Explain this concept with examples:" },
    { name: "Build Project", prompt: "Help me build a project:" },
    { name: "Interview Prep", prompt: "Give me interview questions for" },
  ];

  const tools = [
    { id: "dashboard", name: "Dashboard", icon: Sparkles },
    { id: "learn", name: "Learn", icon: BookOpen },
    { id: "code", name: "Code", icon: Code2 },
    { id: "debug", name: "Debug", icon: Bug },
    { id: "project", name: "Projects", icon: Rocket },
    { id: "interview", name: "Interview", icon: Target },
  ];

  const handleQuickAction = (prompt: string) => {
    const lang = programmingLanguages.find(l => l.id === selectedLanguage);
    const fullPrompt = `${prompt} ${lang?.name || "programming"}.`;
    setInput(fullPrompt);
    setTimeout(() => sendMessage(), 100);
  };

  const handleReset = () => {
    localStorage.removeItem(`user_level_${userId}`);
    localStorage.removeItem(`user_language_${userId}`);
    setUserLevel(null);
    setSelectedLanguage(null);
    setMessages([]);
    setShowResetConfirm(false);
    toast.success("Reset complete!");
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={22} /> : null;
  };

  // Level Selection UI
  if (!userLevel) {
    return (
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition">
            <ArrowLeft size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-medium text-white">Adin Coding Expert</span>
          </div>
          <button onClick={() => setWebEnabled(!webEnabled)} className={`px-3 py-1.5 rounded-lg text-xs ${webEnabled ? "bg-green-600/20 text-green-400" : "bg-zinc-800 text-gray-400"}`}>
            <Sparkles size={12} className="inline mr-1" /> {webEnabled ? "AI On" : "AI Off"}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Adin Coding Expert
              </h1>
              <p className="text-gray-500 text-sm mt-1">Your Personal Coding Mentor</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => handleSetLevel("beginner")}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Beginner</h3>
                <p className="text-gray-500 text-sm mt-1">No coding experience</p>
              </button>
              <button
                onClick={() => handleSetLevel("intermediate")}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Intermediate</h3>
                <p className="text-gray-500 text-sm mt-1">Know the basics</p>
              </button>
              <button
                onClick={() => handleSetLevel("advanced")}
                className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 text-center"
              >
                <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-lg font-semibold text-white">Advanced</h3>
                <p className="text-gray-500 text-sm mt-1">Experienced developer</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Language Selection UI - Premium 3D Icons
  if (!selectedLanguage) {
    return (
      <div className="flex-1 flex flex-col bg-black overflow-hidden">
        <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
          <button onClick={() => { localStorage.removeItem(`user_level_${userId}`); setUserLevel(null); }} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition">
            <ArrowLeft size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs border border-green-500/30">{userLevel}</span>
          </div>
          <button onClick={() => setWebEnabled(!webEnabled)} className={`px-3 py-1.5 rounded-lg text-xs ${webEnabled ? "bg-green-600/20 text-green-400" : "bg-zinc-800 text-gray-400"}`}>
            <Sparkles size={12} className="inline mr-1" /> {webEnabled ? "AI On" : "AI Off"}
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Choose Your Technology</h2>
            <p className="text-gray-500 text-sm mt-1">Select a language or framework to master</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {programmingLanguages.map(lang => (
              <button
                key={lang.id}
                onClick={() => handleSelectLanguage(lang.id)}
                className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 text-left"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${lang.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <div className="text-white">{getIcon(lang.icon)}</div>
                </div>
                <h3 className="font-semibold text-white text-sm">{lang.name}</h3>
                <p className="text-gray-500 text-xs mt-1">{lang.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentLang = programmingLanguages.find(l => l.id === selectedLanguage);

  // Main Expert UI
  return (
    <div className="flex-1 flex flex-col bg-black overflow-hidden">
      <Toaster position="top-right" />

      <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0">
        <button onClick={() => setShowResetConfirm(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition">
          <ArrowLeft size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Back</span>
        </button>

        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${currentLang?.gradient} flex items-center justify-center shadow-lg`}>
            <div className="text-white text-sm">{getIcon(currentLang?.icon || "")}</div>
          </div>
          <span className="text-sm font-semibold text-white">{currentLang?.name} Expert</span>
          <span className="text-xs text-gray-500 ml-1">{userLevel}</span>
        </div>

        <button onClick={() => setWebEnabled(!webEnabled)} className={`px-3 py-1.5 rounded-lg text-xs ${webEnabled ? "bg-green-600/20 text-green-400" : "bg-zinc-800 text-gray-400"}`}>
          <Sparkles size={12} className="inline mr-1" /> {webEnabled ? "AI On" : "AI Off"}
        </button>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 rounded-xl p-5 max-w-sm w-full mx-4 border border-zinc-800">
            <h3 className="text-base font-semibold text-white mb-2">Reset Progress?</h3>
            <p className="text-gray-400 text-sm mb-5">This will clear your level and language selection.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={handleReset} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">Reset</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="w-[170px] border-r border-zinc-900 overflow-y-auto shrink-0">
          <div className="p-3">
            <div className="text-xs font-medium text-gray-500 mb-2 px-2">Tools</div>
            <div className="space-y-1">
              {tools.map(tool => {
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                      activeTool === tool.id
                        ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-l-2 border-purple-500"
                        : "text-gray-400 hover:bg-zinc-900"
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTool === "dashboard" && (
            <div className="p-3 border-b border-zinc-900 shrink-0">
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.prompt)}
                    className="px-2.5 py-1 rounded-full text-xs bg-white/5 hover:bg-white/10 text-gray-300 transition"
                  >
                    {action.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((msg, idx) => {
              const cleanText = msg.text.replace(/className=/g, 'class=');
              return (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                      : "bg-zinc-900 border border-zinc-800"
                  }`}>
                    <div className="text-sm prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[]}
                        rehypePlugins={[]}
                        components={{
                          code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="bg-black/50 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {cleanText}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-100"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-zinc-900 shrink-0">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Ask about ${currentLang?.name}...`}
                className="flex-1 h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-sm text-white placeholder-gray-500 focus:border-purple-500 outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 disabled:opacity-50 text-white text-sm font-medium hover:scale-105 transition-transform"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type MessageType = { role: string; text: string; files?: { name: string; content: string }[] };
type MemoryType = { id: number; text: string };
type ChatType = { id: number; title: string; pinned?: boolean; createdAt: number };

export default function App() {
  // ✅ Guest session state
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>("User");
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ✅ CRITICAL FIX: Stable userId that persists across page refreshes
  // This solves the localStorage data loss bug
  const userId = useMemo(() => {
    // First, check if we have a stored userId
    const storedUserId = localStorage.getItem('adin-guest-user-id');
    if (storedUserId) {
      console.log('✅ Restored userId from localStorage:', storedUserId);
      return storedUserId;
    }
    
    // If no stored userId, check if we have a session
    const session = localStorage.getItem('adin-guest-session');
    if (session) {
      try {
        const parsed = JSON.parse(session);
        // Create userId from session timestamp for consistency
        if (parsed.guestCreatedAt) {
          const timestamp = new Date(parsed.guestCreatedAt).getTime();
          const newUserId = "guest_" + timestamp.toString(36);
          localStorage.setItem('adin-guest-user-id', newUserId);
          console.log('✅ Created userId from session:', newUserId);
          return newUserId;
        }
      } catch (e) {
        console.error('Failed to parse session:', e);
      }
    }
    
    // Create brand new userId
    const newUserId = "guest_" + Date.now().toString(36);
    localStorage.setItem('adin-guest-user-id', newUserId);
    console.log('✅ Created new userId:', newUserId);
    return newUserId;
  }, []);

  // ✅ Page state - Workspace is default
  const [currentPage, setCurrentPage] = useState<'workspace' | 'app' | 'templates' | 'cover-templates' | 'founder' | 'legal'>('workspace');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedCoverTemplateId, setSelectedCoverTemplateId] = useState<string | null>(null);
  const [active, setActive] = useState(() => {
    const savedTab = localStorage.getItem("adin-active-tab");
    const hash = window.location.hash.slice(1);
    if (hash === "cv-builder") return "CV Builder";
    if (hash === "cover-letter") return "Cover Letter";
    if (hash === "cover-templates") return "Cover Templates";
    if (hash === "ai-chat") return "AI Chat";
    if (hash === "web-search") return "Web Search";
    if (hash === "library") return "Library";
    if (hash === "documents") return "Documents";
    if (hash === "about-me") return "About Me";
    if (hash === "settings") return "Settings";
    if (hash === "founder") return "Founder";
    if (hash === "privacy-policy") return "Privacy Policy";
    if (hash === "terms-of-service") return "Terms of Service";
    if (hash === "contact") return "Contact";
    return savedTab || "AI Chat";
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatType[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<number, MessageType[]>>({});
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
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

  // ✅ SEO Page Key Mapping
  const getPageKey = useCallback((): string => {
    if (currentPage === 'workspace') return 'home';
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
      if (active === 'AI Chat') return 'ai-chat';
      if (active === 'Web Search') return 'web-search';
      if (active === 'Library') return 'library';
      if (active === 'Documents') return 'documents';
      if (active === 'About Me') return 'about-me';
      if (active === 'Settings') return 'settings';
    }
    return 'home';
  }, [active, currentPage]);

  // ✅ Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Get user name from localStorage (no "Guest" wording)
  const getUserName = useCallback((): string => {
    const savedName = localStorage.getItem("adin_user_name");
    return savedName || "User";
  }, []);

  // ✅ Get avatar letter (first letter of name, capital)
  const getAvatarLetter = useCallback((name: string): string => {
    if (!name || name === "User") return "U";
    return name.trim().charAt(0).toUpperCase();
  }, []);

  // ✅ Get avatar color based on name
  const getAvatarColor = useCallback((name: string): string => {
    const colors = [
      "from-purple-500 to-blue-500",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-indigo-500 to-purple-500",
      "from-cyan-500 to-blue-500",
      "from-violet-500 to-fuchsia-500",
      "from-rose-500 to-red-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, []);

  // ✅ Check guest session on mount
  useEffect(() => {
    const guestSession = localStorage.getItem("adin-guest-session");
    const onboardingCompleted = localStorage.getItem("adin-onboarding-completed");
    
    if (guestSession) {
      try {
        const session = JSON.parse(guestSession);
        setIsGuest(true);
        // ✅ Get user name from separate storage
        const savedName = localStorage.getItem("adin_user_name");
        if (savedName) {
          setUserName(savedName);
        } else {
          setUserName("User");
        }
        // ✅ Check if onboarding completed
        if (onboardingCompleted === "true") {
          setIsOnboardingComplete(true);
        }
      } catch (e) {
        console.error("Failed to parse guest session:", e);
      }
    } else {
      // ✅ Check if user name exists without session (edge case)
      const savedName = localStorage.getItem("adin_user_name");
      if (savedName) {
        setIsGuest(true);
        setUserName(savedName);
        if (onboardingCompleted === "true") {
          setIsOnboardingComplete(true);
        }
      }
    }
  }, []);

  // ✅ Handle Onboarding Complete
  const handleOnboardingComplete = (name: string) => {
    // ✅ Save user name to localStorage
    localStorage.setItem("adin_user_name", name);
    
    // ✅ Save guest session
    const guestSession = {
      isGuest: true,
      guestCreatedAt: new Date().toISOString(),
    };
    localStorage.setItem("adin-guest-session", JSON.stringify(guestSession));
    
    // ✅ Mark onboarding as completed
    localStorage.setItem("adin-onboarding-completed", "true");
    
    // ✅ Update state
    setIsGuest(true);
    setIsOnboardingComplete(true);
    setUserName(name);
  };

  // ✅ Guest Logout handler - Clears ALL guest data
  const handleGuestLogout = () => {
    localStorage.removeItem("adin-guest-session");
    localStorage.removeItem("adin_user_name");
    localStorage.removeItem("adin-onboarding-completed");
    localStorage.removeItem("adin-guest-user-id");
    setIsGuest(false);
    setIsOnboardingComplete(false);
    setUserName("User");
    setIsProfileOpen(false);
    toast.success("Logged out successfully");
    // ✅ Redirect to login page
    window.location.href = "/login";
  };

  // ✅ GA: Track page views on page/route change
  useEffect(() => {
    const pagePath = window.location.pathname + window.location.hash;
    trackPageView(pagePath);
  }, [active, currentPage]);

  // ✅ Navigation handler for workspace - Direct navigation to builders or galleries
  const handleWorkspaceNavigate = useCallback((page: string) => {
    if (page === 'cv-builder') {
      setCurrentPage('templates');
      setActive('CV Templates');
      window.location.hash = 'templates';
      localStorage.setItem("adin-current-page", "templates");
    } else if (page === 'cover-letter') {
      setCurrentPage('cover-templates');
      setActive('Cover Templates');
      window.location.hash = 'cover-templates';
      localStorage.setItem("adin-current-page", "cover-templates");
    } else if (page === 'founder') {
      setCurrentPage('founder');
      setActive('Founder');
      window.location.hash = 'founder';
      localStorage.setItem("adin-current-page", "founder");
    }
  }, []);

  // ✅ Handler for CV template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentPage('app');
    setActive('CV Builder');
    localStorage.setItem("adin-active-tab", "CV Builder");
    localStorage.setItem("adin-selected-template", templateId);
    localStorage.setItem("adin-current-page", "app");
    window.location.hash = "cv-builder";
  }, []);

  // ✅ Handler for Cover Letter template selection
  const handleCoverTemplateSelect = useCallback((templateId: string) => {
    setSelectedCoverTemplateId(templateId);
    setCurrentPage('app');
    setActive('Cover Letter');
    localStorage.setItem("adin-active-tab", "Cover Letter");
    localStorage.setItem("adin-selected-cover-template", templateId);
    localStorage.setItem("adin-current-page", "app");
    window.location.hash = "cover-letter";
  }, []);

  // ✅ Navigate back to workspace from templates
  const navigateToWorkspace = useCallback(() => {
    setCurrentPage('workspace');
    window.location.hash = '';
    localStorage.setItem("adin-active-tab", "AI Chat");
    localStorage.setItem("adin-current-page", "workspace");
  }, []);

  // ✅ Navigate back to CV templates from CV builder
  const navigateToTemplates = useCallback(() => {
    setCurrentPage('templates');
    setActive('CV Templates');
    window.location.hash = 'templates';
    localStorage.setItem("adin-current-page", "templates");
  }, []);

  // ✅ Navigate back to Cover Letter templates
  const navigateToCoverTemplates = useCallback(() => {
    setCurrentPage('cover-templates');
    setActive('Cover Templates');
    window.location.hash = 'cover-templates';
    localStorage.setItem("adin-current-page", "cover-templates");
  }, []);

  const sortChats = useCallback((chats: ChatType[]) => [...chats].sort((a,b) => {
    if (a.pinned === b.pinned) return b.id - a.id;
    return a.pinned ? -1 : 1;
  }), []);

  useEffect(() => {
    localStorage.setItem("adin-active-tab", active);
  }, [active]);

  useEffect(() => {
    if (input) localStorage.setItem("adin-draft-input", input);
    else localStorage.removeItem("adin-draft-input");
  }, [input]);

  // ✅ GA: Initialize Google Analytics on app mount
  useEffect(() => {
    initializeGA();

    if (isGuest) {
      setUserID(userId);
    }
  }, [isGuest, userId]);

  // ✅ Load persisted data on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const savedHistory = localStorage.getItem("adin-history");
      const savedMessages = localStorage.getItem("adin-messages");
      const savedCurrent = localStorage.getItem("adin-current-chat");
      const savedWeb = localStorage.getItem("adin-web-enabled");
      const savedLikes = localStorage.getItem("adin-likes");
      const savedDislikes = localStorage.getItem("adin-dislikes");
      const savedDraft = localStorage.getItem("adin-draft-input");
      const savedTemplate = localStorage.getItem("adin-selected-template");
      const savedCoverTemplate = localStorage.getItem("adin-selected-cover-template");
      const savedCurrentPage = localStorage.getItem("adin-current-page");

      let historyData = savedHistory ? JSON.parse(savedHistory) : [];
      const messagesData = savedMessages ? JSON.parse(savedMessages) : {};
      const currentData = savedCurrent ? JSON.parse(savedCurrent) : null;

      // ✅ Restore current page
      if (savedCurrentPage) {
        const page = savedCurrentPage as 'workspace' | 'app' | 'templates' | 'cover-templates' | 'founder' | 'legal';
        setCurrentPage(page);

        if (page === 'workspace') {
          window.location.hash = '';
        } else if (page === 'templates') {
          window.location.hash = 'templates';
        } else if (page === 'cover-templates') {
          window.location.hash = 'cover-templates';
        } else if (page === 'founder') {
          window.location.hash = 'founder';
        } else if (page === 'legal') {
          const savedActiveTab = localStorage.getItem("adin-active-tab");
          if (savedActiveTab === "Privacy Policy") {
            window.location.hash = 'privacy-policy';
          } else if (savedActiveTab === "Terms of Service") {
            window.location.hash = 'terms-of-service';
          } else if (savedActiveTab === "Contact") {
            window.location.hash = 'contact';
          }
        } else if (page === 'app') {
          const savedActiveTab = localStorage.getItem("adin-active-tab");
          if (savedActiveTab === "CV Builder") {
            window.location.hash = 'cv-builder';
          } else if (savedActiveTab === "Cover Letter") {
            window.location.hash = 'cover-letter';
          }
        }
      }

      historyData = sortChats(historyData);
      setChatHistory(historyData);
      setChatMessages(messagesData);
      setCurrentChatId(currentData);
      setAiMemory(loadMemory());
      if (savedWeb !== null) setWebEnabled(JSON.parse(savedWeb));
      if (savedLikes) setLikedMessages(JSON.parse(savedLikes));
      if (savedDislikes) setDislikedMessages(JSON.parse(savedDislikes));
      if (savedDraft) setInput(savedDraft);
      if (savedTemplate) setSelectedTemplateId(savedTemplate);
      if (savedCoverTemplate) setSelectedCoverTemplateId(savedCoverTemplate);
      if (currentData && messagesData[currentData]) setMessages(messagesData[currentData]);
      else setMessages([]);
    } catch (err) { console.log(err); }
  }, [sortChats]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  // ✅ Persist data to localStorage
  useEffect(() => { localStorage.setItem("adin-likes", JSON.stringify(likedMessages)); }, [likedMessages]);
  useEffect(() => { localStorage.setItem("adin-dislikes", JSON.stringify(dislikedMessages)); }, [dislikedMessages]);
  useEffect(() => { localStorage.setItem("adin-history", JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem("adin-messages", JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem("adin-current-chat", JSON.stringify(currentChatId)); }, [currentChatId]);
  useEffect(() => { localStorage.setItem("adin-web-enabled", JSON.stringify(webEnabled)); }, [webEnabled]);
  useEffect(() => { saveMemory(aiMemory); }, [aiMemory]);

  const copyMessage = useCallback((text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    toast.success("Copied");
    setTimeout(() => setCopiedIndex(null), 2000);
  }, []);

  const handleVoiceTranscript = useCallback((text: string, language: string) => {
    if (!text.trim()) return;
    setInput(text);
    setDetectedLanguage(language);
  }, []);

  const handleFileUpload = useCallback((fileName: string, fileContent: string) => {
    setPendingFiles([{ name: fileName, content: fileContent }]);
  }, []);

  const removePendingFile = useCallback(() => {
    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
  }, []);

  const toggleLike = useCallback((i: number, text: string, role: string) => {
    const currentChat = chatHistory.find(chat => chat.id === currentChatId);
    const chatTitle = currentChat?.title || "Chat";

    let favorites = [];
    const saved = localStorage.getItem("adin-favorites");
    if (saved) favorites = JSON.parse(saved);

    const exists = favorites.some((fav: any) => fav.text === text);

    if (!exists) {
      favorites.push({ id: Date.now(), text, role, chatTitle, createdAt: new Date().toISOString() });
      localStorage.setItem("adin-favorites", JSON.stringify(favorites));
      toast.success("Saved to favorites!");
    } else {
      toast.info("Already in favorites");
    }

    setLikedMessages(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
    setDislikedMessages(prev => prev.filter(x=>x!==i));
  }, [chatHistory, currentChatId]);

  const toggleDislike = useCallback((i: number, text: string) => {
    const old = JSON.parse(localStorage.getItem("adin-feedback") || "[]");
    old.push({ type: "dislike", text, createdAt: new Date().toISOString() });
    localStorage.setItem("adin-feedback", JSON.stringify(old));
    setDislikedMessages(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]);
    setLikedMessages(prev => prev.filter(x=>x!==i));
    toast.success("Feedback saved");
  }, []);

  const deleteChat = useCallback((id: number) => {
    const newHistory = chatHistory.filter(c=>c.id!==id);
    const newMsgs = {...chatMessages};
    delete newMsgs[id];
    setChatHistory(sortChats(newHistory));
    setChatMessages(newMsgs);
    if(currentChatId===id){
      setCurrentChatId(null);
      setMessages([]);
    }
    toast.success("Chat deleted");
  }, [chatHistory, chatMessages, currentChatId, sortChats]);

  const pinChat = useCallback((id: number) => {
    const updated = chatHistory.map(c=>c.id===id?{...c, pinned:!c.pinned}:c);
    const sorted = sortChats(updated);
    setChatHistory(sorted);
    localStorage.setItem("adin-history", JSON.stringify(sorted));
  }, [chatHistory, sortChats]);

  const saveRename = useCallback((id: number) => {
    if(!renameValue.trim()) return;
    const updated = chatHistory.map(c=>c.id===id?{...c, title:renameValue}:c);
    const sorted = sortChats(updated);
    setChatHistory(sorted);
    setEditingChatId(null);
    setRenameValue("");
    toast.success("Renamed");
  }, [chatHistory, renameValue, sortChats]);

  const saveEditedMessage = useCallback(async (idx: number) => {
    const updated = [...messages]; 
    updated[idx].text = editText;
    const sliced = updated.slice(0, idx+1);
    setMessages(sliced); 
    setEditingMessage(null); 
    setLoading(true);
    try {
      const res = await sendToAI(sliced, aiMemory, webEnabled, userId);
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "No response";
      const final = [...sliced, { role: "ai", text: aiText }];
      setMessages(final);
      setChatMessages(prev => ({ ...prev, [currentChatId!]: final }));
    } catch (err) { 
      console.log(err); 
      toast.error("Error"); 
    } finally { 
      setLoading(false); 
    }
  }, [messages, editText, aiMemory, webEnabled, userId, currentChatId]);

  const sendMessage = useCallback(async (retry?: string) => {
    if (isSendingRef.current) return;

    const finalInput = retry || input;

    if (!finalInput.trim() && pendingFiles.length === 0) return;

    isSendingRef.current = true;

    localStorage.removeItem("adin-draft-input");
    
    // Use a fresh copy of chatHistory for the new chat
    let activeId = currentChatId;
    if(!activeId){
      activeId = Date.now();
      const newChat = { id: activeId, title: finalInput.slice(0,25) || "New Chat", createdAt: Date.now() };
      setChatHistory(prevHistory => sortChats([newChat, ...prevHistory]));
      setCurrentChatId(activeId);
    }

    let fullMessage = finalInput;

    const filesToSend = [...pendingFiles];
    if (filesToSend.length > 0) {
      filesToSend.forEach(file => {
        fullMessage += `\n\nFile: ${file.name}\nContent:\n${file.content}`;
      });
    }

    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
    setInput("");

    const userMsg: MessageType = {
      role: "user",
      text: fullMessage,
      files: filesToSend
    };

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
      if(userId !== "anonymous" && aiText) {
        try {
          await saveMemoryFromResponse(userId, finalInput, aiText);
        } catch (memoryErr) {
          console.error("Failed to save memory:", memoryErr);
        }
      }
    } catch(err) {
      console.log(err);
      toast.error("Connection Error");
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  }, [input, pendingFiles, currentChatId, messages, aiMemory, webEnabled, userId, sortChats]);

  const newChat = useCallback(() => {
    setCurrentChatId(null);
    setMessages([]);
    setInput("");
    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
    localStorage.removeItem("adin-draft-input");
  }, []);

  const renderAIChat = useCallback(() => {
    return (
      <>
        <div className="flex-1 overflow-auto p-4">
          {messages.length === 0 && (
            <div className="h-full flex flex-col justify-center items-center text-zinc-500">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4 shadow-2xl">
                <Sparkles size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Hello</h1>
              <p className="mt-2 text-sm text-gray-500">How can I help you today?</p>
            </div>
          )}

          {messages.map((m,i)=>(
            <div key={i} className={`group relative mb-3 flex ${m.role==="user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${m.role==="user" ? "order-1" : "order-1"}`}>
                <div className={`rounded-xl px-3 py-2 ${
                  m.role==="user"
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                    : "bg-zinc-900 border border-zinc-800"
                }`}>
                  {editingMessage===i ? (
                    <div className="space-y-2">
                      <textarea value={editText} onChange={e=>setEditText(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white"/>
                      <button onClick={()=>saveEditedMessage(i)} className="px-3 py-1 rounded-lg bg-green-600 text-sm">Save</button>
                    </div>
                  ) : (
                    <div className="text-sm prose prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[]}
                        rehypePlugins={[]}
                        components={{
                          code: ({ node, inline, className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            ) : (
                              <code className="bg-black/50 px-1 py-0.5 rounded text-sm" {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {m.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                <div className="flex gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={()=>copyMessage(m.text,i)} className="p-1 hover:bg-gray-800 rounded">
                    {copiedIndex===i ? <Check size={10} className="text-green-400"/> : <Copy size={10} className="text-gray-400"/>}
                  </button>
                  <button onClick={()=>{ setEditingMessage(i); setEditText(m.text); }} className="p-1 hover:bg-gray-800 rounded">
                    <Edit size={10} className="text-gray-400"/>
                  </button>
                  {m.role==="ai" && (
                    <>
                      <button onClick={() => toggleLike(i, m.text, m.role)} className="p-1 hover:bg-gray-800 rounded">
                        <ThumbsUp size={10} className={likedMessages.includes(i) ? "text-green-400" : "text-gray-400"} />
                      </button>
                      <button onClick={()=>toggleDislike(i,m.text)} className="p-1 hover:bg-gray-800 rounded">
                        <ThumbsDown size={10} className={dislikedMessages.includes(i) ? "text-red-400" : "text-gray-400"} />
                      </button>
                      <button onClick={()=>{ const lastUser = messages[i-1]; if(lastUser && lastUser.role==="user") sendMessage(lastUser.text); }} className="p-1 hover:bg-gray-800 rounded">
                        <RotateCcw size={10} className="text-gray-400"/>
                      </button>
                      <SpeakButton text={m.text} language={detectedLanguage} />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {(pendingFiles.length > 0) && (
            <div className="mb-2 p-2 bg-gray-800/50 rounded-lg">
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-700 rounded-lg px-2 py-1">
                    <FileText size={12} className="text-blue-400" />
                    <span className="text-xs text-gray-300 max-w-[100px] truncate">{file.name}</span>
                    <button onClick={() => removePendingFile()} className="hover:text-red-400">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(loading) && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-w-[150px]">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        <div className="p-3 border-t border-zinc-900 shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-2">
              <FileUpload
                ref={fileUploadRef}
                onFileUploaded={handleFileUpload}
              />
            </div>

            <div className="flex gap-2">
              <VoiceMic
                onTranscript={handleVoiceTranscript}
                isDisabled={loading}
              />
              <input
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>e.key==="Enter" && !loading && sendMessage()}
                placeholder="Message Adin AI..."
                className="flex-1 h-10 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-sm text-white outline-none focus:border-purple-500"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading}
                className="h-10 px-4 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 disabled:opacity-50 text-white text-sm font-medium hover:scale-105 transition-transform"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }, [messages, editingMessage, editText, copiedIndex, likedMessages, dislikedMessages, pendingFiles, loading, input, detectedLanguage, copyMessage, toggleLike, toggleDislike, sendMessage, saveEditedMessage, removePendingFile, handleFileUpload, handleVoiceTranscript]);

  // ✅ Show Onboarding if not completed
  if (!isOnboardingComplete) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // ✅ Show loading screen while checking guest session
  if (!isGuest) {
    return <Login />;
  }

  // ✅ Premium Avatar Component - Only Avatar, Click to Open Dropdown
  const PremiumAvatar = useCallback(() => {
    const displayName = userName || "User";
    const avatarLetter = getAvatarLetter(displayName);
    const avatarColor = getAvatarColor(displayName);

    return (
      <div className="relative" ref={profileRef}>
        {/* Avatar Button - Click to toggle dropdown */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="relative group focus:outline-none"
        >
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/20 ring-2 ring-white/10 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-purple-500/50`}>
            {avatarLetter}
          </div>
        </button>

        {/* Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 top-12 w-64 rounded-xl bg-zinc-900/95 border border-zinc-800/50 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden z-50 animate-slide-down">
            <div className="p-4 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-purple-500/20 ring-2 ring-white/10`}>
                  {avatarLetter}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{displayName}</div>
                  <div className="text-xs text-zinc-400">Member</div>
                </div>
              </div>
            </div>
            <button
              onClick={handleGuestLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors duration-200"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    );
  }, [userName, isProfileOpen, getAvatarLetter, getAvatarColor, handleGuestLogout]);

  // ✅ Get page key for SEO
  const pageKey = getPageKey();
  const seoConfig = getSEOConfig(pageKey);

  return (
    <>
      {/* ✅ SEO: Dynamic Head based on current route */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType={seoConfig.ogType || "website"}
      />

      {/* ✅ JSON-LD Structured Data for current page */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas(pageKey as any))}
      </script>

      <Toaster position="top-right" />

      <div className="w-screen h-screen flex bg-black text-white overflow-hidden">
        {/* ✅ Workspace Page */}
        {currentPage === 'workspace' ? (
          <div className="w-full h-full flex flex-col">
            <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0 bg-black/50">
              <div></div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span>Ready</span>
                </div>
                <PremiumAvatar />
              </div>
            </div>
            <Suspense fallback={<LoadingScreen />}>
              <WorkspacePage
                onNavigate={handleWorkspaceNavigate}
                userId={userId}
              />
            </Suspense>
          </div>
        ) : currentPage === 'templates' ? (
          <div className="w-full h-full flex flex-col">
            <Suspense fallback={<LoadingScreen />}>
              <CVTemplatesPage
                onBackToHome={navigateToWorkspace}
                onTemplateSelect={handleTemplateSelect}
              />
            </Suspense>
          </div>
        ) : currentPage === 'cover-templates' ? (
          <div className="w-full h-full flex flex-col">
            <Suspense fallback={<LoadingScreen />}>
              <CoverTemplatesPage
                onBackToHome={navigateToWorkspace}
                onTemplateSelect={handleCoverTemplateSelect}
              />
            </Suspense>
          </div>
        ) : currentPage === 'founder' ? (
          <div className="w-full h-full flex flex-col">
            <Suspense fallback={<LoadingScreen />}>
              <Founder />
            </Suspense>
          </div>
        ) : currentPage === 'legal' ? (
          <div className="w-full h-full flex flex-col">
            <Suspense fallback={<LoadingScreen />}>
              {active === "Privacy Policy" && <PrivacyPolicy />}
              {active === "Terms of Service" && <TermsOfService />}
              {active === "Contact" && <Contact />}
            </Suspense>
          </div>
        ) : currentPage === 'app' ? (
          <div className="w-full flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              {active === "CV Builder" ? (
                <Suspense fallback={<LoadingScreen />}>
                  <CVBuilder
                    userId={userId}
                    onBackToHome={navigateToTemplates}
                    initialTemplateId={selectedTemplateId || undefined}
                  />
                </Suspense>
              ) : active === "Cover Letter" ? (
                <Suspense fallback={<LoadingScreen />}>
                  <CoverLetter
                    onBackToHome={navigateToCoverTemplates}
                    initialTemplateId={selectedCoverTemplateId || undefined}
                  />
                </Suspense>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>Loading...</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ✅ FALLBACK - Workspace */
          <div className="w-full h-full flex flex-col">
            <div className="h-[56px] flex justify-between items-center px-5 border-b border-zinc-900 shrink-0 bg-black/50">
              <div></div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <span>Ready</span>
                </div>
                <PremiumAvatar />
              </div>
            </div>
            <Suspense fallback={<LoadingScreen />}>
              <WorkspacePage
                onNavigate={handleWorkspaceNavigate}
                userId={userId}
              />
            </Suspense>
          </div>
        )}
      </div>
    </>
  );
}