import React, { useState } from 'react';
import { ArrowDown } from 'lucide-react';

interface MoreInsightsArrowProps {
  onClick?: () => void;
}

export const MoreInsightsArrow = ({ onClick }: MoreInsightsArrowProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex flex-col items-center justify-center py-3 cursor-pointer group animate-float-arrow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="relative flex items-center justify-center">
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl transition-all duration-700 ${
          isHovered ? 'scale-150 opacity-100' : 'scale-100 opacity-50'
        }`} />
        
        <div className="relative flex items-center gap-3">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-purple-500/50 to-purple-500/80 rounded-full" />
          
          <div className={`relative transition-all duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <ArrowDown 
              size={28} 
              className={`text-purple-400 transition-all duration-500 ${
                isHovered ? 'text-purple-300' : 'text-purple-400'
              }`}
            />
            <div className={`absolute inset-0 rounded-full border-2 border-purple-500/30 transition-all duration-1000 ${
              isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`} />
            <div className={`absolute inset-0 rounded-full border-2 border-purple-500/20 transition-all duration-1000 delay-200 ${
              isHovered ? 'scale-125 opacity-0' : 'scale-100 opacity-100'
            }`} />
          </div>
          
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-purple-500/50 to-purple-500/80 rounded-full" />
        </div>
      </div>

      <div className="relative mt-2 flex items-center gap-2">
        <div className={`w-8 h-px bg-gradient-to-r from-transparent to-purple-500/50 transition-all duration-500 ${
          isHovered ? 'opacity-100 w-12' : 'opacity-50 w-8'
        }`} />
        
        <span className={`text-xs font-medium tracking-widest uppercase transition-all duration-300 ${
          isHovered 
            ? 'text-purple-300 bg-purple-500/20 px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/20' 
            : 'text-purple-400/70'
        }`}>
          More Insights
        </span>
        
        <div className={`w-8 h-px bg-gradient-to-l from-transparent to-purple-500/50 transition-all duration-500 ${
          isHovered ? 'opacity-100 w-12' : 'opacity-50 w-8'
        }`} />
      </div>

      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent transition-all duration-700 ${
        isHovered ? 'opacity-100 w-48' : 'opacity-30 w-32'
      }`} />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-2 left-1/2 w-1 h-1 rounded-full bg-purple-500/30 transition-all duration-1000 ${
          isHovered ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
        }`} />
        <div className={`absolute -top-2 left-1/3 w-1 h-1 rounded-full bg-blue-500/30 transition-all duration-1000 delay-200 ${
          isHovered ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
        }`} />
        <div className={`absolute -top-2 right-1/3 w-1 h-1 rounded-full bg-purple-500/30 transition-all duration-1000 delay-400 ${
          isHovered ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        }`} />
      </div>
    </div>
  );
};