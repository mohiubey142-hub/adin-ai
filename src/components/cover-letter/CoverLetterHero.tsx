import React from 'react';
import { Save } from 'lucide-react';

interface CoverLetterHeroProps {
  completion: number;
  isSaved: boolean;
}

const CoverLetterHero: React.FC<CoverLetterHeroProps> = ({ completion, isSaved }) => {
  return (
    <div className="relative mb-4 sm:mb-6 overflow-hidden rounded-xl bg-black/95 backdrop-blur-sm border-b border-purple-500/20">
      {/* CSS Grid layout for perfect center alignment */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 py-2 sm:py-4 min-h-[60px] sm:min-h-[80px]">
        
        {/* LEFT SPACER - Takes equal remaining space */}
        <div className="flex-shrink-0">
          {/* Empty spacer - balances the right side */}
        </div>
        
        {/* CENTER - Title + Description (auto width) */}
        <div className="text-center pointer-events-none px-2">
          <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent pointer-events-auto whitespace-nowrap">
            📄 Adin AI Cover Letter
          </h1>
          <p className="text-[9px] xs:text-[10px] sm:text-sm text-gray-400 block tracking-wide leading-tight pointer-events-auto whitespace-nowrap">
            Create professional cover letters • ATS Optimized
          </p>
        </div>
        
        {/* RIGHT - Progress Ring + Saved Status - Takes equal remaining space */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
          <div className="relative w-7 h-7 sm:w-10 sm:h-10">
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
          <span className={`text-[9px] sm:text-xs transition-all duration-300 whitespace-nowrap ${isSaved ? 'text-green-400' : 'text-purple-400 animate-pulse'}`}>
            {isSaved ? '✓ Saved' : 'Saving...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterHero;