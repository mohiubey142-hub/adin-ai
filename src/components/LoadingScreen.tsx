// src/components/LoadingScreen.tsx
export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f]" />
      <div className="absolute top-[-25%] left-[-10%] w-[450px] h-[450px] bg-[#7c3aed] opacity-[0.06] rounded-full blur-[120px]" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[450px] h-[450px] bg-[#2563eb] opacity-[0.04] rounded-full blur-[120px]" />
      
      <div className="relative z-10 text-center">
        {/* Logo placeholder - replace with your logo */}
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#7c3aed] to-[#2563eb] rounded-2xl flex items-center justify-center">
          <span className="text-3xl font-bold text-white">AI</span>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Adin AI</h2>
        <p className="text-[#a1a1aa] text-sm mb-6">Your AI-Powered Career Assistant</p>
        
        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-[#7c3aed] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  );
};