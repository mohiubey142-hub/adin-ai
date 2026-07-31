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

    // ✅ Calculate progress percentage
    const totalSteps = stepIcons.length;
    const progressPercentage = ((currentStep) / totalSteps) * 100;

    return (
        <div 
            ref={scrollContainerRef}
            className="sticky top-[52px] sm:top-[56px] lg:top-[60px] z-30 px-3 sm:px-3 lg:px-6 py-2.5 sm:py-2 lg:py-2.5 mt-2 sm:mt-0 lg:mt-0 border-b border-gray-800 bg-black/95 backdrop-blur-sm overflow-x-auto scroll-smooth stepper-scrollbar"
        >
            <div className="flex justify-between min-w-[900px] md:min-w-[800px] lg:min-w-[700px] xl:min-w-[900px] gap-6 sm:gap-1.5 lg:gap-3">
                {stepIcons.map((s, idx) => {
                    const score = getSectionScore(s.num);
                    const IconComponent = s.icon;
                    const isStepActive = isActive(s.num);
                    const showCheckmark = isCompleted(s.num);
                    
                    return (
                        <div 
                            key={s.num} 
                            className="flex items-center flex-shrink-0"
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
                                <div className="relative w-4 sm:w-3 lg:w-5 mx-1 sm:mx-0.5 lg:mx-1 flex-shrink-0">
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

            {/* ✅ Desktop Progress Bar - 6px thick with blinking purple gradient */}
            <div className="hidden lg:block relative w-full h-[6px] mt-3 bg-gray-700/50 rounded-full overflow-hidden group">
                <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700 ease-out animate-gradient-shift"
                    style={{ 
                        width: `${Math.min(progressPercentage, 100)}%`,
                        boxShadow: '0 0 20px rgba(168,85,247,0.4), 0 0 40px rgba(168,85,247,0.2)'
                    }}
                />
                {/* ✅ Subtle hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* ✅ CSS: Custom scrollbar styles + Progress Bar Animations */}
            <style>{`
                /* ✅ Progress Bar Blinking Animation */
                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                        opacity: 0.9;
                    }
                    25% {
                        opacity: 1;
                    }
                    50% {
                        background-position: 100% 50%;
                        opacity: 0.9;
                    }
                    75% {
                        opacity: 1;
                    }
                    100% {
                        background-position: 0% 50%;
                        opacity: 0.9;
                    }
                }
                .animate-gradient-shift {
                    background-size: 200% 100%;
                    animation: gradientShift 3s ease-in-out infinite;
                }

                /* Mobile scrollbar styles - 14px thick (+3px from 11px) */
                @media (max-width: 639px) {
                    .stepper-scrollbar::-webkit-scrollbar {
                        height: 14px;
                        width: 14px;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-track {
                        background: rgba(31, 41, 55, 0.5);
                        border-radius: 10px;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-thumb {
                        background: linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.8));
                        border-radius: 10px;
                        transition: all 0.3s ease;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to right, rgba(168, 85, 247, 1), rgba(59, 130, 246, 1));
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
                    }
                    .stepper-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(168, 85, 247, 0.8) rgba(31, 41, 55, 0.5);
                    }
                }
                /* Desktop scrollbar styles - unchanged */
                @media (min-width: 640px) {
                    .stepper-scrollbar::-webkit-scrollbar {
                        width: 6px;
                        height: 6px;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-track {
                        background: rgba(31, 41, 55, 0.3);
                        border-radius: 10px;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-thumb {
                        background: linear-gradient(to bottom, rgba(168, 85, 247, 0.5), rgba(59, 130, 246, 0.5));
                        border-radius: 10px;
                        transition: all 0.3s ease;
                        min-height: 30px;
                    }
                    .stepper-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: linear-gradient(to bottom, rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.8));
                        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
                    }
                    .stepper-scrollbar {
                        scrollbar-width: thin;
                        scrollbar-color: rgba(168, 85, 247, 0.5) rgba(31, 41, 55, 0.3);
                    }
                }
            `}</style>
        </div>
    );
};

export default Stepper;