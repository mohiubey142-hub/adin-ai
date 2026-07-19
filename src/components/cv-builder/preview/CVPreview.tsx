import React, { useRef } from 'react';
import { ChevronsDown, Eye } from 'lucide-react';
import { CVPreviewProps } from './types/previewTypes';

// Hooks
import { useCVScores } from './hooks/useCVScores';
import { useATSBreakdown } from './hooks/useATSBreakdown';
import { useTemplateStyles } from './hooks/useTemplateStyles';

// Components
import CircularProgress from './components/CircularProgress';
import MinimalTemplate from './components/MinimalTemplate';
import ClassicTemplate from './components/ClassicTemplate';
import ModernTemplate from './components/ModernTemplate';

// Utils
import { hasStringContent } from './utils/renderHelpers';

const CVPreview: React.FC<CVPreviewProps> = ({
    personalInfo,
    phoneNumber,
    selectedCountryCode,
    professionalSummary,
    experiences,
    educations,
    projects,
    certifications,
    languages,
    achievements,
    skills,
    profilePhoto,
    template,
    atsScore,
    strength,
    completionPercentage,
    sectionStatuses
}) => {
    // ============================================
    // 1. REFS
    // ============================================
    const cvHealthRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 2. HANDLERS
    // ============================================
    const scrollToCVHealth = () => {
        cvHealthRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    // ============================================
    // 3. HOOKS
    // ============================================
    
    // Calculate scores
    const { sectionScores, completionPercentage: calculatedCompletion, getSectionScore } = useCVScores({
        personalInfo,
        phoneNumber,
        experiences,
        educations,
        projects,
        skills,
        languages,
        certifications,
        achievements,
        professionalSummary
    });

    // Calculate ATS breakdown
    const { breakdown, weightedAverage, strengthDisplay, weakPoints } = useATSBreakdown({
        personalInfo,
        phoneNumber,
        professionalSummary,
        skills,
        experiences,
        educations,
        sectionScores
    });

    // Get template styles
    const { backgroundStyle, getCardStyle, getHeadingStyle, getNameStyle, getTitleStyle, getContactStyle, getPhotoBorderClass, getDescriptionStyle } = useTemplateStyles(template);

    // ============================================
    // 4. HELPERS
    // ============================================
    const hasAbout = hasStringContent(professionalSummary);

    // ============================================
    // 5. RENDER TEMPLATE
    // ============================================
    const renderTemplate = () => {
        const templateProps: CVPreviewProps = {
            personalInfo,
            phoneNumber,
            selectedCountryCode,
            professionalSummary,
            experiences,
            educations,
            projects,
            certifications,
            languages,
            achievements,
            skills,
            profilePhoto,
            template,
            atsScore,
            strength,
            completionPercentage,
            sectionStatuses
        };

        switch (template) {
            case 'minimal':
                return <MinimalTemplate {...templateProps} />;
            case 'classic':
                return <ClassicTemplate {...templateProps} />;
            case 'modern':
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    // ============================================
    // 6. RENDER
    // ============================================
    return (
        // ✅ Mobile optimized: reduced padding
        <div className="w-full h-full overflow-auto p-2 sm:p-3 lg:p-6" style={{ background: backgroundStyle }}>
            <div className="max-w-3xl mx-auto w-full">
                
                {/* ✅ NEW: Live PDF Preview Header - Removed Score Bar */}
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <Eye size={18} className="text-purple-400" />
                    <h3 className="text-sm sm:text-base font-semibold text-purple-400">
                        Live PDF Preview
                    </h3>
                </div>

                {/* Live Resume Preview */}
                {renderTemplate()}

                {/* ✅ PREMIUM SCROLL INDICATOR - Mobile optimized */}
                <div className="flex flex-col items-center justify-center py-3 sm:py-4 lg:py-5">
                    
                    {/* Clickable Arrow Container with Tooltip */}
                    <div className="relative group cursor-pointer" onClick={scrollToCVHealth}>
                        {/* Tooltip - Mobile optimized */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 sm:mb-3 px-2 sm:px-3 py-1 sm:py-1.5 
                                        bg-gray-900/95 backdrop-blur-sm 
                                        border border-purple-500/30 rounded-lg
                                        text-[8px] sm:text-[10px] text-purple-300/80 font-medium whitespace-nowrap
                                        opacity-0 group-hover:opacity-100 
                                        transition-opacity duration-300 ease-out pointer-events-none
                                        shadow-lg shadow-purple-500/10">
                            Scroll to Insights
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 
                                            w-2 h-2 bg-gray-900/95 border-r border-b border-purple-500/30 
                                            rotate-45" />
                        </div>
                        
                        <div className="relative animate-arrow-bounce 
                                        transition-transform duration-300 ease-out
                                        group-hover:scale-105">
                            
                            <div className="absolute inset-0 rounded-full blur-xl bg-purple-500/20 -z-10 scale-150 
                                            group-hover:bg-purple-500/35 transition-all duration-500" />
                            <div className="absolute inset-0 rounded-full blur-lg bg-purple-400/10 -z-10 scale-125 
                                            group-hover:bg-purple-400/20 transition-all duration-500" />
                            
                            <ChevronsDown 
                                size={20}
                                className="text-purple-400 
                                           drop-shadow-[0_0_12px_rgba(168,85,247,0.3)]
                                           group-hover:drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]
                                           transition-all duration-500"
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>
                    
                    <div 
                        className="text-[9px] sm:text-[11px] font-medium text-purple-400/70 tracking-wide mt-1.5 sm:mt-2 cursor-pointer 
                                   hover:text-purple-400/90 transition-colors duration-300"
                        onClick={scrollToCVHealth}
                    >
                        More Insights
                    </div>
                </div>

                {/* CV Health Cards - Mobile optimized */}
                <div 
                    ref={cvHealthRef}
                    id="cv-health-section"
                    className="rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl scroll-mt-4"
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-base">📊</span> CV Health
                    </h3>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        <CircularProgress score={sectionScores.Personal} size={55} strokeWidth={3.5} label="Personal" />
                        <CircularProgress score={sectionScores.Experience} size={55} strokeWidth={3.5} label="Experience" />
                        <CircularProgress score={sectionScores.Education} size={55} strokeWidth={3.5} label="Education" />
                        <CircularProgress score={sectionScores.Skills} size={55} strokeWidth={3.5} label="Skills" />
                        <CircularProgress score={sectionScores.Summary} size={55} strokeWidth={3.5} label="Summary" />
                        <CircularProgress score={sectionScores.Projects} size={55} strokeWidth={3.5} label="Projects" />
                    </div>
                </div>

                {/* ATS Analysis Cards - Mobile optimized */}
                <div className="rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-base">📈</span> ATS Analysis
                    </h3>
                    <div className="space-y-2 sm:space-y-3">
                        <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                <span>🔑 Keywords</span>
                                <span className="text-purple-400">{breakdown.keywords}%</span>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.keywords}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                <span>📐 Structure</span>
                                <span className="text-purple-400">{breakdown.structure}%</span>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.structure}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                <span>💼 Experience</span>
                                <span className="text-purple-400">{breakdown.experience}%</span>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.experience}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                <span>⚡ Skills</span>
                                <span className="text-purple-400">{breakdown.skills}%</span>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.skills}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">
                                <span>✅ Completeness</span>
                                <span className="text-purple-400">{breakdown.completeness}%</span>
                            </div>
                            <div className="h-1 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.completeness}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-purple-500/10 flex justify-between text-[10px] sm:text-xs">
                        <span className="text-gray-500">Weighted Average</span>
                        <span className="text-purple-400 font-medium">{weightedAverage}%</span>
                    </div>
                </div>

                {/* CV Improvement Suggestions - Mobile optimized */}
                {weakPoints.length > 0 && (
                    <div className="rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                        <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base">💡</span> CV Improvement Suggestions 
                            <span className="text-[8px] sm:text-xs text-gray-500 ml-1 sm:ml-2">{weakPoints.length} items</span>
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {weakPoints.map((point, i) => (
                                <span key={i} className="text-[9px] sm:text-xs text-purple-300 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border border-purple-500/20">
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ✅ PREMIUM ANIMATION CSS */}
            <style>{`
                @keyframes arrowBounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(6px);
                    }
                }
                .animate-arrow-bounce {
                    animation: arrowBounce 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CVPreview;