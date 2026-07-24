import React from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { aiEnhancerOptions, aiProviderOptions } from '../constants/aiConfig';

// Adin AI Brand Icon Component
const AdinAIIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={className} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

// Loading variant with rotation
const AdinAILoadingIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
    <svg 
        className={`${className} animate-spin`} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="12" cy="12" r="10" fill="rgba(59,130,246,0.12)" />
        <circle cx="12" cy="12" r="4" fill="white" stroke="rgba(255,255,255,0.85)" strokeWidth="2" />
        <path 
            d="M12 2L14 6L12 10L10 6L12 2Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M12 14L14 18L12 22L10 18L12 14Z" 
            fill="#A855F7" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M5 9L7 7L10 8L10 11L7 13L5 11L5 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
        <path 
            d="M19 9L17 7L14 8L14 11L17 13L19 11L19 9Z" 
            fill="#3B82F6" 
            stroke="rgba(255,255,255,0.85)" 
            strokeWidth="2" 
            strokeLinejoin="round"
        />
    </svg>
);

// Loading messages for professional feel
const loadingMessages = [
    'Analyzing your profile...',
    'Generating professional content...',
    'Building ATS optimized content...',
    'Thinking...',
    'Crafting high quality content...',
    'Optimizing for recruiters...',
    'Polishing your professional summary...',
];

interface AIEnhancerPanelProps {
    onApplyEnhancement: (type: string) => void;
    onRestoreOriginal: () => void;
    onGenerateSummary: () => void;
    onEnhanceExperience: () => void;
    onProviderChange: (provider: string) => void;
    selectedProvider: string;
    isLoading: string | null;
    isEnhancerLoading: string | null;
    isEnhancerUsed: boolean;
    hasOriginalSummary: boolean;
    hasExperiences: boolean;
    hasJobTitle: boolean;
    isAIActionLoading?: boolean;
    aiLoadingMessage?: string;
}

