import React, { useRef, useEffect } from 'react';

// ✅ FIXED: Sahi path for constants/
import { stepIcons } from '../constants/stepConfig';

interface StepperProps {
    currentStep: number;
    onStepClick: (step: number) => void;
    getSectionScore: (step: number) => number;
    isSectionComplete: (step: number) => boolean;
    hasSectionData: (step: number) => boolean;
}

const Stepper: React.FC<StepperProps> = ({
    currentStep,
    onStepClick,
    getSectionScore,
    isSectionComplete,
    hasSectionData
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    const isActive = (step: number) => currentStep === step;
    const isCompleted = (step: number) => {
        return hasSectionData(step) && isSectionComplete(step) && !isActive(step);
    };

    // ✅ AUTO-SCROLL: Active step ko visible karo
    useEffect(() => {
        const activeStepElement = stepRefs.current[currentStep];
        if (activeStepElement && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const stepElement = activeStepElement;
            
            const containerWidth = container.offsetWidth;
            const stepOffset = stepElement.offsetLeft;
            const stepWidth = stepElement.offsetWidth;
            
            const scrollTo = stepOffset - (containerWidth / 2) + (stepWidth / 2);
            
            container.scrollTo({
                left: Math.max(0, scrollTo),
                behavior: 'smooth'
            });
        }
    }, [currentStep]);

    return (
        // ✅ Mobile: scrollbar hidden, artificial scrollbar added
        <div className="sticky top-[52px] sm:top-[56px] lg:top-[60px] z-30 px-3 sm:px-3 lg:px-6 py-2.5 sm:py-2 lg:py-2.5 mt-2 sm:mt-0 lg:mt-0 border-b border-gray-800 bg-black/95 backdrop-blur-sm overflow-x-auto scroll-smooth scrollbar-hide">
            
            {/* Steps Container */}
            <div className="flex justify-between min-w-max gap-6 sm:gap-1.5 lg:gap-3">
                {stepIcons.map((s, idx) => {
                    const score = getSectionScore(s.num);
                    const IconComponent = s.icon;
                    const isStepActive = isActive(s.num);
                    const showCheckmark = isCompleted(s.num);
                    
                    return (
                        <div 
                            key={s.num} 
                            className="flex items-center"
                            ref={(el) => {
                                stepRefs.current[s.num] = el;
                            }}
                        >
                            <div 
                                onClick={() => onStepClick(s.num)} 
                                className="relative text-center cursor-pointer min-w-[44px] sm:min-w-[40px] lg:min-w-[56px] group transition-all duration-300 hover:scale-110 touch-manipulation"
                            >
                                {isStepActive && (
                                    <>
                                        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-20 animate-ping" />
                                        <div className="absolute -inset-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-10 animate-ping" style={{ animationDelay: '0.4s' }} />
                                    </>
                                )}
                                
                                <div className={`relative w-8.5 h-8.5 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                                    isStepActive 
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/40 scale-110 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-black' 
                                        : showCheckmark
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20 ring-offset-1 ring-offset-black'
                                            : 'bg-gray-800/80 text-gray-500 border border-purple-500/15 group-hover:bg-gray-700/80 group-hover:scale-110 group-hover:text-gray-300 group-hover:border-purple-500/30'
                                }`}>
                                    {showCheckmark ? (
                                        <svg className="w-4.5 h-4.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <IconComponent size={isStepActive ? 17 : 15} className="transition-all duration-300 flex-shrink-0 sm:size-[14px] lg:size-[16px]" />
                                    )}
                                </div>
                                
                                <div className={`text-[10px] sm:text-[7px] lg:text-[9px] mt-1 sm:mt-1 transition-all duration-300 font-medium tracking-wide ${
                                    isStepActive ? 'text-purple-400 font-semibold' : 
                                    showCheckmark ? 'text-green-400' :
                                    'text-gray-500 group-hover:text-gray-300'
                                }`}>
                                    <span className="hidden sm:inline">{s.name}</span>
                                    <span className="sm:hidden"><IconComponent size={9.5} /></span>
                                </div>
                            </div>
                            
                            {idx < stepIcons.length - 1 && (
                                <div className="relative w-4 sm:w-3 lg:w-5 mx-1 sm:mx-0.5 lg:mx-1">
                                    <div className={`h-0.5 w-full transition-all duration-500 ${
                                        currentStep > s.num 
                                            ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]' 
                                            : currentStep === s.num
                                                ? 'bg-gradient-to-r from-purple-500/50 to-blue-500/50 shadow-[0_0_6px_rgba(168,85,247,0.3)]'
                                                : 'bg-gray-700'
                                    }`}>
                                        {currentStep >= s.num && (
                                            <div className={`absolute inset-0 blur-[3px] ${
                                                currentStep > s.num 
                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 opacity-50' 
                                                    : 'bg-gradient-to-r from-purple-500/30 to-blue-500/30 opacity-30'
                                            }`} />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ✅ Artificial Scrollbar - Mobile only, permanent full width */}
            <div className="sm:hidden relative w-full h-1 mt-3 bg-gray-700/50 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ 
                        width: `${((currentStep - 1) / (stepIcons.length - 1)) * 100}%`,
                        boxShadow: '0 0 12px rgba(168,85,247,0.4)'
                    }}
                />
            </div>

            {/* ✅ CSS: Hide scrollbar on mobile only */}
            <style>{`
                /* Hide scrollbar on mobile (sm: and below) */
                @media (max-width: 639px) {
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                }
                /* Desktop scrollbar styles (unchanged) */
                @media (min-width: 640px) {
                    .scrollbar-hide::-webkit-scrollbar {
                        width: 4px;
                        height: 4px;
                    }
                    .scrollbar-hide::-webkit-scrollbar-track {
                        background: rgba(31, 41, 55, 0.5);
                        border-radius: 10px;
                    }
                    .scrollbar-hide::-webkit-scrollbar-thumb {
                        background: linear-gradient(to bottom, rgba(168, 85, 247, 0.6), rgba(59, 130, 246, 0.6));
                        border-radius: 10px;
                        transition: all 0.3s ease;
                    }
                    .scrollbar-hide::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to bottom, rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.8));
                    }
                    .scrollbar-hide {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(168, 85, 247, 0.6) rgba(31, 41, 55, 0.5);
                    }
                }
            `}</style>
        </div>
    );
};

export default Stepper;