import React from 'react';
import { AchievementItem } from '../types/cvTypes';

interface AchievementsSectionProps {
    achievements: AchievementItem[];
    addAchievement: () => void;
    removeAchievement: (i: number) => void;
    updateAchievement: (i: number, field: keyof AchievementItem, value: string) => void;
    generateDescription: (index: number, ach: AchievementItem) => void;
    generating: boolean;
}

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

const AchievementsSection: React.FC<AchievementsSectionProps> = ({
    achievements,
    addAchievement,
    removeAchievement,
    updateAchievement,
    generateDescription,
    generating
}) => {
    return (
        <div className="space-y-5">
            <h2 className="text-xl font-semibold text-white mb-1 tracking-tight">
                Achievements & Awards <span className="text-sm font-normal text-gray-400">(Optional)</span>
            </h2>
            <p className="text-xs text-gray-500 mb-2">Add awards, recognition, or notable achievements. All fields are optional.</p>
            
            {achievements.map((ach, idx) => (
                <div key={`achievement-${idx}`} className="p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm text-purple-400">Achievement #{idx + 1}</span>
                        {achievements.length > 1 && (
                            <button onClick={() => removeAchievement(idx)} className="text-red-400 text-sm hover:text-red-300 transition-colors duration-300">
                                Remove
                            </button>
                        )}
                    </div>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Achievement Title (e.g., Best Developer Award 2024)" 
                            value={ach.title} 
                            onChange={e => updateAchievement(idx, 'title', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                        />
                        
                        <input 
                            type="text" 
                            placeholder="Date Received (e.g., Dec 2024)" 
                            value={ach.date} 
                            onChange={e => updateAchievement(idx, 'date', e.target.value)} 
                            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none focus:border-purple-500 transition-colors duration-300" 
                        />
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-300">Description <span className="text-gray-500">(Optional)</span></label>
                                <button 
                                    onClick={() => generateDescription(idx, ach)} 
                                    disabled={generating}
                                    className="h-11 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm tracking-tight flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:scale-98 backdrop-blur-sm border border-white/8"
                                >
                                    {generating ? (
                                        <>
                                            <AdinAILoadingIcon className="w-5 h-5" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <AdinAIIcon className="w-5 h-5" />
                                            Generate Description
                                        </>
                                    )}
                                </button>
                            </div>
                            {/* ✅ rows={6} - Same as Experience & Projects */}
                            <textarea 
                                placeholder="Describe the achievement and its impact..." 
                                value={ach.description} 
                                onChange={e => updateAchievement(idx, 'description', e.target.value)} 
                                rows={6} 
                                className="w-full p-3 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none resize-none focus:border-purple-500 transition-colors duration-300" 
                            />
                        </div>
                    </div>
                </div>
            ))}
            
            <button onClick={addAchievement} className="w-full py-3 rounded-xl border border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-gray-400 transition-all duration-300">
                + Add Achievement
            </button>
        </div>
    );
};

export default AchievementsSection;