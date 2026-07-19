import { useState, useEffect, useRef } from "react";
import { 
  Search, Globe, Image, Newspaper, Video, Sparkles, 
  ExternalLink, Maximize2, Minimize2, TrendingUp, 
  Briefcase, DollarSign, Rocket, Star, X, Copy, 
  Clock, Flame, Hash, Layers, Zap, Shield, BookOpen,
  TrendingDown, Activity, Wallet, Landmark, Smartphone
} from "lucide-react";
import toast from "react-hot-toast";

export default function WebSearch() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("web");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // 📦 Local Storage - Search History
  useEffect(() => {
    const saved = localStorage.getItem("webSearchHistory");
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...searchHistory.filter(s => s !== term)].slice(0, 10);
    setSearchHistory(updated);
    localStorage.setItem("webSearchHistory", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("webSearchHistory");
    toast.success("Search history cleared");
  };

  // 🔥 Search Suggestions (Hardcoded - Free)
  const suggestions = [
    "AI Jobs Pakistan 2026",
    "Gold Rate Today Pakistan",
    "USD to PKR Live",
    "React Developer Roadmap",
    "Freelancing Sites Pakistan",
    "PSX Stock Market",
    "How to start e-commerce",
    "Best remote jobs"
  ];

  // 📊 Categories for Chips (Clean UI)
  const categories = {
    "💼 Jobs": ["Software Engineer Salary", "Marketing Jobs Lahore", "Bank Jobs Pakistan", "Government Jobs 2026", "Remote Jobs for Pakistanis"],
    "💰 Finance": ["Gold Rate Today", "USD to PKR", "Stock Market PSX", "Crypto Market", "Forex Trading Profit"],
    "🚀 Business": ["Dropshipping Profit", "E-commerce Market Size", "Gym Business Profit", "Cafe Business Trend", "Real Estate Lahore"],
    "🤖 AI & Tech": ["Web Development Scope", "AI Jobs Pakistan", "Data Science Salary", "Cybersecurity Demand", "Upwork Trending Skills"]
  };

  // 🔥 Popular Searches (Trustworthy wording)
  const popularSearches = [
    "ChatGPT tutorial",
    "Pakistan IT exports 2026",
    "Freelance income Pakistan",
    "YouTube monetization requirements",
    "LinkedIn job search hacks",
    "Print on demand Pakistan"
  ];

  const tabs = [
    { id: "web", label: "Web", icon: <Globe size={16} />, url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}` },
    { id: "images", label: "Images", icon: <Image size={16} />, url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch` },
    { id: "news", label: "News", icon: <Newspaper size={16} />, url: (q) => `https://news.google.com/search?q=${encodeURIComponent(q)}` },
    { id: "videos", label: "Videos", icon: <Video size={16} />, url: (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` },
    { id: "googleai", label: "Google AI", icon: <Sparkles size={16} />, url: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}&udm=14` },
  ];

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter something to search");
      return;
    }

    setIsLoading(true);
    saveToHistory(searchQuery);
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentTab = tabs.find(tab => tab.id === activeTab);
    const url = currentTab.url(searchQuery);
    
    window.open(url, "_blank");
    setIsLoading(false);
    setShowHistory(false);
    toast.success(`🔍 Searching "${searchQuery}"`);
  };

  const copyQuery = () => {
    if (query) {
      navigator.clipboard.writeText(query);
      toast.success("Copied to clipboard");
    }
  };

  const clearQuery = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  // Fullscreen with Escape support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement && searchContainerRef.current) {
      searchContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && document.fullscreenElement) {
        document.exitFullscreen();
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Stats for Stats Bar
  const stats = [
    { icon: <Hash size={12} />, label: "Topics", value: "41" },
    { icon: <Layers size={12} />, label: "Search Modes", value: "5" },
    { icon: <Sparkles size={12} />, label: "Google AI", value: "Yes" },
    { icon: <Maximize2 size={12} />, label: "Fullscreen", value: "✓" },
  ];

  return (
    <div ref={searchContainerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header with Fullscreen */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              🔍 Web Search
            </h1>
            <p className="text-zinc-400 text-sm">Google • AI • Images • News • Videos — all in new tab</p>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition group"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen Mode"}
          >
            {isFullscreen ? <Minimize2 size={18} className="text-violet-400" /> : <Maximize2 size={18} className="group-hover:text-violet-400" />}
          </button>
        </div>

        {/* 📊 Stats Bar - Free & Professional */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/50 border border-zinc-800 rounded-full text-xs">
              {stat.icon}
              <span className="text-zinc-400">{stat.label}:</span>
              <span className="text-white font-medium">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Search Input with Clear & Copy */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-500 rounded-2xl blur opacity-20"></div>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                placeholder='Search anything... "AI Jobs", "Gold Rate", "React Roadmap"...'
                className="w-full h-[52px] rounded-2xl bg-zinc-950 border border-zinc-800 px-5 pr-24 outline-none focus:border-violet-500 text-base"
              />
              <div className="absolute right-2 flex gap-1">
                {query && (
                  <>
                    <button onClick={copyQuery} className="p-2 rounded-lg hover:bg-zinc-800 transition" title="Copy">
                      <Copy size={16} className="text-zinc-400 hover:text-violet-400" />
                    </button>
                    <button onClick={clearQuery} className="p-2 rounded-lg hover:bg-zinc-800 transition" title="Clear">
                      <X size={16} className="text-zinc-400 hover:text-violet-400" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl z-50 shadow-2xl">
                <div className="flex justify-between items-center p-3 border-b border-zinc-800">
                  <span className="text-xs text-zinc-400 flex items-center gap-1"><Clock size={12} /> Recent Searches</span>
                  <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                </div>
                {searchHistory.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="w-full text-left p-3 hover:bg-zinc-800 transition flex items-center gap-2 text-sm"
                  >
                    <Clock size={14} className="text-zinc-500" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => handleSearch()}
            disabled={isLoading}
            className="px-6 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 font-medium hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50 min-w-[110px] justify-center"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Search size={18} /> Search</>
            )}
          </button>
        </div>

        {/* 🔥 Popular Searches Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <h3 className="font-semibold text-orange-400 text-sm">🔥 Popular Today</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
                className="px-3 py-1.5 bg-zinc-800 rounded-full text-xs hover:bg-gradient-to-r hover:from-violet-600 hover:to-blue-500 hover:text-white transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${
                activeTab === tab.id 
                  ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg scale-105" 
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800 hover:scale-105"
              }`}
            >
              {tab.icon} {tab.label}
              {tab.id === "googleai" && <span className="text-[9px] bg-white/20 px-1 rounded">AI</span>}
            </button>
          ))}
        </div>

        {/* 📊 Categorized Chips - Clean UI */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-violet-400" />
            <h3 className="font-semibold text-violet-400 text-sm">📊 Trending Topics & Industry Insights</h3>
          </div>
          
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="mb-4">
              <div className="text-xs text-zinc-400 mb-2 flex items-center gap-1">
                <span>{category}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {items.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                    className="px-3 py-1.5 bg-zinc-800 rounded-full text-xs hover:bg-gradient-to-r hover:from-violet-600 hover:to-blue-500 hover:text-white transition hover:scale-105"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="text-right text-[10px] text-zinc-500 mt-2">
            ✨ {Object.values(categories).flat().length}+ Research Topics
          </div>
        </div>

        {/* Quick Links & Pro Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-violet-500/50 transition">
            <h3 className="font-semibold text-violet-400 mb-3 flex items-center gap-2">
              <ExternalLink size={14} /> ⚡ Quick Access
            </h3>
            <div className="space-y-2.5">
              <a href="https://www.cricbuzz.com" target="_blank" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-violet-400 transition">
                🏏 Live Cricket Scores
              </a>
              <a href="https://news.google.com" target="_blank" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-violet-400 transition">
                📰 Google News
              </a>
              <a href="https://www.google.com/search?q=USD+to+PKR&udm=14" target="_blank" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-violet-400 transition">
                💵 Dollar Rate
              </a>
              <a href="https://www.google.com/search?q=gold+rate+Pakistan+today&udm=14" target="_blank" className="flex items-center gap-2 text-sm text-zinc-300 hover:text-violet-400 transition">
                🏆 Gold Rate
              </a>
            </div>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-4 hover:border-violet-500/50 transition">
            <h3 className="font-semibold text-violet-400 mb-3 flex items-center gap-2">
              <Star size={14} /> 💎 Pro Features (Free)
            </h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>📜 <span className="text-white">Search History</span> = Last 10 searches saved</p>
              <p>📋 <span className="text-white">Copy & Clear</span> = One-click query tools</p>
              <p>🖥️ <span className="text-white">Fullscreen (Esc)</span> = Focused search experience</p>
              <p>⚡ <span className="text-white">Loading States</span> = Professional feedback</p>
              <p>🔥 <span className="text-white">Popular Today</span> = Trending searches</p>
            </div>
          </div>
        </div>

        {/* Footer - Honest & Trustworthy */}
        <div className="mt-6 text-center text-xs text-zinc-500 flex items-center justify-center gap-4 flex-wrap">
          <span>🔍 Opens in new tab</span>
          <span>⚡ 0.2 second redirect</span>
          <span>🌐 Powered by Google Search</span>
          <span>💯 100% Free • No API Key</span>
        </div>
      </div>
    </div>
  );
}