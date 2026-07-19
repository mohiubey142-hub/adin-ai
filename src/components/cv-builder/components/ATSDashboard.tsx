import React, { useState, useEffect } from 'react';
import { Lightbulb, AlertCircle } from 'lucide-react';

interface ATSDashboardProps {
    realWeightedAverage: number;
    realCompletionPercentage: number;
    realBreakdown: {
        keywords: number;
        structure: number;
        experience: number;
        skills: number;
        completeness: number;
    };
    realQuality: {
        text: string;
        color: string;
        icon: string;
    };
    realSuggestions: string[];
    getScoreColor: (score: number) => string;
    getScoreBg: (score: number) => string;
}

const ATSDashboard: React.FC<ATSDashboardProps> = ({
    realWeightedAverage,
    realCompletionPercentage,
    realBreakdown,
    realQuality,
    realSuggestions,
    getScoreColor,
    getScoreBg
}) => {
    // ✅ Lightbulb animation state (on/off toggle)
    const [isLightOn, setIsLightOn] = useState(true);

    useEffect(() => {
        // ✅ 1 second me 3 baar on/off (300ms interval)
        const interval = setInterval(() => {
            setIsLightOn(prev => !prev);
        }, 300);

        return () => clearInterval(interval);
    }, []);

    // ✅ Get color based on percentage
    const getBarColor = (value: number): string => {
        if (value >= 80) return 'from-emerald-500 to-green-400';
        if (value >= 60) return 'from-blue-500 to-indigo-400';
        if (value >= 40) return 'from-yellow-500 to-orange-400';
        return 'from-red-500 to-rose-400';
    };

    // ✅ Get glow color based on percentage
    const getGlowColor = (value: number): string => {
        if (value >= 80) return 'shadow-emerald-500/40';
        if (value >= 60) return 'shadow-blue-500/40';
        if (value >= 40) return 'shadow-yellow-500/40';
        return 'shadow-red-500/40';
    };

    return (
        // ✅ Mobile optimized: reduced spacing
        <div className="text-center py-0 space-y-3 sm:space-y-4 lg:space-y-5">
            {/* CV Health - Mobile optimized padding */}
            <div className={`p-4 sm:p-5 lg:p-6 rounded-xl border ${getScoreBg(realWeightedAverage)} bg-gray-900/50 backdrop-blur-sm`}>
                <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-xl sm:text-2xl lg:text-3xl ${getScoreBg(realWeightedAverage)}`}>
                            {realQuality.icon}
                        </div>
                        <div className="text-left">
                            <div className="flex items-center gap-1 sm:gap-2">
                                <h3 className="text-xs sm:text-sm font-semibold text-white">CV Health</h3>
                                <span className={`text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full ${getScoreBg(realWeightedAverage)} ${getScoreColor(realWeightedAverage)}`}>
                                    {realQuality.text}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                                <span className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getScoreColor(realWeightedAverage)}`}>
                                    {Math.round(realWeightedAverage)}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-400">/ 100</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="text-center">
                            <p className="text-[8px] sm:text-xs text-gray-400">Complete</p>
                            <p className="text-base sm:text-lg font-bold text-white">{Math.round(realCompletionPercentage)}%</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[8px] sm:text-xs text-gray-400">Quality</p>
                            <p className={`text-base sm:text-lg font-bold ${realQuality.color}`}>{realQuality.text}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-2 sm:mt-3 h-1.5 sm:h-2 w-full bg-gray-800/60 rounded-full overflow-hidden shadow-inner">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${getBarColor(realWeightedAverage)} shadow-lg ${getGlowColor(realWeightedAverage)}`}
                        style={{ width: `${Math.min(100, realWeightedAverage)}%` }}
                    />
                </div>
            </div>

            {/* ✅ ATS Analysis - Mobile optimized grid */}
            <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-gray-900/50 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2 sm:mb-3 lg:mb-4">
                    <h4 className="text-xs sm:text-sm font-semibold text-white">ATS Analysis</h4>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {Object.entries(realBreakdown).map(([key, value]) => {
                        const barColor = getBarColor(value);
                        const glowColor = getGlowColor(value);
                        return (
                            <div key={key} className="p-2 sm:p-3 rounded-lg bg-gray-800/40 border border-gray-700/30">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[8px] sm:text-[10px] text-gray-400 capitalize font-medium truncate">{key}</span>
                                    <span className={`text-[10px] sm:text-xs font-bold ${getScoreColor(value)}`}>
                                        {value}%
                                    </span>
                                </div>
                                <div className="h-1.5 sm:h-2 w-full bg-gray-700/50 rounded-full overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${barColor} shadow-lg ${glowColor}`}
                                        style={{ width: `${value}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ✅ CV Improvement Suggestions - Mobile optimized */}
            {realSuggestions.length > 0 && (
                <div className="p-3 sm:p-4 lg:p-5 rounded-xl bg-gray-900/50 border border-yellow-500/20">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                        <div className="relative group cursor-pointer">
                            <Lightbulb 
                                size={14} 
                                className={`transition-all duration-150 ${
                                    isLightOn 
                                        ? 'text-yellow-400 fill-yellow-400/30' 
                                        : 'text-gray-600 fill-gray-600/10'
                                } group-hover:text-yellow-300 group-hover:fill-yellow-300/40 group-hover:scale-125 group-hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.6)]`}
                            />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-white">CV Improvement Suggestions</h4>
                        <span className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                            {realSuggestions.length} items
                        </span>
                    </div>
                    <div className="space-y-1 max-h-[100px] sm:max-h-[120px] overflow-y-auto pr-1">
                        {realSuggestions.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg hover:bg-gray-700/20 transition-colors">
                                <AlertCircle size={10} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] sm:text-xs text-gray-300 text-left">{suggestion}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ATSDashboard;