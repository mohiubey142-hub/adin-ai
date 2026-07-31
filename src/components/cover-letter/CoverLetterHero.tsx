import React from 'react';
import { Save, ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

interface CoverLetterHeroProps {
  completion: number;
  isSaved: boolean;
  onBackToHome?: () => void;
  toggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

const CoverLetterHero: React.FC<CoverLetterHeroProps> = ({ 
  completion, 
  isSaved,
  onBackToHome,
  toggleFullscreen,
  isFullscreen = false
}) => {
  return (
    <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-xl bg-black/95 backdrop-blur-sm border-b border-purple-500/20">
      {/* ✅ Mobile optimized: 0 padding on mobile, only desktop padding */}
      <div className="flex justify-between items-center px-0 sm:px-3 lg:px-0 py-0 sm:py-3 lg:py-4 flex-wrap gap-0 sm:gap-3">
        
        {/* ✅ Back to Templates - Mobile: Purple gradient box, full left alignment */}
        {onBackToHome && (
          <button 
            onClick={onBackToHome}
            className="px-3 sm:px-3.5 lg:px-5 py-0 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm min-h-[36px] sm:min-h-[40px] touch-manipulation"
          >
            <ArrowLeft 
              size={15} 
              className="flex-shrink-0 sm:size-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:drop-shadow-none" 
            />
            <span className="hidden sm:inline">Templates</span>
          </button>
        )}
        
        {/* ✅ Centered Title - Mobile: +6px (19→25), Desktop: +10px (24→34) */}
        <div className="text-center flex-1 absolute left-1/2 transform -translate-x-1/2 pointer-events-none px-1 w-[calc(100%-100px)]">
          <h1 className="text-[25px] sm:text-[34px] lg:text-[34px] font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight whitespace-normal sm:whitespace-nowrap leading-tight">
            📄 Adin AI Cover Letter
          </h1>
          <p className="text-[8px] sm:text-sm text-gray-400 hidden sm:block font-light tracking-wide">
            Create professional cover letters • ATS Optimized
          </p>
        </div>
        
        {/* ✅ Right - Fullscreen + Progress + Save Status */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 ml-auto">
          {/* ✅ Progress Ring - Mobile optimized */}
          <div className="relative w-7 h-7 sm:w-10 sm:h-10 flex-shrink-0">
            <svg className="w-7 h-7 sm:w-10 sm:h-10 transform -rotate-90">
              <circle cx="14" cy="14" r="12" fill="none" stroke="rgba(139,92,246,0.2)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="12" fill="none" stroke="url(#heroGradient)" strokeWidth="2.5" strokeDasharray="75.4" strokeDashoffset={75.4 - (completion / 100) * 75.4} strokeLinecap="round" />
              <defs>
                <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[7px] sm:text-[10px] font-bold text-white">{completion}%</span>
            </div>
          </div>
          
          {/* ✅ Save Status - Hidden on mobile, visible on desktop */}
          <span className={`hidden sm:inline-block text-[8px] sm:text-[10px] lg:text-xs transition-all duration-300 font-medium ${
            isSaved ? 'text-green-400' : 'text-purple-400 animate-pulse'
          }`}>
            {isSaved ? '✓ Saved' : 'Saving...'}
          </span>
          
          {/* ✅ Fullscreen Button - Mobile: Purple gradient box, full right alignment */}
          {toggleFullscreen && (
            <button 
              onClick={toggleFullscreen}
              className="px-3 sm:px-3.5 lg:px-5 py-0 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 text-[10px] sm:text-xs lg:text-sm flex items-center gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-[40px] touch-manipulation"
            >
              {isFullscreen ? (
                <Minimize2 
                  size={15} 
                  className="flex-shrink-0 sm:size-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:drop-shadow-none" 
                />
              ) : (
                <Maximize2 
                  size={15} 
                  className="flex-shrink-0 sm:size-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:drop-shadow-none" 
                />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoverLetterHero;