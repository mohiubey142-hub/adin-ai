// src/components/cover-letter/CoverLetter.tsx
import { useState, useEffect, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Sparkles, Trash2, Maximize2, Minimize2, Mail, Shield, Star, CheckCircle, Lock, Download, RotateCcw, ArrowLeft, ArrowDown, LayoutGrid, SendHorizontal } from 'lucide-react';
import Step1Details from './steps/Step1Details';
import Step2Style from './steps/Step2Style';
import CoverLetterProgress from './CoverLetterProgress';
import { generateCoverLetterPDF } from './utils/pdfGenerator';
import CoverLetterEnhancer from './CoverLetterEnhancer';
import { countryCodes } from './constants/cvDefaults';
import { generateCoverLetterWithAI, isGroqConfigured } from './services/groqService';

// ✅ SEO Imports - CORRECT PATH from cover-letter/
import { SEOHead } from "../../components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../../utils/seo";
import { getSEOConfig } from "../../utils/seoPages";

// ✅ Import from new modular structure
import { templates } from './constants/templates';
import { 
  validatePhoneForCountry, 
  getPhoneValidationMessage, 
  isEducationValid,
  getEducationError,
  generateLetter,
  generateFallbackLetter,
  countWords
} from './utils';
import { 
  CircularProgressRing, 
  EmailPremiumPanel, 
  MoreInsightsArrow,
  ClassicPreview,
  ModernPreview
} from './components';

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

const STORAGE_KEY = 'cover_letter_data';

const saveToLocalStorage = (data: any) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading from localStorage:', e);
  }
  return null;
};

interface CoverLetterProps {
  onBackToHome?: () => void;
  initialTemplateId?: string;
}

