import React, { useRef, useState, useEffect } from 'react';
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

// ✅ NEW: Mobile version with tabs
import CVPreviewMobile from './CVPreviewMobile';

// Utils
import { hasStringContent } from './utils/renderHelpers';

const CVPreview: React.FC<CVPreviewProps> = (props) => {
    // ============================================
    // 1. REFS
    // ============================================
    const cvHealthRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 2. STATE - Check if mobile viewport
    // ============================================
    const [isMobile, setIsMobile] = useState(false);

    // ✅ FIXED: Added dependency array to prevent infinite loop
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 640;
            setIsMobile(mobile);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []); // ✅ Empty dependency array - runs once on mount

    // ============================================
    // 3. HANDLERS
    // ============================================
    const scrollToCVHealth = () => {
        cvHealthRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };

    // ============================================
    // 4. HOOKS
    // ============================================
    
    const { sectionScores, completionPercentage: calculatedCompletion, getSectionScore } = useCVScores({
        personalInfo: props.personalInfo,
        phoneNumber: props.phoneNumber,
        experiences: props.experiences,
        educations: props.educations,
        projects: props.projects,
        skills: props.skills,
        languages: props.languages,
        certifications: props.certifications,
        achievements: props.achievements,
        professionalSummary: props.professionalSummary
    });

    const { breakdown, weightedAverage, strengthDisplay, weakPoints } = useATSBreakdown({
        personalInfo: props.personalInfo,
        phoneNumber: props.phoneNumber,
        professionalSummary: props.professionalSummary,
        skills: props.skills,
        experiences: props.experiences,
        educations: props.educations,
        sectionScores
    });

    const { backgroundStyle, getCardStyle, getHeadingStyle, getNameStyle, getTitleStyle, getContactStyle, getPhotoBorderClass, getDescriptionStyle } = useTemplateStyles(props.template);

    // ============================================
    // 5. HELPERS
    // ============================================
    const hasAbout = hasStringContent(props.professionalSummary);

    // ============================================
    // 6. RENDER TEMPLATE
    // ============================================
    const renderTemplate = () => {
        const templateProps: CVPreviewProps = {
            personalInfo: props.personalInfo,
            phoneNumber: props.phoneNumber,
            selectedCountryCode: props.selectedCountryCode,
            professionalSummary: props.professionalSummary,
            experiences: props.experiences,
            educations: props.educations,
            projects: props.projects,
            certifications: props.certifications,
            languages: props.languages,
            achievements: props.achievements,
            skills: props.skills,
            profilePhoto: props.profilePhoto,
            template: props.template,
            atsScore: props.atsScore,
            strength: props.strength,
            completionPercentage: props.completionPercentage,
            sectionStatuses: props.sectionStatuses
        };

        switch (props.template) {
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
    // 7. RENDER
    // ============================================
    
    // ✅ MOBILE: Render new mobile version with tabs
    if (isMobile) {
        return <CVPreviewMobile {...props} />;
    }

    // ✅ DESKTOP: 100% original code (unchanged)
    return (
        <div className="w-full h-full overflow-auto p-3 sm:p-3 lg:p-6" style={{ background: backgroundStyle }}>
            <div className="max-w-3xl mx-auto w-full">
                
                <div className="flex items-center gap-2.5 sm:gap-2 mb-4 sm:mb-4 md:mb-4">
                    <Eye size={18} className="text-purple-400 flex-shrink-0" />
                    <h3 className="text-sm sm:text-sm md:text-base font-semibold text-purple-400">
                        Live PDF Preview
                    </h3>
                </div>

                {renderTemplate()}

                <div className="flex flex-col items-center justify-center py-4 sm:py-4 md:py-5">
                    
                    <div className="relative group cursor-pointer px-4 py-2 sm:px-0 sm:py-0" onClick={scrollToCVHealth}>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 sm:mb-3 px-3 sm:px-3 py-1.5 sm:py-1.5 
                                        bg-gray-900/95 backdrop-blur-sm 
                                        border border-purple-500/30 rounded-lg
                                        text-[10px] sm:text-[10px] text-purple-300/80 font-medium whitespace-nowrap
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
                        className="text-[10px] sm:text-[11px] font-medium text-purple-400/70 tracking-wide mt-2 sm:mt-2 cursor-pointer 
                                   hover:text-purple-400/90 transition-colors duration-300 px-4 py-1"
                        onClick={scrollToCVHealth}
                    >
                        More Insights
                    </div>
                </div>

                <div 
                    ref={cvHealthRef}
                    id="cv-health-section"
                    className="rounded-2xl p-5 sm:p-5 md:p-5 mb-4 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl scroll-mt-4"
                >
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-4 sm:mb-4 flex items-center gap-2 sm:gap-2">
                        <span className="text-sm sm:text-base">📊</span> CV Health
                    </h3>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-4">
                        <CircularProgress score={sectionScores.Personal} size={55} strokeWidth={3.5} label="Personal" />
                        <CircularProgress score={sectionScores.Experience} size={55} strokeWidth={3.5} label="Experience" />
                        <CircularProgress score={sectionScores.Education} size={55} strokeWidth={3.5} label="Education" />
                        <CircularProgress score={sectionScores.Skills} size={55} strokeWidth={3.5} label="Skills" />
                        <CircularProgress score={sectionScores.Summary} size={55} strokeWidth={3.5} label="Summary" />
                        <CircularProgress score={sectionScores.Projects} size={55} strokeWidth={3.5} label="Projects" />
                    </div>
                </div>

                <div className="rounded-2xl p-5 sm:p-5 md:p-5 mb-4 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-4 sm:mb-4 flex items-center gap-2 sm:gap-2">
                        <span className="text-sm sm:text-base">📈</span> ATS Analysis
                    </h3>
                    <div className="space-y-3 sm:space-y-3 md:space-y-3">
                        <div>
                            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mb-1 sm:mb-1">
                                <span>🔑 Keywords</span>
                                <span className="text-purple-400 font-medium">{breakdown.keywords}%</span>
                            </div>
                            <div className="h-1.5 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.keywords}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mb-1 sm:mb-1">
                                <span>📐 Structure</span>
                                <span className="text-purple-400 font-medium">{breakdown.structure}%</span>
                            </div>
                            <div className="h-1.5 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.structure}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mb-1 sm:mb-1">
                                <span>💼 Experience</span>
                                <span className="text-purple-400 font-medium">{breakdown.experience}%</span>
                            </div>
                            <div className="h-1.5 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.experience}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mb-1 sm:mb-1">
                                <span>⚡ Skills</span>
                                <span className="text-purple-400 font-medium">{breakdown.skills}%</span>
                            </div>
                            <div className="h-1.5 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.skills}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-[11px] sm:text-xs text-gray-400 mb-1 sm:mb-1">
                                <span>✅ Completeness</span>
                                <span className="text-purple-400 font-medium">{breakdown.completeness}%</span>
                            </div>
                            <div className="h-1.5 sm:h-1.5 bg-gray-800/80 rounded-full">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                     style={{ width: `${breakdown.completeness}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-4 pt-3 sm:pt-3 border-t border-purple-500/10 flex justify-between text-[11px] sm:text-xs">
                        <span className="text-gray-500">Weighted Average</span>
                        <span className="text-purple-400 font-medium">{weightedAverage}%</span>
                    </div>
                </div>

                {weakPoints.length > 0 && (
                    <div className="rounded-2xl p-5 sm:p-5 md:p-5 mb-4 sm:mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                        <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-3 sm:mb-3 flex items-center gap-2 sm:gap-2 flex-wrap">
                            <span className="text-sm sm:text-base">💡</span> CV Improvement Suggestions 
                            <span className="text-[10px] sm:text-xs text-gray-500 ml-1.5 sm:ml-2">{weakPoints.length} items</span>
                        </h3>
                        <div className="flex flex-wrap gap-2 sm:gap-2">
                            {weakPoints.map((point, i) => (
                                <span key={i} className="text-[10px] sm:text-xs text-purple-300 bg-purple-500/10 px-2.5 sm:px-2 py-1 sm:py-1 rounded-full border border-purple-500/20">
                                    {point}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

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