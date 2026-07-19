import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  AlertCircle, X
} from 'lucide-react';

// Types
import { CVBuilderProps } from './types/cvTypes';

// Constants
import { countryCodes } from './constants/cvDefaults';
import { defaultPersonalInfo } from './constants/cvDefaults';

// Utils (cv-builder ke andar wale)
import { loadSavedData } from './utils/storageUtils';
import { validatePhoneNumber } from './utils/phoneValidation';
import { initializeAI } from './utils/aiGenerators';
import { getStrengthStatus } from './utils/atsCalculator';

// ✅ FIXED: pdfGeneratorText cv-builder/utils/ se import (local)
import { generateTextPDF } from './utils/pdfGeneratorText';

// Hooks
import { useSections } from './hooks/useSections';
import { useAutoSave } from './hooks/useAutoSave';
import { useValidation } from './hooks/useValidation';
import { useScoreCalculation } from './hooks/useScoreCalculation';

// Handlers
import { createNavigationActions } from './handlers/navigationActions';
import { createCVActions } from './handlers/cvActions';
import { createAIActions } from './handlers/aiActions';
import { createDownloadActions } from './handlers/downloadActions';

// Components
import HeaderToolbar from './components/HeaderToolbar';
import TemplateSelector from './components/TemplateSelector';
import Stepper from './components/Stepper';
import ATSDashboard from './components/ATSDashboard';
import AIEnhancerPanel from './components/AIEnhancerPanel';
import DownloadButtons from './components/DownloadButtons';
import SuccessCard from './components/SuccessCard';

// Sections
import PersonalSection from './sections/PersonalSection';
import ExperienceSection from './sections/ExperienceSection';
import EducationSection from './sections/EducationSection';
import ProjectsSection from './sections/ProjectsSection';
import SkillsSection from './sections/SkillsSection';
import CertificationsSection from './sections/CertificationsSection';
import LanguagesSection from './sections/LanguagesSection';
import AchievementsSection from './sections/AchievementsSection';
import SummarySection from './sections/SummarySection';

// Preview
import CVPreview from './preview/CVPreview';

// ✅ NEW: Feedback Modal & Widget
import FeedbackModal from '../../components/feedback/FeedbackModal';
import FeedbackWidget from '../../components/feedback/FeedbackWidget';
import { 
  shouldShowFeedback, 
  markFeedbackCompleted, 
  markFeedbackShown, 
  markFeedbackSkipped, 
  resetFeedbackModal,
  getWidgetVisibility,
  setWidgetVisibility,
  minimizeToWidget,
  closeWidget
} from '../../services/feedbackService';

