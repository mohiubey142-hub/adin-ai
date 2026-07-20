// App.tsx - Complete updated file with SEO & Lazy Loading + Founder Profile + Legal Pages (No 404)
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import ReactMarkdown from "react-markdown";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/clerk-react";
import Login from "./Login";
import Signup from "./Signup";
import Settings from "./components/Settings";
import Search from "./components/Search";
import Library from "./components/Library";
import Documents from "./components/Documents";
import WebSearch from "./components/WebSearch";
import AboutMe from "./components/AboutMe";
import VoiceMic from "./components/VoiceMic";
import SpeakButton from "./components/SpeakButton";
import FileUpload, { FileUploadRef } from "./components/FileUpload";
import { SEOHead } from "./components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "./utils/seo";

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
  BookOpen, Bug, Rocket, Target, Briefcase, Mail
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { sendToAI, saveMemoryFromResponse } from "./services/ai";
import { saveMemory, loadMemory } from "./utils/memory";
import { LoadingScreen } from "./components/LoadingScreen";

// Premium Programming Languages - Colors matching your interface (Purple/Violet/Blue theme)
const programmingLanguages = [
  { id: "javascript", name: "JavaScript", icon: <Braces size={22} />, gradient: "from-amber-500 to-yellow-500", desc: "Web Development" },
  { id: "python", name: "Python", icon: <Terminal size={22} />, gradient: "from-blue-500 to-indigo-500", desc: "AI/ML, Backend" },
  { id: "react", name: "React", icon: <Code2 size={22} />, gradient: "from-cyan-500 to-blue-500", desc: "Frontend Framework" },
  { id: "typescript", name: "TypeScript", icon: <Braces size={22} />, gradient: "from-blue-600 to-indigo-600", desc: "Type-safe JS" },
  { id: "nodejs", name: "Node.js", icon: <Server size={22} />, gradient: "from-green-600 to-emerald-600", desc: "Backend Runtime" },
  { id: "html-css", name: "HTML/CSS", icon: <Layout size={22} />, gradient: "from-orange-500 to-red-500", desc: "Web Fundamentals" },
  { id: "database", name: "Databases", icon: <Database size={22} />, gradient: "from-purple-500 to-pink-500", desc: "SQL & NoSQL" },
  { id: "devops", name: "DevOps", icon: <Cloud size={22} />, gradient: "from-slate-500 to-gray-500", desc: "Cloud & Infra" },
  { id: "security", name: "Security", icon: <Shield size={22} />, gradient: "from-rose-500 to-red-500", desc: "Cybersecurity" },
  { id: "git", name: "Git/GitHub", icon: <GitBranch size={22} />, gradient: "from-orange-600 to-amber-600", desc: "Version Control" },
  { id: "ai-ml", name: "AI/ML", icon: <Cpu size={22} />, gradient: "from-violet-500 to-purple-500", desc: "Artificial Intel" },
  { id: "system-design", name: "System Design", icon: <Server size={22} />, gradient: "from-indigo-500 to-purple-500", desc: "Architecture" },
];

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

  useEffect(() => {
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
    { id: "dashboard", name: "Dashboard", icon: <Sparkles size={14} /> },
    { id: "learn", name: "Learn", icon: <BookOpen size={14} /> },
    { id: "code", name: "Code", icon: <Code2 size={14} /> },
    { id: "debug", name: "Debug", icon: <Bug size={14} /> },
    { id: "project", name: "Projects", icon: <Rocket size={14} /> },
    { id: "interview", name: "Interview", icon: <Target size={14} /> },
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
                  <div className="text-white">{lang.icon}</div>
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
            <div className="text-white text-sm">{currentLang?.icon}</div>
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
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                    activeTool === tool.id 
                      ? "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border-l-2 border-purple-500" 
                      : "text-gray-400 hover:bg-zinc-900"
                  }`}
                >
                  {tool.icon}
                  <span>{tool.name}</span>
                </button>
              ))}
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

// ✅ MENU ITEMS - Keep for Phase 2+
const menuItems = [
  { name: "AI Chat", icon: <MessageSquare size={18} /> },
  { name: "CV Builder", icon: <FileText size={18} /> },
  { name: "Cover Letter", icon: <Mail size={18} /> },
  { name: "Web Search", icon: <Globe size={18} /> },
  { name: "Library", icon: <LibraryIcon size={18} /> },
  { name: "Documents", icon: <FileText size={18} /> },
  { name: "About Me", icon: <User size={18} /> },
  { name: "Settings", icon: <SettingsIcon size={18} /> },
];

type MessageType = { role: string; text: string; files?: { name: string; content: string }[] };
type MemoryType = { id: number; text: string };
type ChatType = { id: number; title: string; pinned?: boolean; createdAt: number };

export default function App() {
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
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id || "anonymous";
  const isSendingRef = useRef(false);

  // ✅ Navigation handler for workspace - Direct navigation to builders or galleries
  const handleWorkspaceNavigate = (page: string) => {
    if (page === 'cv-builder') {
      setCurrentPage('templates');
      setActive('CV Templates');
      window.location.hash = 'templates';
      localStorage.setItem("adin-current-page", "templates");
    } else if (page === 'cover-letter') {
      setCurrentPage('app');
      setActive('Cover Letter');
      window.location.hash = 'cover-letter';
      localStorage.setItem("adin-active-tab", "Cover Letter");
      localStorage.setItem("adin-current-page", "app");
    } else if (page === 'founder') {
      setCurrentPage('founder');
      setActive('Founder');
      window.location.hash = 'founder';
      localStorage.setItem("adin-current-page", "founder");
    }
  };

  // ✅ Handler for CV template selection - opens CV Builder with selected template
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentPage('app');
    setActive('CV Builder');
    localStorage.setItem("adin-active-tab", "CV Builder");
    localStorage.setItem("adin-selected-template", templateId);
    localStorage.setItem("adin-current-page", "app");
    window.location.hash = "cv-builder";
  };

  // ✅ Handler for Cover Letter template selection
  const handleCoverTemplateSelect = (templateId: string) => {
    setSelectedCoverTemplateId(templateId);
    setCurrentPage('app');
    setActive('Cover Letter');
    localStorage.setItem("adin-active-tab", "Cover Letter");
    localStorage.setItem("adin-selected-cover-template", templateId);
    localStorage.setItem("adin-current-page", "app");
    window.location.hash = "cover-letter";
  };

  // ✅ Navigate back to workspace from templates
  const navigateToWorkspace = () => {
    setCurrentPage('workspace');
    window.location.hash = '';
    localStorage.setItem("adin-active-tab", "AI Chat");
    localStorage.setItem("adin-current-page", "workspace");
  };

  // ✅ Navigate back to CV templates from CV builder
  const navigateToTemplates = () => {
    setCurrentPage('templates');
    setActive('CV Templates');
    window.location.hash = 'templates';
    localStorage.setItem("adin-current-page", "templates");
  };

  // ✅ Navigate back to Cover Letter templates
  const navigateToCoverTemplates = () => {
    setCurrentPage('cover-templates');
    setActive('Cover Templates');
    window.location.hash = 'cover-templates';
    localStorage.setItem("adin-current-page", "cover-templates");
  };

  // ✅ Navigate back to workspace from any page
  const navigateToWorkspaceFromApp = () => {
    setCurrentPage('workspace');
    window.location.hash = '';
    localStorage.setItem("adin-active-tab", "AI Chat");
    localStorage.setItem("adin-current-page", "workspace");
  };

  const setActiveTab = (tabName: string) => {
    setActive(tabName);
    localStorage.setItem("adin-active-tab", tabName);
    
    let hash = "";
    if (tabName === "CV Builder") hash = "cv-builder";
    else if (tabName === "Cover Letter") hash = "cover-letter";
    else if (tabName === "CV Templates") hash = "templates";
    else if (tabName === "Cover Templates") hash = "cover-templates";
    else if (tabName === "AI Chat") hash = "ai-chat";
    else if (tabName === "Web Search") hash = "web-search";
    else if (tabName === "Library") hash = "library";
    else if (tabName === "Documents") hash = "documents";
    else if (tabName === "About Me") hash = "about-me";
    else if (tabName === "Settings") hash = "settings";
    else if (tabName === "Founder") hash = "founder";
    else if (tabName === "Privacy Policy") hash = "privacy-policy";
    else if (tabName === "Terms of Service") hash = "terms-of-service";
    else if (tabName === "Contact") hash = "contact";
    
    window.location.hash = hash;
  };

  // ✅ Hash change listener - Handles all navigation routes (No 404)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      
      if (hash === "templates") {
        setCurrentPage('templates');
        setActive("CV Templates");
        localStorage.setItem("adin-active-tab", "CV Templates");
        localStorage.setItem("adin-current-page", "templates");
      } else if (hash === "cover-templates") {
        setCurrentPage('cover-templates');
        setActive("Cover Templates");
        localStorage.setItem("adin-active-tab", "Cover Templates");
        localStorage.setItem("adin-current-page", "cover-templates");
      } else if (hash === "cv-builder") { 
        setCurrentPage('app'); 
        setActive("CV Builder");
        localStorage.setItem("adin-active-tab", "CV Builder");
        localStorage.setItem("adin-current-page", "app");
      } else if (hash === "cover-letter") { 
        setCurrentPage('app'); 
        setActive("Cover Letter");
        localStorage.setItem("adin-active-tab", "Cover Letter");
        localStorage.setItem("adin-current-page", "app");
      } else if (hash === "founder") {
        setCurrentPage('founder');
        setActive("Founder");
        localStorage.setItem("adin-active-tab", "Founder");
        localStorage.setItem("adin-current-page", "founder");
      } else if (hash === "privacy-policy" || hash === "terms-of-service" || hash === "contact") {
        setCurrentPage('legal');
        const pageName = hash === "privacy-policy" ? "Privacy Policy" : hash === "terms-of-service" ? "Terms of Service" : "Contact";
        setActive(pageName);
        localStorage.setItem("adin-active-tab", pageName);
        localStorage.setItem("adin-current-page", "legal");
      } else if (hash === "" || hash === "workspace") { 
        setCurrentPage('workspace');
        localStorage.setItem("adin-current-page", "workspace");
      }
      // ✅ NO 404 - Unknown hash redirects to workspace
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const sortChats = (chats: ChatType[]) => [...chats].sort((a,b) => {
    if (a.pinned === b.pinned) return b.id - a.id;
    return a.pinned ? -1 : 1;
  });

  useEffect(() => {
    localStorage.setItem("adin-active-tab", active);
  }, [active]);

  useEffect(() => {
    if (input) localStorage.setItem("adin-draft-input", input);
    else localStorage.removeItem("adin-draft-input");
  }, [input]);

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

      // ✅ Restore current page - No 404
      if (savedCurrentPage) {
        const page = savedCurrentPage as 'workspace' | 'app' | 'templates' | 'cover-templates' | 'founder' | 'legal';
        setCurrentPage(page);
        
        // Also update hash to match
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
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => { localStorage.setItem("adin-likes", JSON.stringify(likedMessages)); }, [likedMessages]);
  useEffect(() => { localStorage.setItem("adin-dislikes", JSON.stringify(dislikedMessages)); }, [dislikedMessages]);
  useEffect(() => { localStorage.setItem("adin-history", JSON.stringify(chatHistory)); }, [chatHistory]);
  useEffect(() => { localStorage.setItem("adin-messages", JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem("adin-current-chat", JSON.stringify(currentChatId)); }, [currentChatId]);
  useEffect(() => { localStorage.setItem("adin-web-enabled", JSON.stringify(webEnabled)); }, [webEnabled]);
  useEffect(() => { saveMemory(aiMemory); }, [aiMemory]);

  const copyMessage = (text: string, i: number) => { 
    navigator.clipboard.writeText(text); 
    setCopiedIndex(i); 
    toast.success("Copied"); 
    setTimeout(() => setCopiedIndex(null), 2000); 
  };
  
  const handleVoiceTranscript = (text: string, language: string) => {
    if (!text.trim()) return;
    setInput(text);
    setDetectedLanguage(language);
  };

  const handleFileUpload = (fileName: string, fileContent: string) => {
    setPendingFiles([{ name: fileName, content: fileContent }]);
  };

  const removePendingFile = () => {
    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
  };
  
  const toggleLike = (i: number, text: string, role: string) => {
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
  };
  
  const toggleDislike = (i: number, text: string) => { 
    const old = JSON.parse(localStorage.getItem("adin-feedback") || "[]");
    old.push({ type: "dislike", text, createdAt: new Date().toISOString() });
    localStorage.setItem("adin-feedback", JSON.stringify(old));
    setDislikedMessages(prev => prev.includes(i) ? prev.filter(x=>x!==i) : [...prev, i]); 
    setLikedMessages(prev => prev.filter(x=>x!==i)); 
    toast.success("Feedback saved"); 
  };
  
  const deleteChat = (id: number) => { 
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
  };
  
  const pinChat = (id: number) => { 
    const updated = chatHistory.map(c=>c.id===id?{...c, pinned:!c.pinned}:c); 
    setChatHistory(sortChats(updated)); 
    localStorage.setItem("adin-history", JSON.stringify(sortChats(updated))); 
  };
  
  const saveRename = (id: number) => { 
    if(!renameValue.trim()) return; 
    const updated = chatHistory.map(c=>c.id===id?{...c, title:renameValue}:c); 
    setChatHistory(sortChats(updated)); 
    setEditingChatId(null); 
    setRenameValue(""); 
    toast.success("Renamed"); 
  };
  
  const saveEditedMessage = async (idx: number) => {
    const updated = [...messages]; updated[idx].text = editText;
    const sliced = updated.slice(0, idx+1);
    setMessages(sliced); setEditingMessage(null); setLoading(true);
    try {
      const res = await sendToAI(sliced, aiMemory, webEnabled, userId);
      const data = await res.json();
      const aiText = data.choices?.[0]?.message?.content || "No response";
      const final = [...sliced, { role: "ai", text: aiText }];
      setMessages(final);
      setChatMessages(prev => ({ ...prev, [currentChatId!]: final }));
    } catch (err) { console.log(err); toast.error("Error"); } finally { setLoading(false); }
  };
  
  const sendMessage = async (retry?: string) => {
    if (isSendingRef.current) return;
    
    const finalInput = retry || input;
    
    if (!finalInput.trim() && pendingFiles.length === 0) return;
    
    isSendingRef.current = true;
    
    localStorage.removeItem("adin-draft-input");
    let activeId = currentChatId;
    if(!activeId){
      activeId = Date.now();
      const first = { id: activeId, title: finalInput.slice(0,25) || "New Chat", createdAt: Date.now() };
      setChatHistory(sortChats([first, ...chatHistory]));
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
      if(userId !== "anonymous" && aiText) await saveMemoryFromResponse(userId, finalInput, aiText);
    } catch(err) { 
      console.log(err); 
      toast.error("Connection Error"); 
    } finally { 
      setLoading(false); 
      isSendingRef.current = false;
    }
  };
  
  const newChat = () => { 
    setCurrentChatId(null); 
    setMessages([]); 
    setInput(""); 
    setPendingFiles([]);
    fileUploadRef.current?.clearFile();
    localStorage.removeItem("adin-draft-input"); 
  };

  const renderAIChat = () => {
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
  };

  const recentChats = chatHistory.filter(chat => !chat.pinned);

  // ✅ Show loading screen while Clerk is loading
  if (!isUserLoaded) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* ✅ SEO: Global Head with Structured Data */}
      <SEOHead 
        title="Free CV Builder & Cover Letter Maker"
        description="Create professional CV and cover letter free with Adin AI. Best free CV builder and cover letter maker online. AI-powered resume builder, document management, and career assistant."
        canonicalUrl="https://adin-ai.com/"
        ogType="website"
      />
      
      {/* ✅ JSON-LD Structured Data for Home Page */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas("home"))}
      </script>

      <Toaster position="top-right" />
      <SignedOut>
        {window.location.pathname === "/signup" ? <Signup /> : <Login />}
      </SignedOut>
      <SignedIn>
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
                  <UserButton />
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
            /* ✅ LEGAL PAGES (Privacy Policy, Terms of Service, Contact) */
            <div className="w-full h-full flex flex-col">
              <Suspense fallback={<LoadingScreen />}>
                {active === "Privacy Policy" && <PrivacyPolicy />}
                {active === "Terms of Service" && <TermsOfService />}
                {active === "Contact" && <Contact />}
              </Suspense>
            </div>
          ) : currentPage === 'app' ? (
            /* ✅ APP PAGES (CV Builder, Cover Letter) - NO HEADER */
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
                  <UserButton />
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
      </SignedIn>
    </>
  );
}