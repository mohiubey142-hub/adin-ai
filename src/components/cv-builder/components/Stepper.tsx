import React from 'react';

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
    const isActive = (step: number) => currentStep === step;
    const isCompleted = (step: number) => {
        return hasSectionData(step) && isSectionComplete(step) && !isActive(step);
    };

    return (
        // ✅ Mobile optimized: reduced top value, smaller padding
        <div className="sticky top-[52px] sm:top-[56px] lg:top-[60px] z-30 px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 border-b border-gray-800 bg-black/95 backdrop-blur-sm overflow-x-auto">
            <div className="flex justify-between min-w-max gap-1 sm:gap-1.5 lg:gap-3">
                {stepIcons.map((s, idx) => {
                    const score = getSectionScore(s.num);
                    const IconComponent = s.icon;
                    const isStepActive = isActive(s.num);
                    const showCheckmark = isCompleted(s.num);
                    
                    return (
                        <div key={s.num} className="flex items-center">
                            <div 
                                onClick={() => onStepClick(s.num)} 
                                className="relative text-center cursor-pointer min-w-[32px] sm:min-w-[40px] lg:min-w-[56px] group transition-all duration-300 hover:scale-110 touch-manipulation"
                            >
                                {isStepActive && (
                                    <>
                                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-20 animate-ping" />
                                        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 opacity-10 animate-ping" style={{ animationDelay: '0.4s' }} />
                                    </>
                                )}
                                
                                <div className={`relative w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center mx-auto transition-all duration-300 ${
                                    isStepActive 
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/40 scale-110 ring-2 ring-purple-400/30 ring-offset-2 ring-offset-black' 
                                        : showCheckmark
                                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-400/20 ring-offset-1 ring-offset-black'
                                            : 'bg-gray-800/80 text-gray-500 border border-purple-500/15 group-hover:bg-gray-700/80 group-hover:scale-110 group-hover:text-gray-300 group-hover:border-purple-500/30'
                                }`}>
                                    {showCheckmark ? (
                                        <svg className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <IconComponent size={isStepActive ? 14 : 12} className="transition-all duration-300 flex-shrink-0 sm:size-[14px] lg:size-[16px]" />
                                    )}
                                </div>
                                
                                <div className={`text-[6px] sm:text-[7px] lg:text-[9px] mt-0.5 sm:mt-1 transition-all duration-300 font-medium tracking-wide ${
                                    isStepActive ? 'text-purple-400 font-semibold' : 
                                    showCheckmark ? 'text-green-400' :
                                    'text-gray-500 group-hover:text-gray-300'
                                }`}>
                                    <span className="hidden sm:inline">{s.name}</span>
                                    <span className="sm:hidden"><IconComponent size={8} /></span>
                                </div>
                            </div>
                            
                            {idx < stepIcons.length - 1 && (
                                <div className="relative w-2 sm:w-3 lg:w-5 mx-0.5 sm:mx-0.5 lg:mx-1">
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
        </div>
    );
};

export default Stepper;