const CoverLetter = ({ onBackToHome, initialTemplateId }: CoverLetterProps) => {
  // ===== ALL STATE VARIABLES =====
  const [step, setStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'classic' | 'modern'>('classic');
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+92');
  const [address, setAddress] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [originalLetter, setOriginalLetter] = useState('');
  const [projects, setProjects] = useState('');
  const [isEnhanced, setIsEnhanced] = useState(false);
  
  // ✅ NEW: Current Position state
  const [currentPosition, setCurrentPosition] = useState('');

  // ✅ NEW: Feedback Modal & Widget State
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSourceKey, setFeedbackSourceKey] = useState('cover-letter');
  
  // ✅ NEW: Widget visibility state (restore from localStorage)
  const [showWidget, setShowWidget] = useState(() => {
    return getWidgetVisibility('cover-letter');
  });

  // ============================================================
  // ===== ✅ FIX: STABLE STATE REF (98% QUALITY FIX) =====
  // ============================================================
  const stateRef = useRef({
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, projects,
    currentPosition // ✅ ADDED
  });

  // ✅ Har state change par ref update karein
  useEffect(() => {
    stateRef.current = {
      userName, email, phoneNumber, selectedCountryCode, address, linkedin,
      education, experience, skills, jobTitle, company, jobDescription,
      additionalInfo, profilePhoto, selectedStyle, projects,
      currentPosition // ✅ ADDED
    };
  }, [
    userName, email, phoneNumber, selectedCountryCode, address, linkedin,
    education, experience, skills, jobTitle, company, jobDescription,
    additionalInfo, profilePhoto, selectedStyle, projects,
    currentPosition // ✅ ADDED
  ]);

  // ============================================================
  // ===== TEMPLATE SYNC FROM GALLERY =====
  // ============================================================
  useEffect(() => {
    if (initialTemplateId && (initialTemplateId === 'classic' || initialTemplateId === 'modern')) {
      console.log(`🎯 Gallery template applied on mount: ${initialTemplateId}`);
      setSelectedTemplate(initialTemplateId as 'classic' | 'modern');
    }
  }, []);

  useEffect(() => {
    if (initialTemplateId && (initialTemplateId === 'classic' || initialTemplateId === 'modern')) {
      console.log(`🎯 Gallery template applied via prop update: ${initialTemplateId}`);
      setSelectedTemplate(initialTemplateId as 'classic' | 'modern');
    }
  }, [initialTemplateId]);

  useEffect(() => {
    const savedTemplate = localStorage.getItem('adin-selected-cover-template');
    if (savedTemplate && (savedTemplate === 'classic' || savedTemplate === 'modern')) {
      console.log(`🎯 Gallery template applied from localStorage: ${savedTemplate}`);
      setSelectedTemplate(savedTemplate as 'classic' | 'modern');
    }
  }, []);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('adin-selected-cover-template', selectedTemplate);
    }
  }, [selectedTemplate, isInitialLoad]);

  // ============================================================
  // ===== LOCAL STORAGE LOAD =====
  // ============================================================
  useEffect(() => {
    const savedData = loadFromLocalStorage();
    if (savedData) {
      setUserName(savedData.userName || '');
      setEmail(savedData.email || '');
      setPhoneNumber(savedData.phoneNumber || '');
      setSelectedCountryCode(savedData.selectedCountryCode || '+92');
      setAddress(savedData.address || '');
      setLinkedin(savedData.linkedin || '');
      setEducation(savedData.education || '');
      setExperience(savedData.experience || '');
      setSkills(savedData.skills || '');
      setJobTitle(savedData.jobTitle || '');
      setCompany(savedData.company || '');
      setJobDescription(savedData.jobDescription || '');
      setAdditionalInfo(savedData.additionalInfo || '');
      setProfilePhoto(savedData.profilePhoto || null);
      setSelectedStyle(savedData.selectedStyle || 'professional');
      if (!initialTemplateId && savedData.selectedTemplate) {
        setSelectedTemplate(savedData.selectedTemplate || 'classic');
      }
      setGeneratedLetter(savedData.generatedLetter || '');
      setOriginalLetter(savedData.originalLetter || '');
      setStep(savedData.step || 1);
      setProjects(savedData.projects || '');
      setIsEnhanced(savedData.isEnhanced || false);
      setCurrentPosition(savedData.currentPosition || '');
    }
    setIsInitialLoad(false);
  }, [initialTemplateId]);

  // ============================================================
  // ===== LOCAL STORAGE SAVE =====
  // ============================================================
  useEffect(() => {
    if (isInitialLoad) return;
    
    const data = {
      userName,
      email,
      phoneNumber,
      selectedCountryCode,
      address,
      linkedin,
      education,
      experience,
      skills,
      jobTitle,
      company,
      jobDescription,
      additionalInfo,
      profilePhoto,
      selectedStyle,
      selectedTemplate,
      generatedLetter,
      originalLetter,
      step,
      projects,
      isEnhanced,
      currentPosition // ✅ ADDED
    };
    
    saveToLocalStorage(data);
    window.location.hash = `step-${step}`;
  }, [
    userName,
    email,
    phoneNumber,
    selectedCountryCode,
    address,
    linkedin,
    education,
    experience,
    skills,
    jobTitle,
    company,
    jobDescription,
    additionalInfo,
    profilePhoto,
    selectedStyle,
    selectedTemplate,
    generatedLetter,
    originalLetter,
    step,
    projects,
    isEnhanced,
    currentPosition, // ✅ ADDED
    isInitialLoad
  ]);

  // ============================================================
  // ===== HASH CHANGE HANDLER =====
  // ============================================================
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#step-')) {
        const stepNum = parseInt(hash.replace('#step-', ''), 10);
        if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= 3 && stepNum !== step) {
          setStep(stepNum);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [step]);

  // ============================================================
  // ===== FULLSCREEN =====
  // ============================================================
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        await containerRef.current?.requestFullscreen();
        setIsFullscreen(true);
        toast.success('Fullscreen mode ON');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        toast.success('Fullscreen mode OFF');
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

  // ============================================================
  // ===== CLEAR ALL DATA =====
  // ============================================================
  const clearAllData = () => {
    if (window.confirm('Are you sure? This will clear ALL your cover letter data!')) {
      setUserName('');
      setEmail('');
      setPhoneNumber('');
      setSelectedCountryCode('+92');
      setAddress('');
      setLinkedin('');
      setEducation('');
      setExperience('');
      setSkills('');
      setJobTitle('');
      setCompany('');
      setJobDescription('');
      setAdditionalInfo('');
      setProfilePhoto(null);
      setSelectedStyle('professional');
      setSelectedTemplate('classic');
      setGeneratedLetter('');
      setOriginalLetter('');
      setProjects('');
      setIsEnhanced(false);
      setCurrentPosition('');
      setStep(1);
      localStorage.removeItem(STORAGE_KEY);
      toast.success('All cover letter data cleared successfully!');
    }
  };

  // ============================================================
  // ===== VALIDATIONS =====
  // ============================================================
  const isPhoneValid = validatePhoneForCountry(phoneNumber, selectedCountryCode);
  const phoneValidationMessage = getPhoneValidationMessage(phoneNumber, selectedCountryCode);

  // ============================================================
  // ===== SCORES =====
  // ============================================================
  const nameScore = userName ? 100 : 0;
  const emailScore = email && email.includes('@gmail.com') ? 100 : 0;
  const phoneScore = phoneNumber && isPhoneValid ? 100 : 0;
  const educationScore = education ? 100 : 0;
  const experienceScore = experience ? 100 : 0;
  const skillsScore = skills ? 100 : 0;
  const jobTitleScore = jobTitle ? 100 : 0;
  const companyScore = company ? 100 : 0;
  const descriptionScore = jobDescription ? 100 : 0;
  const achievementsScore = additionalInfo ? 100 : 0;
  const currentPositionScore = currentPosition ? 100 : 0;
  
  const totalScore = Math.round((nameScore + emailScore + phoneScore + educationScore + experienceScore + skillsScore + jobTitleScore + companyScore + descriptionScore + achievementsScore + currentPositionScore) / 11);
  const missingFields = [userName, email, phoneNumber, education, experience, skills, jobTitle, company, jobDescription, additionalInfo, currentPosition].filter(f => !f).length;
  
  const overallQuality = generatedLetter ? 88 : 0;

  // ============================================================
  // ===== HANDLERS =====
  // ============================================================
  const handleSkillsChange = (value: string) => {
    let formatted = value.replace(/\s*,\s*/g, ', ').trim();
    formatted = formatted.replace(/,+/g, ',');
    formatted = formatted.replace(/\s+,/g, ',');
    formatted = formatted.replace(/,(\S)/g, ', $1');
    setSkills(formatted);
  };

  const handleEnhance = (enhancedLetter: string) => {
    setGeneratedLetter(enhancedLetter);
    setIsEnhanced(true);
    toast.success('Letter enhanced successfully!');
  };

  const resetToOriginal = () => {
    if (originalLetter) {
      setGeneratedLetter(originalLetter);
      setIsEnhanced(false);
      toast.success('Restored to original version');
    }
  };

  const copyToClipboard = () => {
    if (!generatedLetter) { 
      toast.error('Generate a letter first'); 
      return; 
    }
    navigator.clipboard.writeText(generatedLetter);
    toast.success('Copied to clipboard!');
  };

  const downloadTXT = () => {
    if (!generatedLetter) { 
      toast.error('Generate a letter first'); 
      return; 
    }
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover_letter_${jobTitle.replace(/\s/g, '_') || 'application'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('TXT file downloaded!');
  };

  const downloadPDF = async () => {
    if (!generatedLetter) {
      toast.error('Generate a letter first');
      return;
    }

    try {
      toast.loading('Generating PDF...', { id: 'pdf' });

      const pdfBlob = await generateCoverLetterPDF({
        userName,
        email,
        phoneNumber,
        selectedCountryCode,
        address,
        linkedin,
        jobTitle,
        company,
        education,
        experience,
        skills,
        additionalInfo,
        generatedLetter,
        selectedStyle,
        profilePhoto,
        selectedTemplate
      });

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cover_letter_${(jobTitle || 'application').replace(/\s/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully!', { id: 'pdf' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF', { id: 'pdf' });
    }
  };

  // ============================================================
  // ===== ✅ FIXED: GENERATE LETTER HANDLER (Ref se) =====
  // ============================================================
  const generateLetterHandler = () => {
    const currentState = stateRef.current;
    
    // Debug log
    console.log('🚀 Generating with latest values:', {
      userName: currentState.userName,
      jobTitle: currentState.jobTitle,
      company: currentState.company,
      experience: currentState.experience,
      skills: currentState.skills,
      education: currentState.education,
      projects: currentState.projects,
      additionalInfo: currentState.additionalInfo,
      selectedStyle: currentState.selectedStyle,
      currentPosition: currentState.currentPosition
    });

    const params = {
      userName: currentState.userName,
      email: currentState.email,
      phoneNumber: currentState.phoneNumber,
      education: currentState.education,
      jobTitle: currentState.jobTitle,
      company: currentState.company,
      experience: currentState.experience,
      skills: currentState.skills,
      projects: currentState.projects,
      additionalInfo: currentState.additionalInfo,
      selectedStyle: currentState.selectedStyle,
      currentPosition: currentState.currentPosition,
      isPhoneValid: validatePhoneForCountry(currentState.phoneNumber, currentState.selectedCountryCode),
      setGenerating,
      setGeneratedLetter,
      setOriginalLetter,
      setIsEnhanced,
      setStep
    };
    
    generateLetter(params);
  };

  // ============================================================
  // ===== ✅ FIXED: FALLBACK HANDLER (Ref se) =====
  // ============================================================
  const generateFallbackFromRef = () => {
    const currentState = stateRef.current;
    
    generateFallbackLetter(
      currentState.userName,
      currentState.jobTitle,
      currentState.company,
      currentState.experience,
      currentState.skills,
      currentState.education,
      currentState.projects,
      currentState.additionalInfo,
      currentState.currentPosition,
      setGeneratedLetter,
      setOriginalLetter,
      setIsEnhanced,
      setStep
    );
  };

  // ============================================================
  // ===== NAVIGATION =====
  // ============================================================
  const nextStep = () => {
    if (step === 1) {
      if (!userName || !userName.trim()) {
        toast.error('Please fill your full name');
        return;
      }
      if (!email || !email.includes('@gmail.com')) {
        toast.error('Please enter a valid Gmail address (@gmail.com)');
        return;
      }
      if (!phoneNumber) {
        toast.error('Please enter your phone number');
        return;
      }
      if (!isPhoneValid) {
        toast.error(phoneValidationMessage);
        return;
      }
      if (!education) {
        toast.error('Please fill in Education section (Degree and University are required)');
        return;
      }
      const educationParts = education.split(',');
      const hasDegree = educationParts.length > 0 && educationParts[0].trim().length > 0;
      const hasUniversity = educationParts.length > 1 && educationParts[1].trim().length > 0;
      if (!hasDegree) {
        toast.error('Degree is required in Education section');
        return;
      }
      if (!hasUniversity) {
        toast.error('University is required in Education section');
        return;
      }
      if (!jobTitle || !jobTitle.trim()) {
        toast.error('Please fill your job title');
        return;
      }
      if (!company || !company.trim()) {
        toast.error('Please fill company name');
        return;
      }
      if (!skills || !skills.trim()) {
        toast.error('Please fill your skills');
        return;
      }
      if (!currentPosition || !currentPosition.trim()) {
        toast.error('Please fill your current position');
        return;
      }
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 2) {
      generateLetterHandler();
    } else {
      setStep(Math.min(step + 1, 3));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToEdit = () => {
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================
  // ===== LIVE PREVIEW =====
  // ============================================================
  const getLivePreview = () => {
    if (step === 3 && generatedLetter) return generatedLetter;
    
    let preview = '';
    preview += `${userName || '[Your Name]'}\n\n`;
    preview += `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n\n`;
    preview += `Hiring Manager\n${company || '[Company Name]'}\n\n`;
    preview += `RE: Application for ${jobTitle || '[Job Title]'}\n\n`;
    preview += `Dear Hiring Manager,\n\n`;
    preview += `I am excited to apply for the ${jobTitle || '[Job Title]'} position at ${company || '[Company]'}. `;
    if (experience) preview += `With a strong foundation in ${experience}, `;
    preview += `I am eager to contribute to a team that delivers innovative technology solutions.\n\n`;
    if (projects) preview += `My experience includes ${projects}. `;
    if (skills) preview += `I bring expertise in ${skills}. `;
    preview += `\n\nI would welcome the opportunity to discuss how I can contribute to your team. Thank you for your consideration.`;
    return preview;
  };

  const livePreview = getLivePreview();
  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  // ============================================================
  // ===== CSS STYLES =====
  // ============================================================
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .main-scroll::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      .main-scroll::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.5);
        border-radius: 10px;
        min-height: 100%;
      }
      .main-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #3b82f6);
        border-radius: 10px;
        transition: all 0.3s ease;
        min-height: 40px;
      }
      .main-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #7c3aed, #2563eb);
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
      }
      .main-scroll {
        scrollbar-width: thin;
        scrollbar-color: #a855f7 rgba(31, 41, 55, 0.5);
      }

      .left-column-scroll::-webkit-scrollbar,
      .right-column-scroll::-webkit-scrollbar {
        width: 5px;
        height: 5px;
      }
      .left-column-scroll::-webkit-scrollbar-track,
      .right-column-scroll::-webkit-scrollbar-track {
        background: rgba(31, 41, 55, 0.5);
        border-radius: 10px;
        min-height: 100%;
      }
      .left-column-scroll::-webkit-scrollbar-thumb,
      .right-column-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #3b82f6);
        border-radius: 10px;
        transition: all 0.3s ease;
        min-height: 30px;
      }
      .left-column-scroll::-webkit-scrollbar-thumb:hover,
      .right-column-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #7c3aed, #2563eb);
        box-shadow: 0 0 20px rgba(168, 85, 247, 0.3);
      }
      .left-column-scroll {
        scrollbar-width: thin;
        scrollbar-color: #a855f7 rgba(31, 41, 55, 0.5);
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }
      .right-column-scroll {
        scrollbar-width: thin;
        scrollbar-color: #a855f7 rgba(31, 41, 55, 0.5);
        overflow-y: auto !important;
        overflow-x: hidden !important;
      }

      .preview-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .preview-scroll::-webkit-scrollbar-track {
        background: rgba(200, 200, 200, 0.2);
        border-radius: 10px;
      }
      .preview-scroll::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #a855f7, #3b82f6);
        border-radius: 10px;
        transition: all 0.3s ease;
      }
      .preview-scroll::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #7c3aed, #2563eb);
      }
      .preview-scroll {
        scrollbar-width: thin;
        scrollbar-color: #a855f7 rgba(200, 200, 200, 0.2);
      }

      .smooth-scroll {
        scroll-behavior: smooth;
      }

      .overflow-wrap-anywhere {
        overflow-wrap: anywhere;
        word-break: break-word;
        max-width: 100%;
      }

      @keyframes float-cover {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .animate-float-cover {
        animation: float-cover 1s ease-in-out infinite;
      }

      @keyframes float-email {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      .animate-float-email {
        animation: float-email 2.8s ease-in-out infinite;
      }

      @keyframes float-arrow {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      .animate-float-arrow {
        animation: float-arrow 1s ease-in-out infinite;
      }

      @keyframes glow-pulse-cover {
        0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.3); }
        50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6), 0 0 60px rgba(59, 130, 246, 0.3); }
      }
      .animate-glow-cover {
        animation: glow-pulse-cover 2.5s ease-in-out infinite;
      }

      @keyframes glow-pulse-email {
        0%, 100% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.3); }
        50% { box-shadow: 0 0 60px rgba(168, 85, 247, 0.5), 0 0 80px rgba(59, 130, 246, 0.2); }
      }
      .animate-glow-email {
        animation: glow-pulse-email 2.8s ease-in-out infinite;
      }

      .go-to-top {
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 9999 !important;
        pointer-events: none !important;
      }
      .go-to-top > div {
        pointer-events: auto !important;
      }

      * {
        scroll-behavior: smooth;
      }

      /* Premium Generate Button Animations */
      @keyframes shimmer-pulse {
        0% { background-position: -200% center; }
        100% { background-position: 200% center; }
      }

      .generate-btn-shimmer {
        background-size: 200% auto;
        animation: shimmer-pulse 3s ease-in-out infinite;
      }

      @keyframes icon-float {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-2px) scale(1.05); }
      }

      .generate-btn-icon {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .generate-btn:hover .generate-btn-icon {
        animation: icon-float 2s ease-in-out infinite;
      }

      @keyframes spin-smooth {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .generate-spinner {
        animation: spin-smooth 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }

      /* Fullscreen Button Premium Animations */
      @keyframes fullscreen-icon-float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-2px); }
      }
      .fullscreen-btn-icon {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .fullscreen-btn:hover .fullscreen-btn-icon {
        animation: fullscreen-icon-float 2.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ============================================================
  // ===== ✅ FEEDBACK TRIGGER - Watch generatedLetter (Feature-Specific) =====
  // ============================================================
  useEffect(() => {
    console.log('🔍 CoverLetter Feedback useEffect triggered:', { 
      generatedLetter: !!generatedLetter, 
      generating, 
      step,
      length: generatedLetter?.length || 0
    });
    
    if (generatedLetter && !generating && step === 3) {
      console.log('✅ CoverLetter Feedback conditions met!');
      const shouldShow = shouldShowFeedback('cover-letter');
      console.log('📊 CoverLetter shouldShowFeedback:', shouldShow);
      
      if (shouldShow) {
        console.log('🚀 CoverLetter Opening feedback modal...');
        setFeedbackSourceKey('cover-letter');
        setTimeout(() => {
          setShowFeedbackModal(true);
        }, 500);
      } else {
        console.log('⏭️ CoverLetter Feedback already shown or skipped.');
      }
    }
  }, [generatedLetter, generating, step]);

  // ✅ NEW: Feedback Widget Handlers
  const handleMinimize = () => {
    setShowFeedbackModal(false);
    minimizeToWidget('cover-letter');
    setShowWidget(true);
  };
  
  const handleOpenFromWidget = () => {
    setShowWidget(false);
    setShowFeedbackModal(true);
  };
  
  const handleCloseWidget = () => {
    closeWidget('cover-letter');
    setShowWidget(false);
  };

  // ============================================================
  // ===== RENDER =====
  // ============================================================
  return (
    <>
      {/* ✅ SEO: Cover Letter Page */}
      <SEOHead
        title={getSEOConfig('cover-letter').title}
        description={getSEOConfig('cover-letter').description}
        keywords={getSEOConfig('cover-letter').keywords}
        canonicalUrl={getSEOConfig('cover-letter').canonicalUrl}
        ogType="website"
      />

      {/* ✅ JSON-LD: Cover Letter Schema */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('cover-letter'))}
      </script>

      <div ref={containerRef} className="min-h-screen flex flex-col bg-black main-scroll smooth-scroll overflow-y-auto">
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.1)',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '14px',
              maxWidth: '500px',
              textAlign: 'center',
            },
            success: {
              style: { border: '1px solid rgba(34, 197, 94, 0.3)' },
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
            },
            error: {
              style: { border: '1px solid rgba(239, 68, 68, 0.3)' },
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
            loading: {
              style: { border: '1px solid rgba(168, 85, 247, 0.3)' },
            },
          }}
          containerStyle={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          containerClassName="go-to-top"
        />
        
        {/* ===== HEADER - PERFECTLY CENTERED ===== */}
        <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-purple-500/20">
          <div className="flex items-center justify-between py-2 sm:py-3 px-0">
            {/* LEFT - Templates Button - Flush Left */}
            <div className="flex items-center flex-shrink-0">
              <button 
                onClick={() => {
                  if (onBackToHome) {
                    onBackToHome();
                  } else {
                    toast.error('Navigation to templates not available');
                  }
                }}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 flex items-center gap-1.5 sm:gap-2 group"
              >
                <ArrowLeft size={14} className="sm:size-[16px] text-white/80 group-hover:text-white transition-all duration-300 group-hover:scale-110 group-hover:-translate-x-0.5" />
                <span className="relative hidden xs:inline">
                  Templates
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 transition-all duration-300 group-hover:w-full" />
                </span>
                <span className="relative xs:hidden">
                  Templates
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-400 to-blue-300 transition-all duration-300 group-hover:w-full" />
                </span>
              </button>
            </div>
            
            {/* CENTER - Perfectly Centered Title (Flex-shrink 0 to maintain centering) */}
            <div className="absolute left-1/2 -translate-x-1/2 text-center whitespace-nowrap pointer-events-none">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
                Adin AI Cover Letter
              </h1>
            </div>
            
            {/* RIGHT - Premium Fullscreen Button - Flush Right */}
            <div className="flex items-center flex-shrink-0">
              <button 
                onClick={toggleFullscreen} 
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white font-medium shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm fullscreen-btn"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 size={14} className="sm:size-[16px] text-white/90 transition-all duration-300 fullscreen-btn-icon" />
                    <span className="hidden xs:inline text-white/90">Exit Full Screen</span>
                    <span className="xs:hidden text-white/90">Exit</span>
                  </>
                ) : (
                  <>
                    <Maximize2 size={14} className="sm:size-[16px] text-white/90 transition-all duration-300 fullscreen-btn-icon" />
                    <span className="hidden xs:inline text-white/90">Full Screen</span>
                    <span className="xs:hidden text-white/90">Full</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="w-full px-3 sm:px-6 py-4 sm:py-6">
          
          <CoverLetterProgress step={step} jobTitle={jobTitle} company={company} selectedStyle={selectedStyle} />
          
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              
              {/* ===== LEFT COLUMN ===== */}
              <div className="left-column-scroll h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden pr-2 space-y-6">
                
                {step === 1 && (
                  <div className="rounded-2xl p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6 pb-2 border-b border-purple-500/30 tracking-wide sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
                      Personal Information
                    </h3>
                    <Step1Details 
                      userName={userName} setUserName={setUserName}
                      email={email} setEmail={setEmail}
                      phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                      selectedCountryCode={selectedCountryCode} setSelectedCountryCode={setSelectedCountryCode}
                      address={address} setAddress={setAddress}
                      linkedin={linkedin} setLinkedin={setLinkedin}
                      education={education} setEducation={setEducation}
                      experience={experience} setExperience={setExperience}
                      skills={skills} setSkills={handleSkillsChange}
                      jobTitle={jobTitle} setJobTitle={setJobTitle}
                      company={company} setCompany={setCompany}
                      jobDescription={jobDescription} setJobDescription={setJobDescription}
                      additionalInfo={additionalInfo} setAdditionalInfo={setAdditionalInfo}
                      profilePhoto={profilePhoto} setProfilePhoto={setProfilePhoto}
                      projects={projects} setProjects={setProjects}
                      currentPosition={currentPosition} setCurrentPosition={setCurrentPosition}
                      onNext={nextStep}
                      generating={generating}
                    />
                  </div>
                )}
                
                {step === 2 && (
                  <>
                    <div className="rounded-2xl p-4 sm:p-6 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
                      <h3 className="text-base sm:text-lg font-semibold text-purple-400 mb-4 sm:mb-6 pb-2 border-b border-purple-500/30 tracking-wide">
                        Letter Style
                      </h3>
                      <Step2Style 
                        selectedStyle={selectedStyle} setSelectedStyle={setSelectedStyle}
                        selectedTemplate={selectedTemplate} setSelectedTemplate={setSelectedTemplate}
                      />
                    </div>

                    <div className="flex justify-between pt-4 gap-4 bg-black/80 backdrop-blur-sm py-3 -mx-2 px-2 rounded-xl">
                      <button onClick={prevStep} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                        ← Back
                      </button>
                      {/* ===== PREMIUM GENERATE BUTTON ===== */}
                      <button 
                        onClick={() => {
                          nextStep();
                        }} 
                        disabled={generating}
                        className={`
                          relative px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl 
                          bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600
                          hover:from-blue-500 hover:via-purple-500 hover:to-blue-500
                          text-white text-sm sm:text-base font-semibold 
                          transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                          hover:scale-105 active:scale-95
                          shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50
                          border border-white/10 hover:border-white/20
                          flex items-center justify-center gap-2.5 sm:gap-3
                          min-w-[160px] sm:min-w-[200px]
                          generate-btn
                          ${generating ? 'opacity-90 cursor-wait' : 'cursor-pointer'}
                        `}
                        style={{
                          backgroundSize: '200% auto',
                        }}
                      >
                        {/* Glow overlay */}
                        <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 blur-xl transition-all duration-500 hover:blur-2xl opacity-0 hover:opacity-100 pointer-events-none" />
                        
                        {/* Inner border glow */}
                        <span className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        
                        {generating ? (
                          <>
                            <svg 
                              className="generate-spinner w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-white" 
                              xmlns="http://www.w3.org/2000/svg" 
                              fill="none" 
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="relative z-10 text-white/90">Generating...</span>
                          </>
                        ) : (
                          <>
                            <SendHorizontal 
                              size={18} 
                              className="sm:size-[20px] flex-shrink-0 text-white/90 transition-all duration-300 generate-btn-icon group-hover:scale-110 group-hover:text-white group-hover:translate-y-[-2px]" 
                              strokeWidth={2}
                            />
                            <span className="relative z-10 bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                              Generate Letter
                            </span>
                            <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                {step === 3 && generatedLetter && (
                  <>
                    <div className="rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 shadow-xl text-center transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg shadow-purple-500/30 transition-all duration-500 hover:scale-110 hover:shadow-purple-500/50 animate-float-cover animate-glow-cover">
                        <span className="text-xl sm:text-2xl">🎉</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-purple-400 tracking-wide">Cover Letter Ready!</h3>
                      <p className="text-[10px] sm:text-xs text-gray-400 mt-1 sm:mt-1.5 tracking-wide">Your professional cover letter is ready for use</p>
                      <div className="mt-4 sm:mt-5 flex justify-center gap-6 sm:gap-8">
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{totalScore}%</p>
                          <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-wide">Complete</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl sm:text-2xl font-bold text-white">{overallQuality}%</p>
                          <p className="text-[9px] sm:text-[10px] text-gray-400 tracking-wide">Quality</p>
                        </div>
                      </div>
                    </div>

                    <CoverLetterEnhancer 
                      originalLetter={originalLetter || generatedLetter}
                      onEnhance={handleEnhance}
                      userName={userName}
                      jobTitle={jobTitle}
                      company={company}
                      isEnhanced={isEnhanced}
                      onRestoreOriginal={resetToOriginal}
                    />

                    <EmailPremiumPanel />

                    <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                      <button onClick={copyToClipboard} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-green-600/20 hover:shadow-green-600/40">
                        📋 Copy
                      </button>
                      <button onClick={downloadPDF} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50">
                        📥 PDF
                      </button>
                      <button onClick={downloadTXT} className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gray-600 hover:bg-gray-700 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-gray-600/20 hover:shadow-gray-600/40">
                        📄 TXT
                      </button>
                      <button 
                        onClick={clearAllData} 
                        className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/20 hover:shadow-red-600/40 flex items-center gap-1.5 sm:gap-2"
                      >
                        <Trash2 size={14} className="sm:size-[16px]" />
                        <span className="hidden xs:inline">Clear All Data</span>
                        <span className="xs:hidden">Clear</span>
                      </button>
                    </div>

                    <div className="flex justify-between pt-4 gap-4 bg-black/80 backdrop-blur-sm py-3 -mx-2 px-2 rounded-xl">
                      <button onClick={goBackToEdit} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-white text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                        ← Back to Edit
                      </button>
                    </div>
                  </>
                )}
                
              </div>
              
              {/* ===== RIGHT COLUMN ===== */}
              <div className="right-column-scroll h-[calc(100vh-250px)] overflow-y-auto overflow-x-hidden pr-2 space-y-6">
                
                <div className={`rounded-2xl p-3 sm:p-5 ${currentTemplate.previewCardBg} border ${currentTemplate.previewBorder} shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20`}>
                  <div className="flex items-center justify-between mb-3 sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 -mt-2 z-10 rounded-t-xl">
                    <h3 className={`text-xs sm:text-sm font-semibold flex items-center gap-2 ${currentTemplate.headingColor} tracking-wide`}>
                      <span className="text-sm sm:text-base">👁️</span> Live Preview
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[8px] sm:text-[10px]">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-purple-400 animate-pulse" />
                      Real-time
                    </div>
                  </div>
                  <div className={`bg-gradient-to-r ${currentTemplate.previewBg} rounded-xl shadow-2xl shadow-purple-500/20 overflow-hidden transition-all duration-300 hover:shadow-purple-500/30`}>
                    <div className="p-0.5">
                      {selectedTemplate === 'classic' ? (
                        <ClassicPreview 
                          letter={generatedLetter || livePreview}
                          photo={profilePhoto}
                          name={userName}
                          title={jobTitle}
                          email={email}
                          phone={phoneNumber}
                          countryCode={selectedCountryCode}
                          userAddress={address}
                          linkedinUrl={linkedin}
                          companyName={company}
                        />
                      ) : (
                        <ModernPreview 
                          letter={generatedLetter || livePreview}
                          photo={profilePhoto}
                          name={userName}
                          title={jobTitle}
                          email={email}
                          phone={phoneNumber}
                          countryCode={selectedCountryCode}
                          userAddress={address}
                          linkedinUrl={linkedin}
                          companyName={company}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center mt-3">
                    <div className="flex gap-1">
                      <div className="w-4 sm:w-6 h-1 rounded-full bg-purple-500" />
                      <div className="w-3 sm:w-4 h-1 rounded-full bg-gray-700" />
                    </div>
                  </div>
                </div>

                <MoreInsightsArrow onClick={() => {
                  const healthPanel = document.getElementById('letter-health-panel');
                  if (healthPanel) {
                    healthPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }} />

                <div id="letter-health-panel" className="rounded-2xl p-4 sm:p-5 bg-gray-900/40 backdrop-blur-sm border border-purple-500/20 shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:shadow-purple-500/10">
                  <h3 className="text-xs sm:text-sm font-semibold text-purple-400 mb-4 sm:mb-5 flex items-center gap-2 tracking-wide sticky top-0 bg-gray-900/80 backdrop-blur-sm py-2 -mt-2 z-10 rounded-t-xl">
                    <span className="text-sm sm:text-base">📊</span> Letter Health
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 mb-4 sm:mb-6">
                    <CircularProgressRing score={nameScore} label="Full Name" />
                    <CircularProgressRing score={emailScore} label="Email" />
                    <CircularProgressRing score={phoneScore} label="Phone" />
                    <CircularProgressRing score={educationScore} label="Education" />
                    <CircularProgressRing score={experienceScore} label="Experience" />
                    <CircularProgressRing score={skillsScore} label="Skills" />
                    <CircularProgressRing score={jobTitleScore} label="Job Title" />
                    <CircularProgressRing score={companyScore} label="Company" />
                    <CircularProgressRing score={descriptionScore} label="Description" />
                    <CircularProgressRing score={achievementsScore} label="Achievements" />
                    <CircularProgressRing score={currentPositionScore} label="Current Position" />
                  </div>
                  
                  <div className="mt-2 pt-3 border-t border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] sm:text-xs text-gray-500 tracking-wide">Overall Health</span>
                      <span className="text-xs sm:text-sm font-bold text-white">{totalScore}<span className="text-[9px] sm:text-xs text-purple-400">%</span></span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all duration-700" style={{ width: `${totalScore}%` }} />
                    </div>
                    <div className="text-center mt-2.5">
                      <span className="text-[9px] sm:text-[10px] text-gray-500 tracking-wide">{missingFields} field{missingFields !== 1 ? 's' : ''} remaining</span>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
          
        </div>

        {/* ✅ Feedback Modal - Feature-Specific with onMinimize */}
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={() => {
            setShowFeedbackModal(false);
            markFeedbackShown('cover-letter');
          }}
          onMinimize={handleMinimize}
          source="cover-letter"
          sourceKey="cover-letter"
        />

        {/* ✅ NEW: Feedback Widget */}
        <FeedbackWidget
          isVisible={showWidget}
          onOpen={handleOpenFromWidget}
          onClose={handleCloseWidget}
          source="cover-letter"
        />
      </div>
    </>
  );
};

export default CoverLetter;