// ✅ UPDATED: Props now include initialTemplateId and onBackToHome
const CVBuilder: React.FC<CVBuilderProps> = ({ userId, initialTemplateId, onBackToHome }) => {
    // ============================================
    // 1. LOAD SAVED DATA
    // ============================================
    const savedData = loadSavedData(userId);
    
    // ============================================
    // 2. LOCAL STATE
    // ============================================
    const [step, setStep] = useState(() => savedData?.step || 1);
    
    // ✅ FIXED: Template state with initialTemplateId override
    // Supported templates: modern, classic, minimal, executive, creative, academic
    const validTemplates = ['modern', 'classic', 'minimal', 'executive', 'creative', 'academic'];
    
    const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic'>(() => {
        // 1️⃣ FIRST: Check if initialTemplateId is provided (from Gallery)
        if (initialTemplateId && validTemplates.includes(initialTemplateId)) {
            return initialTemplateId as any;
        }
        // 2️⃣ SECOND: Check if savedData has a template
        if (savedData?.template && validTemplates.includes(savedData.template)) {
            return savedData.template;
        }
        // 3️⃣ DEFAULT: 'modern'
        return 'modern';
    });
    
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasReachedPreview, setHasReachedPreview] = useState(() => savedData?.hasReachedPreview || false);
    const [showSuccessCard, setShowSuccessCard] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiGenerating, setAiGenerating] = useState<string | null>(null);
    const [aiEnhancerLoading, setAiEnhancerLoading] = useState<string | null>(null);
    const [originalSummary, setOriginalSummary] = useState<string>('');
    const [isEnhancerUsed, setIsEnhancerUsed] = useState<boolean>(false);
    const [selectedProvider, setSelectedProvider] = useState<string>(() => savedData?.selectedProvider || 'openrouter');
    
    // ✅ NEW: Feedback Modal & Widget State
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedbackSourceKey, setFeedbackSourceKey] = useState('cv-builder');
    
    // ✅ NEW: Widget visibility state (restore from localStorage)
    const [showWidget, setShowWidget] = useState(() => {
        return getWidgetVisibility('cv-builder');
    });
    
    // Personal Info State
    const [personalInfo, setPersonalInfo] = useState(() => {
        if (savedData?.personalInfo) {
            return { ...defaultPersonalInfo, ...savedData.personalInfo };
        }
        return { ...defaultPersonalInfo };
    });
    
    const [professionalSummary, setProfessionalSummary] = useState(() => savedData?.professionalSummary || '');
    const [selectedCountryCode, setSelectedCountryCode] = useState(() => savedData?.selectedCountryCode || 'PK');
    const [phoneNumber, setPhoneNumber] = useState(() => savedData?.phoneNumber || '');
    const [profilePhoto, setProfilePhoto] = useState<string | null>(() => savedData?.profilePhoto || null);
    
    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    
    // ============================================
    // 3. SECTIONS HOOK
    // ============================================
    const sections = useSections(savedData);
    const {
        experiences, setExperiences,
        addExperience, removeExperience, updateExperience,
        educations, setEducations,
        addEducation, removeEducation, updateEducation,
        projects, setProjects,
        addProject, removeProject, updateProject,
        certifications, setCertifications,
        addCertification, removeCertification, updateCertification,
        languages, setLanguages,
        addLanguage, removeLanguage, updateLanguage,
        achievements, setAchievements,
        addAchievement, removeAchievement, updateAchievement,
    } = sections;
    
    const [skills, setSkills] = useState(() => savedData?.skills || '');
    
    // ============================================
    // 4. VALIDATION HOOK
    // ============================================
    const validation = useValidation(
        personalInfo,
        phoneNumber,
        selectedCountryCode,
        experiences,
        educations,
        projects,
        skills,
        certifications,
        languages,
        achievements,
        professionalSummary
    );
    const {
        sectionStatuses,
        phoneError,
        errors,
        setErrors,
        validationErrors,
        setValidationErrors,
        clearValidationErrors,
        areRequiredSectionsComplete,
        validateStep
    } = validation;
    
    // ============================================
    // 5. SCORE CALCULATION HOOK
    // ============================================
    const scores = useScoreCalculation(
        personalInfo,
        phoneNumber,
        experiences,
        educations,
        projects,
        skills,
        languages,
        certifications,
        achievements,
        professionalSummary,
        selectedCountryCode
    );
    const {
        realWeightedAverage,
        realCompletionPercentage,
        realBreakdown,
        realQuality,
        realSuggestions,
        getScoreColor,
        getScoreBg
    } = scores;
    
    // ============================================
    // 6. AUTO-SAVE HOOK
    // ============================================
    const { saveStatus } = useAutoSave(userId, {
        personalInfo,
        professionalSummary,
        experiences,
        educations,
        skills,
        selectedCountryCode,
        phoneNumber,
        step,
        template,
        projects,
        certifications,
        languages,
        achievements,
        profilePhoto,
        hasReachedPreview,
        selectedProvider
    }, [
        personalInfo,
        professionalSummary,
        experiences,
        educations,
        skills,
        selectedCountryCode,
        phoneNumber,
        step,
        template,
        projects,
        certifications,
        languages,
        achievements,
        profilePhoto,
        hasReachedPreview,
        selectedProvider
    ]);
    
    // ============================================
    // 7. NAVIGATION ACTIONS
    // ============================================
    const navigation = createNavigationActions(
        step,
        setStep,
        setHasReachedPreview,
        personalInfo,
        phoneNumber,
        selectedCountryCode,
        educations,
        skills,
        experiences,
        hasReachedPreview,
        areRequiredSectionsComplete,
        validateStep
    );
    const { navigateToStep, nextStep, prevStep } = navigation;
    
    // ============================================
    // 8. CV ACTIONS
    // ============================================
    const cvActions = createCVActions(
        userId,
        setPersonalInfo,
        setProfessionalSummary,
        setExperiences,
        setEducations,
        setSkills,
        setProjects,
        setCertifications,
        setLanguages,
        setAchievements,
        setProfilePhoto,
        setSelectedCountryCode,
        setPhoneNumber,
        setStep,
        setTemplate,
        setHasReachedPreview,
        setShowSuccessCard,
        setErrors,
        setValidationErrors,
        setIsEnhancerUsed,
        setOriginalSummary,
        professionalSummary,
        originalSummary,
        isEnhancerUsed
    );
    const { clearAllData, restoreOriginalSummary, updatePersonalInfo, handlePhoneChange, handlePhotoUpload } = cvActions;
    
    // ============================================
    // 9. AI ACTIONS - ✅ FIXED: applyAIEnhancement added
    // ============================================
    const aiActions = createAIActions(
        personalInfo,
        experiences,
        educations,
        projects,
        skills,
        certifications,
        achievements,
        professionalSummary,
        setProfessionalSummary,
        setExperiences,
        setSkills,
        setProjects,
        setAchievements,
        setGenerating,
        setAiGenerating,
        setAiEnhancerLoading,
        setIsEnhancerUsed,
        setOriginalSummary,
        originalSummary,
        isEnhancerUsed
    );
    const {
        enhanceSkills,
        expandSkills,
        handleAIGenerateSummary,
        handleAIGenerateExperience,
        generateDescriptionForField,
        applyAIEnhancement
    } = aiActions;
    
    // ============================================
    // 10. DOWNLOAD ACTIONS - WITH FEEDBACK TRIGGER
    // ============================================
    
    // ✅ STEP 1: Define downloadActions FIRST
    const downloadActions = createDownloadActions(
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
        template,
        profilePhoto
    );
    
    // ✅ STEP 2: Extract functions from downloadActions
    const { downloadPDF, downloadTXT, copyCV } = downloadActions;
    
    // ✅ STEP 3: Create wrapper functions with feedback - FEATURE-SPECIFIC
    const handleDownloadPDF = async () => {
        // ✅ FEATURE-SPECIFIC: Pass 'cv-builder' source
        const shouldShow = shouldShowFeedback('cv-builder');
        
        // Download PDF
        await downloadPDF();
        
        // ✅ Show feedback modal if should show
        if (shouldShow) {
            setFeedbackSourceKey('cv-builder');
            // Small delay to let PDF download start
            setTimeout(() => {
                setShowFeedbackModal(true);
            }, 500);
        }
    };
    
    const handleDownloadTXT = async () => {
        await downloadTXT();
    };
    
    const handleCopyCV = async () => {
        await copyCV();
    };
    
    // ✅ NEW: Feedback Widget Handlers
    const handleMinimize = () => {
        setShowFeedbackModal(false);
        minimizeToWidget('cv-builder');
        setShowWidget(true);
    };
    
    const handleOpenFromWidget = () => {
        setShowWidget(false);
        setShowFeedbackModal(true);
    };
    
    const handleCloseWidget = () => {
        closeWidget('cv-builder');
        setShowWidget(false);
    };
    
    // ============================================
    // 11. FULLSCREEN TOGGLE
    // ============================================
    const toggleFullscreen = async () => {
        try {
            if (!isFullscreen) {
                await containerRef.current?.requestFullscreen();
                setIsFullscreen(true);
            } else {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        } catch (err) {
            toast.error('Fullscreen not supported');
        }
    };
    
    useEffect(() => {
        const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);
    
    // ============================================
    // 12. INIT AI
    // ============================================
    useEffect(() => {
        try {
            initializeAI();
        } catch (error) {
            console.error('AI initialization failed:', error);
        }
    }, []);
    
    // ============================================
    // 13. HELPER FUNCTIONS
    // ============================================
    const hasSectionData = (stepNum: number): boolean => {
        switch(stepNum) {
            case 1: return !!(personalInfo.name?.trim() && personalInfo.title?.trim() && personalInfo.email?.trim() && phoneNumber);
            case 2: return experiences.some(e => e.title?.trim() && e.company?.trim());
            case 3: return educations.some(e => e.degree?.trim() && e.institution?.trim());
            case 4: return languages.some(l => l.language?.trim() && l.proficiency?.trim());
            case 5: return !!skills.trim();
            case 6: return certifications.some(c => c.name?.trim());
            case 7: return projects.some(p => p.name?.trim() && p.description?.trim());
            case 8: return achievements.some(a => a.title?.trim() && a.description?.trim());
            case 9: return !!professionalSummary.trim();
            case 10: return areRequiredSectionsComplete();
            default: return false;
        }
    };
    
    const isSectionComplete = (stepNum: number): boolean => {
        if (stepNum === 10) return areRequiredSectionsComplete();
        if (stepNum === 6) return certifications.some(c => c.name?.trim());
        return sectionStatuses[stepNum]?.isComplete || false;
    };
    
    const getSectionScore = (stepNum: number): number => {
        if (stepNum === 10) return 100;
        return sectionStatuses[stepNum]?.score || 0;
    };
    
    // ============================================
    // 14. SECTION PROPS
    // ============================================
    const skillsSectionProps = {
        skills,
        setSkills,
        enhanceSkills,
        expandSkills,
        generating,
        personalInfo
    };
    
    const experienceSectionProps = {
        experiences,
        addExperience,
        removeExperience,
        updateExperience,
        generateDescription: (index: number, exp: any) => generateDescriptionForField('experience', index, exp),
        generateAI: (index: number, exp: any) => handleAIGenerateExperience(index, exp),
        aiGenerating,
        generating
    };
    
    const projectSectionProps = {
        projects,
        addProject,
        removeProject,
        updateProject,
        generateDescription: (index: number, proj: any) => generateDescriptionForField('project', index, proj),
        generating
    };
    
    const achievementSectionProps = {
        achievements,
        addAchievement,
        removeAchievement,
        updateAchievement,
        generateDescription: (index: number, ach: any) => generateDescriptionForField('achievement', index, ach),
        generating
    };
    
    const personalSectionProps = {
        personalInfo,
        updatePersonalInfo: (field: string, value: string) => updatePersonalInfo(field, value, setErrors, errors),
        selectedCountryCode,
        setSelectedCountryCode,
        phoneNumber,
        handlePhoneChange: (value: string) => handlePhoneChange(value, setErrors, errors),
        profilePhoto,
        fileInputRef,
        handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => handlePhotoUpload(e, setProfilePhoto),
        handleChangePhoto: () => fileInputRef.current?.click(),
        errors,
        phoneError
    };
    
    // ============================================
    // 15. RENDER
    // ============================================
    return (
        <div ref={containerRef} className="h-full flex flex-col bg-black">
            {/* Toaster */}
            <Toaster
                position="top-center"
                reverseOrder={false}
                gutter={8}
                containerStyle={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 999999,
                    pointerEvents: 'none',
                }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        padding: '16px 24px',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(10px)',
                        pointerEvents: 'auto',
                        maxWidth: '500px',
                        width: 'auto',
                    },
                    success: {
                        style: {
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                        },
                    },
                    error: {
                        style: {
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                        },
                    },
                    loading: {
                        style: {
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                        },
                    },
                }}
            />
            
            {/* Scrollbar Styles */}
            <style>{`
                ::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: rgba(31, 41, 55, 0.5);
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, rgba(168, 85, 247, 0.6), rgba(59, 130, 246, 0.6));
                    border-radius: 10px;
                    transition: all 0.3s ease;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, rgba(168, 85, 247, 0.8), rgba(59, 130, 246, 0.8));
                }
                * {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(168, 85, 247, 0.6) rgba(31, 41, 55, 0.5);
                }
                .overflow-auto, .overflow-y-auto, .overflow-x-auto {
                    scroll-behavior: smooth;
                }
            `}</style>
            
            {/* Validation Errors Toast */}
            {validationErrors.length > 0 && step !== 10 && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 backdrop-blur-md border border-red-400/50 shadow-2xl animate-in slide-in-from-top fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <AlertCircle size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Validation Error</p>
                            <p className="text-xs text-white/80">{validationErrors[0]}</p>
                        </div>
                        <button 
                            onClick={clearValidationErrors}
                            className="ml-2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                        >
                            <X size={14} className="text-white" />
                        </button>
                    </div>
                </div>
            )}
            
            {/* ✅ Header - with onBackToTemplates */}
            <HeaderToolbar
                onClearAll={clearAllData}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                saveStatus={saveStatus}
                onBackToTemplates={onBackToHome}
            />
            
            {/* ✅ FIXED: Stepper ko uper karo - TemplateSelector se pehle */}
            <Stepper
                currentStep={step}
                onStepClick={navigateToStep}
                getSectionScore={getSectionScore}
                isSectionComplete={isSectionComplete}
                hasSectionData={hasSectionData}
            />
            
            {/* ✅ FIXED: Template Selector - Sirf direct Builder flow me show ho */}
            {!initialTemplateId && (
                <TemplateSelector
                    template={template}
                    onTemplateChange={setTemplate}
                />
            )}
            
            {/* ✅ FIXED: Main Content - Mobile height fix for form visibility */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* ✅ Left Panel - Mobile: min-height to ensure form visibility */}
                <div className="w-full lg:w-1/2 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8 border-r border-gray-800 min-h-[50vh] lg:min-h-0">
                    {step === 1 && <PersonalSection {...personalSectionProps} />}
                    {step === 2 && <ExperienceSection {...experienceSectionProps} />}
                    {step === 3 && (
                        <EducationSection
                            educations={educations}
                            addEducation={addEducation}
                            removeEducation={removeEducation}
                            updateEducation={updateEducation}
                        />
                    )}
                    {step === 4 && (
                        <LanguagesSection
                            languages={languages}
                            addLanguage={addLanguage}
                            removeLanguage={removeLanguage}
                            updateLanguage={updateLanguage}
                        />
                    )}
                    {step === 5 && <SkillsSection {...skillsSectionProps} />}
                    {step === 6 && (
                        <CertificationsSection
                            certifications={certifications}
                            addCertification={addCertification}
                            removeCertification={removeCertification}
                            updateCertification={updateCertification}
                        />
                    )}
                    {step === 7 && <ProjectsSection {...projectSectionProps} />}
                    {step === 8 && <AchievementsSection {...achievementSectionProps} />}
                    {step === 9 && (
                        <SummarySection
                            professionalSummary={professionalSummary}
                            setProfessionalSummary={setProfessionalSummary}
                            generateSummary={() => generateDescriptionForField('summary')}
                            generateAISummary={handleAIGenerateSummary}
                            generating={generating}
                            aiGenerating={aiGenerating}
                            personalInfo={personalInfo}
                            experiences={experiences}
                            skills={skills}
                        />
                    )}
                    
                    {step === 10 && (
                        <div className="text-center py-0 space-y-4 sm:space-y-5">
                            {/* ATS Dashboard */}
                            <ATSDashboard
                                realWeightedAverage={realWeightedAverage}
                                realCompletionPercentage={realCompletionPercentage}
                                realBreakdown={realBreakdown}
                                realQuality={realQuality}
                                realSuggestions={realSuggestions}
                                getScoreColor={getScoreColor}
                                getScoreBg={getScoreBg}
                            />
                            
                            {/* Success Card */}
                            {areRequiredSectionsComplete() && (
                                <SuccessCard
                                    realWeightedAverage={realWeightedAverage}
                                    realCompletionPercentage={realCompletionPercentage}
                                    realQuality={realQuality}
                                />
                            )}
                            
                            {/* AI Enhancer Panel */}
                            <AIEnhancerPanel
                                onApplyEnhancement={applyAIEnhancement}
                                onRestoreOriginal={restoreOriginalSummary}
                                onGenerateSummary={handleAIGenerateSummary}
                                onEnhanceExperience={() => {
                                    if (experiences.length > 0) {
                                        handleAIGenerateExperience(0, experiences[0]);
                                    } else {
                                        toast.error('Add experience first');
                                    }
                                }}
                                onProviderChange={setSelectedProvider}
                                selectedProvider={selectedProvider}
                                isLoading={aiGenerating}
                                isEnhancerLoading={aiEnhancerLoading}
                                isEnhancerUsed={isEnhancerUsed}
                                hasOriginalSummary={!!originalSummary}
                                hasExperiences={experiences.length > 0}
                                hasJobTitle={!!personalInfo.title?.trim()}
                            />
                            
                            {/* ✅ Download Buttons - WITH FEEDBACK TRIGGER */}
                            <DownloadButtons
                                onCopy={handleCopyCV}
                                onDownloadPDF={handleDownloadPDF}
                                onDownloadTXT={handleDownloadTXT}
                                onClear={clearAllData}
                            />
                        </div>
                    )}
                    
                    {/* Navigation Buttons - Mobile optimized */}
                    {step < 10 && (
                        <div className="flex justify-between pt-6 sm:pt-8 lg:pt-10 mt-4 sm:mt-6 border-t border-gray-800">
                            {step > 1 && (
                                <button
                                    onClick={prevStep}
                                    className="px-4 sm:px-5 lg:px-7 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 hover:scale-105 text-sm sm:text-base flex items-center gap-2 font-medium"
                                >
                                    <ChevronLeft size={16} className="flex-shrink-0" /> Back
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                className={`px-4 sm:px-5 lg:px-7 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 text-sm sm:text-base flex items-center gap-2 ${step > 1 ? '' : 'w-full justify-center'}`}
                            >
                                Next <ChevronRight size={16} className="flex-shrink-0" />
                            </button>
                        </div>
                    )}
                    {step === 10 && (
                        <div className="flex justify-center pt-6 sm:pt-8 lg:pt-10 mt-4 sm:mt-6 border-t border-gray-800">
                            <button
                                onClick={prevStep}
                                className="px-4 sm:px-5 lg:px-7 py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 hover:scale-105 text-sm sm:text-base flex items-center gap-2 font-medium"
                            >
                                <ChevronLeft size={16} className="flex-shrink-0" /> Back to Edit
                            </button>
                        </div>
                    )}
                </div>
                
                {/* ✅ Right Panel - Preview - Mobile: top margin for breathing space */}
                <div ref={previewRef} className="w-full lg:w-1/2 overflow-auto mt-8 lg:mt-0">
                    <CVPreview
                        personalInfo={personalInfo}
                        phoneNumber={phoneNumber}
                        selectedCountryCode={selectedCountryCode}
                        professionalSummary={professionalSummary}
                        experiences={experiences}
                        educations={educations}
                        projects={projects}
                        certifications={certifications}
                        languages={languages}
                        achievements={achievements}
                        skills={skills}
                        profilePhoto={profilePhoto}
                        template={template}
                        atsScore={realWeightedAverage}
                        strength={getStrengthStatus(realWeightedAverage)}
                        completionPercentage={realCompletionPercentage}
                        sectionStatuses={sectionStatuses}
                    />
                </div>
            </div>

            {/* ✅ Feedback Modal - Feature-Specific with onMinimize */}
            <FeedbackModal
                isOpen={showFeedbackModal}
                onClose={() => {
                    setShowFeedbackModal(false);
                    markFeedbackShown('cv-builder');
                }}
                onMinimize={handleMinimize} // ✅ NEW: Minimize to widget
                source="cv-builder"
                sourceKey="cv-builder"
            />

            {/* ✅ NEW: Feedback Widget */}
            <FeedbackWidget
                isVisible={showWidget}
                onOpen={handleOpenFromWidget}
                onClose={handleCloseWidget}
                source="cv-builder"
            />
        </div>
    );
};

export default CVBuilder;