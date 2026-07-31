import React, { useState, useRef } from 'react';
import { Eye, Activity, BarChart3 } from 'lucide-react';
import { CVPreviewProps } from './types/previewTypes';

// ✅ Import templates directly (NOT CVPreview)
import MinimalTemplate from './components/MinimalTemplate';
import ClassicTemplate from './components/ClassicTemplate';
import ModernTemplate from './components/ModernTemplate';

// Components
import CircularProgress from './components/CircularProgress';

// Hooks
import { useCVScores } from './hooks/useCVScores';
import { useATSBreakdown } from './hooks/useATSBreakdown';
import { useTemplateStyles } from './hooks/useTemplateStyles';

type TabType = 'preview' | 'health' | 'ats';

const CVPreviewMobile: React.FC<CVPreviewProps> = (props) => {
    // ============================================
    // 1. STATE - No tab selected by default
    // ============================================
    const [activeTab, setActiveTab] = useState<TabType | null>(null);
    const cvHealthRef = useRef<HTMLDivElement>(null);

    // ============================================
    // 2. HOOKS
    // ============================================
    const { sectionScores } = useCVScores({
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

    const { breakdown, weightedAverage, weakPoints } = useATSBreakdown({
        personalInfo: props.personalInfo,
        phoneNumber: props.phoneNumber,
        professionalSummary: props.professionalSummary,
        skills: props.skills,
        experiences: props.experiences,
        educations: props.educations,
        sectionScores
    });

    const { backgroundStyle } = useTemplateStyles(props.template);

    // ============================================
    // 3. RENDER TEMPLATE DIRECTLY
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
    // 4. TABS DATA
    // ============================================
    const tabs = [
        { id: 'preview' as TabType, label: 'Preview', icon: Eye },
        { id: 'health' as TabType, label: 'Health', icon: Activity },
        { id: 'ats' as TabType, label: 'ATS', icon: BarChart3 },
    ];

    // ============================================
    // 5. HANDLER - Toggle tab on/off
    // ============================================
    const handleTabClick = (tabId: TabType) => {
        if (activeTab === tabId) {
            setActiveTab(null);
        } else {
            setActiveTab(tabId);
        }
    };

    // ============================================
    // 6. RENDER - Bottom Sheet (like Cover Letter)
    // ============================================
    return (
        <>
            {/* ✅ Tabs - FIXED at bottom */}
            <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-gray-200/80 px-3 py-2 shadow-lg flex-shrink-0">
                <div className="max-w-7xl mx-auto">
                    <div className="flex gap-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabClick(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 touch-manipulation ${
                                        isActive
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                                    }`}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ✅ Tab Panel - Bottom Sheet Overlay */}
            {activeTab && (
                <div 
                    className="fixed bottom-[72px] left-0 right-0 z-20 bg-black/95 backdrop-blur-md border-t border-purple-500/20 rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300 p-4 max-h-[65vh] overflow-y-auto"
                >
                    <div className="max-w-7xl mx-auto">
                        {/* Close Handle */}
                        <div className="flex justify-center mb-3">
                            <div 
                                className="w-12 h-1 bg-purple-500/40 rounded-full cursor-pointer hover:bg-purple-500/60 transition-colors"
                                onClick={() => setActiveTab(null)}
                            />
                        </div>

                        {/* Preview Tab */}
                        {activeTab === 'preview' && (
                            <div>
                                <div className="flex items-center gap-2.5 mb-4">
                                    <Eye size={18} className="text-purple-400 flex-shrink-0" />
                                    <h3 className="text-sm font-semibold text-purple-400">
                                        Live PDF Preview
                                    </h3>
                                </div>
                                {renderTemplate()}
                            </div>
                        )}

                        {/* Health Tab */}
                        {activeTab === 'health' && (
                            <div ref={cvHealthRef}>
                                <h3 className="text-xs font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                    <span className="text-sm">📊</span> CV Health
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <CircularProgress score={sectionScores.Personal} size={55} strokeWidth={3.5} label="Personal" />
                                    <CircularProgress score={sectionScores.Experience} size={55} strokeWidth={3.5} label="Experience" />
                                    <CircularProgress score={sectionScores.Education} size={55} strokeWidth={3.5} label="Education" />
                                    <CircularProgress score={sectionScores.Skills} size={55} strokeWidth={3.5} label="Skills" />
                                    <CircularProgress score={sectionScores.Summary} size={55} strokeWidth={3.5} label="Summary" />
                                    <CircularProgress score={sectionScores.Projects} size={55} strokeWidth={3.5} label="Projects" />
                                </div>
                            </div>
                        )}

                        {/* ATS Tab */}
                        {activeTab === 'ats' && (
                            <div>
                                <h3 className="text-xs font-semibold text-purple-400 mb-4 flex items-center gap-2">
                                    <span className="text-sm">📈</span> ATS Analysis
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                                            <span>🔑 Keywords</span>
                                            <span className="text-purple-400 font-medium">{breakdown.keywords}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800/80 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                                 style={{ width: `${breakdown.keywords}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                                            <span>📐 Structure</span>
                                            <span className="text-purple-400 font-medium">{breakdown.structure}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800/80 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                                 style={{ width: `${breakdown.structure}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                                            <span>💼 Experience</span>
                                            <span className="text-purple-400 font-medium">{breakdown.experience}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800/80 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                                 style={{ width: `${breakdown.experience}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                                            <span>⚡ Skills</span>
                                            <span className="text-purple-400 font-medium">{breakdown.skills}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800/80 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                                 style={{ width: `${breakdown.skills}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                                            <span>✅ Completeness</span>
                                            <span className="text-purple-400 font-medium">{breakdown.completeness}%</span>
                                        </div>
                                        <div className="h-1.5 bg-gray-800/80 rounded-full">
                                            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" 
                                                 style={{ width: `${breakdown.completeness}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t border-purple-500/10 flex justify-between text-[11px]">
                                    <span className="text-gray-500">Weighted Average</span>
                                    <span className="text-purple-400 font-medium">{weightedAverage}%</span>
                                </div>

                                {weakPoints.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-purple-500/10">
                                        <h4 className="text-[10px] font-medium text-purple-400 mb-2 flex items-center gap-1.5">
                                            <span>💡</span> Improvement Suggestions
                                        </h4>
                                        <div className="flex flex-wrap gap-1.5">
                                            {weakPoints.map((point, i) => (
                                                <span key={i} className="text-[9px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                                                    {point}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CVPreviewMobile;