const AIEnhancerPanel: React.FC<AIEnhancerPanelProps> = ({
    onApplyEnhancement,
    onRestoreOriginal,
    onGenerateSummary,
    onEnhanceExperience,
    onProviderChange,
    selectedProvider,
    isLoading,
    isEnhancerLoading,
    isEnhancerUsed,
    hasOriginalSummary,
    hasExperiences,
    hasJobTitle,
    isAIActionLoading = false,
    aiLoadingMessage = 'Generating professional content...'
}) => {
    return (
        <div className="space-y-3 sm:space-y-4">
            {/* ✅ AI Provider Selector - FIXED: Full width cards */}
            <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-gray-900/50 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <AdinAIIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <h4 className="text-xs sm:text-sm font-semibold text-white">AI Model</h4>
                </div>
                
                {/* ✅ FIXED: Full width cards with equal spacing */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {/* Model 1: Adin AI Swift */}
                    <button
                        onClick={() => onProviderChange('openrouter')}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-0.5 touch-manipulation min-h-[52px] sm:min-h-[56px] w-full ${
                            selectedProvider === 'openrouter'
                                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500 shadow-lg shadow-purple-500/30 text-white'
                                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 hover:border-purple-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 w-full justify-center">
                            <AdinAIIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${selectedProvider === 'openrouter' ? 'text-white' : 'text-gray-500'}`} />
                            <span className="text-[10px] sm:text-xs font-semibold">Adin AI Swift</span>
                        </div>
                        <span className={`text-[8px] sm:text-[10px] ${selectedProvider === 'openrouter' ? 'text-purple-300' : 'text-gray-500'}`}>
                            Fast • Everyday Tasks
                        </span>
                    </button>

                    {/* Model 2: Adin AI Elite */}
                    <button
                        onClick={() => onProviderChange('groq')}
                        className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center gap-0.5 touch-manipulation min-h-[52px] sm:min-h-[56px] w-full ${
                            selectedProvider === 'groq'
                                ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500 shadow-lg shadow-purple-500/30 text-white'
                                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 hover:border-purple-500/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/10'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 w-full justify-center">
                            <AdinAIIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${selectedProvider === 'groq' ? 'text-white' : 'text-gray-500'}`} />
                            <span className="text-[10px] sm:text-xs font-semibold">Adin AI Elite</span>
                        </div>
                        <span className={`text-[8px] sm:text-[10px] ${selectedProvider === 'groq' ? 'text-purple-300' : 'text-gray-500'}`}>
                            Premium • Highest Quality
                        </span>
                    </button>
                </div>
            </div>

            {/* AI Quick Actions - Mobile optimized */}
            <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-gray-900/50 border border-purple-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">AI Quick Actions</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                        onClick={onGenerateSummary}
                        disabled={isLoading === 'summary' || !hasJobTitle || isAIActionLoading}
                        className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px] backdrop-blur-sm"
                    >
                        {isLoading === 'summary' || isAIActionLoading ? (
                            <AdinAILoadingIcon className="w-4 h-4" />
                        ) : (
                            <AdinAIIcon className="w-4 h-4" />
                        )}
                        <span className="truncate">Generate Summary</span>
                    </button>
                    <button
                        onClick={onEnhanceExperience}
                        disabled={isLoading === 'exp-0' || !hasExperiences || isAIActionLoading}
                        className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 text-emerald-300 text-[10px] sm:text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation min-h-[36px] sm:min-h-[40px] backdrop-blur-sm"
                    >
                        {isLoading === 'exp-0' || isAIActionLoading ? (
                            <AdinAILoadingIcon className="w-4 h-4" />
                        ) : (
                            <AdinAIIcon className="w-4 h-4" />
                        )}
                        <span className="truncate">Enhance Experience</span>
                    </button>
                </div>
            </div>

            {/* AI Enhancer - 8 Options */}
            <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-gray-900/50 border border-purple-500/20 shadow-xl transition-all duration-300 hover:border-purple-500/40 backdrop-blur-sm">
                <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-[9px] sm:text-[11px] text-purple-300/90 leading-relaxed text-center font-light tracking-wide">
                        These enhancers are for testing purposes. Try them and share feedback to help us improve. 
                        They scan and fix your data intelligently.
                    </p>
                </div>
                
                <div className="flex items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-400 flex items-center gap-1.5 sm:gap-2 tracking-wide">
                        <AdinAIIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        AI Enhancer
                    </h3>
                    
                    <button
                        onClick={onRestoreOriginal}
                        disabled={!isEnhancerUsed || !hasOriginalSummary || isAIActionLoading}
                        className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-[9px] sm:text-[11px] font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 touch-manipulation min-h-[28px] sm:min-h-[32px] backdrop-blur-sm ${
                            isEnhancerUsed && hasOriginalSummary && !isAIActionLoading
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5 hover:shadow-emerald-500/50 active:scale-98 cursor-pointer'
                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                    >
                        <RefreshCw size={10} className={isEnhancerUsed && hasOriginalSummary && !isAIActionLoading ? 'animate-pulse' : ''} />
                        <span className="hidden xs:inline">Restore Original</span>
                        <span className="xs:hidden">Restore</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {aiEnhancerOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onApplyEnhancement(option.id)}
                            disabled={isEnhancerLoading === option.id || isAIActionLoading}
                            className={`
                                px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl text-left transition-all duration-300
                                ${isEnhancerLoading === option.id 
                                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-500 shadow-lg shadow-purple-500/20' 
                                    : 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 hover:border-purple-500/30'
                                }
                                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20
                                active:scale-98
                                disabled:opacity-50 disabled:cursor-not-allowed
                                relative
                                min-h-[48px] sm:min-h-[56px] lg:min-h-[60px]
                                w-full
                                touch-manipulation
                                backdrop-blur-sm
                            `}
                        >
                            <div className="w-full">
                                <p className="text-[9px] sm:text-[11px] font-semibold text-gray-200 leading-snug text-center">
                                    {option.label}
                                </p>
                                <p className="text-[8px] sm:text-[10px] text-gray-400 leading-relaxed mt-0.5 text-center truncate">
                                    {option.desc}
                                </p>
                            </div>
                            {isEnhancerLoading === option.id && (
                                <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                                    <AdinAILoadingIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                
                {isEnhancerLoading && (
                    <div className="mt-2 sm:mt-3 text-center">
                        <p className="text-[9px] sm:text-[11px] text-purple-400 animate-pulse font-medium">
                            AI is enhancing your professional summary...
                        </p>
                    </div>
                )}

                {/* ✅ AI Action Loading Overlay */}
                {isAIActionLoading && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 backdrop-blur-sm">
                        <div className="flex items-center gap-3 justify-center">
                            <AdinAILoadingIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            <div className="text-center">
                                <p className="text-xs sm:text-sm text-purple-300 font-medium animate-pulse">
                                    {aiLoadingMessage}
                                </p>
                                <p className="text-[8px] sm:text-[10px] text-purple-400/70 mt-0.5">
                                    Please wait, this may take a moment...
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIEnhancerPanel;