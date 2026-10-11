// src/components/LoadingScreen.tsx
// Premium light theme — matches Adin AI brand (purple + slate)
// ✅ UPDATED: Logo image from public/icon-1024x1024.png (replaces "A" text)
// ZERO dependency on props, drop-in replacement

export const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center relative overflow-hidden">
      {/* Subtle purple glow accents */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-15%] left-[-10%] w-[480px] h-[480px] bg-purple-300 opacity-20 rounded-full blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-15%] right-[-10%] w-[480px] h-[480px] bg-purple-200 opacity-20 rounded-full blur-[120px]"
      />

      {/* Dot grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgb(203, 213, 225) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 text-center px-6">
        {/* Logo badge */}
        <div className="relative mx-auto mb-6 w-20 h-20">
          {/* Glow ring */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-purple-500 opacity-30 blur-xl animate-pulse"
          />
          {/* Logo image */}
          <div className="relative w-20 h-20 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 overflow-hidden">
            <img
              src="/icon-1024x1024.png"
              alt="Adin AI"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Brand */}
        <h2 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 bg-clip-text text-transparent">
            Adin AI
          </span>
        </h2>
        <p className="text-sm text-slate-500 mt-1.5 font-medium tracking-wide">
          Your AI-Powered Career Assistant
        </p>

        {/* Progress bar */}
        <div className="mt-8 w-56 mx-auto h-1.5 rounded-full bg-slate-200 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 animate-loading-bar" />
        </div>

        {/* Loading text */}
        <p className="mt-4 text-xs text-slate-400 font-medium tracking-widest uppercase">
          Loading
        </p>
      </div>

      {/* Local keyframes for the progress animation */}
      <style>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-loading-bar {
          animation: loading-bar 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};