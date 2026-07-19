import { useState, useEffect } from "react";
import { useUser, UserButton } from "@clerk/clerk-react";
import { 
  Moon, Sun, Trash2, RefreshCw, LogOut, Sparkles, Shield, Database, 
  Palette, Info, AlertCircle, User, Mail, Github, Twitter, Globe, 
  Bell, Key, Cpu, Cloud, Lock, Zap, Gift, Heart, Star, 
  Music, Video, BookOpen, Code, Award, TrendingUp, Users 
} from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const { user, signOut } = useUser();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [clearing, setClearing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const email = user?.emailAddresses[0]?.emailAddress || "";
  const firstName = email.split("@")[0] || "User";
  const firstLetter = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    const saved = localStorage.getItem("adin-theme") as "dark" | "light";
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle("dark", saved === "dark");
      if (saved === "light") {
        document.body.classList.add("light-mode");
      } else {
        document.body.classList.remove("light-mode");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("adin-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    if (newTheme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }
    
    toast.success(`${newTheme} mode enabled`);
    setTimeout(() => window.location.reload(), 500);
  };

  const clearAllData = async () => {
    setClearing(true);
    try {
      localStorage.removeItem("adin-history");
      localStorage.removeItem("adin-messages");
      localStorage.removeItem("adin-current-chat");
      localStorage.removeItem("adin-draft-input");
      localStorage.removeItem("adin-likes");
      localStorage.removeItem("adin-dislikes");
      toast.success("All chat data cleared");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error("Failed to clear data");
    } finally {
      setClearing(false);
      setShowConfirm(false);
    }
  };

  const clearMemoryOnly = async () => {
    try {
      localStorage.removeItem("adin-memory");
      toast.success("AI memory cleared");
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (err) {
      toast.error("Failed to sign out");
    }
  };

  // Profile click handler - opens Clerk profile
  const openProfile = () => {
    // Clerk UserButton already handles profile
    // We can trigger it programmatically or just show message
    toast.info("Click on the profile icon in the top bar to manage your account");
  };

  const features = [
    { icon: <Zap size={14} />, name: "Fast Responses", color: "from-yellow-500 to-amber-500" },
    { icon: <Lock size={14} />, name: "Privacy First", color: "from-green-500 to-emerald-500" },
    { icon: <Cpu size={14} />, name: "AI Powered", color: "from-blue-500 to-cyan-500" },
    { icon: <Globe size={14} />, name: "Web Search", color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/20 to-blue-500/20 px-4 py-2 rounded-full mb-4">
            <Shield size={16} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-400">Secure Settings</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="text-zinc-500 mt-2">Customize your experience</p>
        </div>

        {/* Profile Card - Clickable */}
        <div 
          onClick={openProfile}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-5 hover:border-violet-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <span className="text-2xl font-bold text-white">{firstLetter}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-violet-400" />
                <h3 className="font-semibold text-white">Profile</h3>
                <span className="text-xs text-violet-400">Click to manage</span>
              </div>
              <p className="text-sm text-zinc-400 flex items-center gap-1">
                <Mail size={12} className="text-zinc-500" />
                {email || "No email"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Signed in with Clerk</p>
            </div>
            <Shield size={18} className="text-zinc-600 group-hover:text-violet-400 transition" />
          </div>
        </div>

        {/* Appearance Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-5 hover:border-zinc-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
              <Palette size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Appearance</h3>
              <p className="text-xs text-zinc-500">Customize your theme</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between py-3 px-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition group"
          >
            <span className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={18} className="text-violet-400" /> : <Sun size={18} className="text-yellow-400" />}
              <span className="text-white">{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
            </span>
            <span className="text-sm text-zinc-500 group-hover:text-zinc-400 transition">Click to switch</span>
          </button>
          <p className="text-xs text-zinc-500 mt-3 text-center">
            {theme === "dark" ? "🌙 Dark mode active" : "☀️ Light mode active"}
          </p>
        </div>

        {/* Data Management Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-5 hover:border-zinc-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Database size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Data Management</h3>
              <p className="text-xs text-zinc-500">Control your data</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              onClick={clearMemoryOnly}
              className="w-full flex items-center justify-between py-3 px-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition group"
            >
              <span className="flex items-center gap-2">
                <RefreshCw size={16} className="text-blue-400" />
                <span className="text-white">Clear AI Memory</span>
              </span>
              <span className="text-xs text-zinc-500">Forgets what it learned</span>
            </button>
            
            {showConfirm ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-sm text-red-400 mb-3 flex items-center gap-2">
                  <AlertCircle size={16} />
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={clearAllData}
                    disabled={clearing}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    {clearing ? "Deleting..." : "Yes, Delete All"}
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-between py-3 px-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition group"
              >
                <span className="flex items-center gap-2">
                  <Trash2 size={16} className="text-red-400" />
                  <span className="text-red-400">Delete All Chats</span>
                </span>
                <span className="text-xs text-red-400/70">⚠️ Permanent</span>
              </button>
            )}
          </div>
        </div>

        {/* Features Card - New */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-5 hover:border-zinc-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
              <Award size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Premium Features</h3>
              <p className="text-xs text-zinc-500">What makes Adin AI special</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 py-2 px-3 bg-zinc-800/30 rounded-xl">
                <div className={`p-1 rounded-lg bg-gradient-to-br ${f.color}`}>
                  {f.icon}
                </div>
                <span className="text-sm text-zinc-300">{f.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* About Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-5 hover:border-zinc-700 transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500">
              <Info size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">About Adin AI</h3>
              <p className="text-xs text-zinc-500">Version & credits</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              <span className="font-semibold text-white">Adin AI</span>
              <span className="text-xs text-zinc-500">v2.1.0</span>
            </div>
            <p className="text-sm text-zinc-400">Next Generation Intelligence Platform</p>
            <p className="text-xs text-zinc-600">Powered by Groq + OpenRouter • Premium AI Models</p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="text-xs text-violet-400 hover:underline">Privacy Policy</a>
              <a href="#" className="text-xs text-violet-400 hover:underline">Terms of Service</a>
              <a href="#" className="text-xs text-violet-400 hover:underline">Contact</a>
            </div>
          </div>
        </div>

        {/* Sign Out Button - New */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:scale-110 transition" />
          <span className="font-medium">Sign Out</span>
        </button>

        <p className="text-center text-xs text-zinc-600 mt-6">
          Your data is stored securely • Adin AI Premium
        </p>
      </div>
    </div>
  );
}