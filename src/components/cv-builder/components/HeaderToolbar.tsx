import React from 'react';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

interface HeaderToolbarProps {
    onClearAll: () => void;
    onToggleFullscreen: () => void;
    isFullscreen: boolean;
    saveStatus: 'saved' | 'saving';
    onBackToTemplates?: () => void;
}

const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
    onClearAll,
    onToggleFullscreen,
    isFullscreen,
    saveStatus,
    onBackToTemplates
}) => {
    return (
        <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-purple-500/20">
            {/* ✅ Mobile optimized: 0 padding on mobile, only desktop padding */}
            <div className="flex justify-between items-center px-0 sm:px-3 lg:px-0 py-0 sm:py-3 lg:py-4 flex-wrap gap-0 sm:gap-3">
                
                {/* ✅ Back to Templates - Mobile: Purple gradient box, full left alignment */}
                <button 
                    onClick={onBackToTemplates || onClearAll} 
                    className="px-3 sm:px-3.5 lg:px-5 py-0 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 sm:bg-gradient-to-r sm:from-blue-600 sm:to-indigo-600 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs lg:text-sm min-h-[36px] sm:min-h-[40px] touch-manipulation"
                >
                    <ArrowLeft 
                        size={15} 
                        className="flex-shrink-0 sm:size-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] sm:drop-shadow-none" 
                    /> 
                    <span className="hidden sm:inline">Back to Templates</span>
                </button>
                
                {/* ✅ Centered Title - Mobile: 10% bigger (text-[19px]) */}
                <div className="text-center flex-1 absolute left-1/2 transform -translate-x-1/2 pointer-events-none px-1 w-[calc(100%-100px)]">
                    <h1 className="text-[19px] sm:text-lg lg:text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight whitespace-normal sm:whitespace-nowrap leading-tight">
                        📄 Adin AI CV Builder
                    </h1>
                    <p className="text-gray-400 text-[8px] sm:text-[10px] lg:text-sm hidden sm:block font-light tracking-wide">
                        Create professional CV • ATS Optimized
                    </p>
                </div>
                
                {/* ✅ Fullscreen + Save Status - Mobile: Purple gradient box, full right alignment */}
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4 ml-auto">
                    <span className={`hidden sm:inline-block text-[8px] sm:text-[10px] lg:text-xs transition-all duration-300 font-medium ${
                        saveStatus === 'saving' ? 'text-purple-400 animate-pulse' : 'text-green-400'
                    }`}>
                        {saveStatus === 'saving' ? 'Saving...' : '✓ Saved'}
                    </span>
                    
                    <button 
                        onClick={onToggleFullscreen} 
                        className="px-3 sm:px-3.5 lg:px-5 py-0 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 sm:bg-gradient-to-r sm:from-purple-600 sm:to-blue-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 text-[10px] sm:text-xs lg:text-sm flex items-center gap-1.5 sm:gap-2 min-h-[36px] sm:min-h-[40px] touch-manipulation"
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
                </div>
            </div>
        </div>
    );
};

export default HeaderToolbar;