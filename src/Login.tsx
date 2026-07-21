// src/Login.tsx
import { useState } from "react";
import { LoginForm } from "./components/auth";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState("");

  // ✅ Guest Entry handler - Now accepts name parameter
  const handleGuestEntry = (name: string) => {
    setUserName(name);
    setIsLoading(true);

    // ✅ 2 second premium loading animation
    setTimeout(() => {
      // ✅ Save user name to localStorage (no "Guest" wording)
      localStorage.setItem("adin_user_name", name);
      
      // ✅ Save guest session (internal - no Guest wording in UI)
      const guestSession = {
        isGuest: true,
        guestCreatedAt: new Date().toISOString(),
      };
      localStorage.setItem("adin-guest-session", JSON.stringify(guestSession));

      // ✅ Navigate to home using window.location
      window.location.href = "/";
    }, 2000);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      
      {/* ============================================
          PREMIUM BACKGROUND LAYERS
          ============================================ */}
      
      {/* Layer 1: Deep Navy Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-[#0d0d1a] to-[#08080f]" />
      
      {/* Layer 2: Soft Purple Glow (Top-Left) */}
      <div 
        className="absolute top-[-30%] left-[-20%] w-[600px] h-[600px] 
                   bg-[#7c3aed] opacity-[0.07] rounded-full blur-[130px] 
                   animate-pulse-slow"
      />
      
      {/* Layer 3: Soft Blue Glow (Bottom-Right) */}
      <div 
        className="absolute bottom-[-30%] right-[-20%] w-[550px] h-[550px] 
                   bg-[#2563eb] opacity-[0.05] rounded-full blur-[140px] 
                   animate-pulse-slower"
      />
      
      {/* Layer 4: Medium Magenta Glow (Center) */}
      <div 
        className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 
                   w-[400px] h-[400px] bg-[#8b5cf6] opacity-[0.03] 
                   rounded-full blur-[110px]"
      />
      
      {/* Layer 5: Tiny Bright Accent (Top-Right) */}
      <div 
        className="absolute top-[10%] right-[10%] w-[200px] h-[200px] 
                   bg-[#a78bfa] opacity-[0.04] rounded-full blur-[80px]"
      />
      
      {/* Layer 6: Soft Vignette for Depth */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#000000] 
                   opacity-[0.30]"
      />
      
      {/* ============================================
          CARD CONTAINER
          ============================================ */}
      
      <div className="scale-[0.90] relative z-10 w-full max-w-md">
        {/* ✅ Pass guest entry handler to LoginForm with name parameter */}
        <LoginForm onGuestEntry={handleGuestEntry} isLoading={isLoading} />
      </div>

      {/* ✅ Premium Loading Overlay with user name */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            {/* Premium spinner */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-zinc-800/50 border-t-purple-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse" />
              </div>
            </div>
            {/* Loading text with user name */}
            <div className="text-center">
              <p className="text-white text-lg font-medium tracking-wide">
                Welcome, {userName || "Adin AI"}!
              </p>
              <p className="text-zinc-500 text-sm mt-1">Setting up your premium experience...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}