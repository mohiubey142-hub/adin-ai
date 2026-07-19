import React from 'react';
import { PersonalInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem, SectionStatus } from '../types/cvTypes';
import { countryCodes } from '../constants/cvDefaults';
import { getFullPhoneNumber } from '../utils/phoneValidation';

// ✅ EXPANDED: Template type with all 6 templates
export type TemplateType = 'modern' | 'classic' | 'minimal' | 'executive' | 'creative' | 'academic';

// ✅ UPDATED: CVBuilderProps with initialTemplateId and onBackToHome
interface CVBuilderProps {
    userId: string;
    initialTemplateId?: string;
    onBackToHome?: () => void;
}

// ✅ UPDATED: CVPreviewProps with expanded template type
interface CVPreviewProps {
    personalInfo: PersonalInfo;
    phoneNumber: string;
    selectedCountryCode: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    skills: string;
    profilePhoto: string | null;
    template: TemplateType;  // ✅ EXPANDED
    atsScore: number;
    strength: { text: string; color: string; bg: string; icon: string };
    completionPercentage?: number;
    sectionStatuses?: Record<number, SectionStatus>;
}

const CircularProgress: React.FC<{ score: number; size?: number; strokeWidth?: number; label?: string; icon?: string }> = ({ 
    score, 
    size = 70, 
    strokeWidth = 4, 
    label = "",
    icon = ""
}) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? Math.min(Math.max(score, 0), 100) : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (validScore / 100) * circumference;
    
    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="transform -rotate-90">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="url(#progressGradient)"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a855f7" />
                            <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {icon && <span className="text-xs">{icon}</span>}
                    <span className="text-sm font-bold text-white">{Math.round(validScore)}<span className="text-[8px] text-gray-400">%</span></span>
                </div>
            </div>
            {label && <span className="text-[10px] text-gray-400 mt-1">{label}</span>}
        </div>
    );
};

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
    const getContactInfo = () => {
        const country = countryCodes.find(c => c.code === selectedCountryCode);
        const contacts = [];
        if (personalInfo.email) contacts.push(`${personalInfo.email}`);
        if (getFullPhoneNumber(phoneNumber, selectedCountryCode)) contacts.push(`${getFullPhoneNumber(phoneNumber, selectedCountryCode)}`);
        if (personalInfo.address) contacts.push(`${personalInfo.address}`);
        if (personalInfo.linkedin) contacts.push(`${personalInfo.linkedin}`);
        if (personalInfo.github) contacts.push(`${personalInfo.github}`);
        if (personalInfo.portfolio) contacts.push(`${personalInfo.portfolio}`);
        return contacts;
    };

    const getContactInfoWithEmojis = () => {
        const country = countryCodes.find(c => c.code === selectedCountryCode);
        const contacts = [];
        if (personalInfo.email) contacts.push(`📧 ${personalInfo.email}`);
        if (getFullPhoneNumber(phoneNumber, selectedCountryCode)) contacts.push(`📞 ${getFullPhoneNumber(phoneNumber, selectedCountryCode)} ${country?.flag || ''}`);
        if (personalInfo.address) contacts.push(`📍 ${personalInfo.address}`);
        if (personalInfo.linkedin) contacts.push(`🔗 ${personalInfo.linkedin}`);
        if (personalInfo.github) contacts.push(`🐙 ${personalInfo.github}`);
        if (personalInfo.portfolio) contacts.push(`🌐 ${personalInfo.portfolio}`);
        return contacts;
    };

    const getBackgroundStyle = () => {
        return '#000000';
    };

    const getCardStyle = () => {
        switch(template) {
            case 'modern': return 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-gray-800';
            case 'classic': return 'bg-white shadow-lg';
            case 'minimal': return 'bg-white shadow-lg';
            case 'executive': return 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-amber-800/30';
            case 'creative': return 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-pink-800/30';
            case 'academic': return 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-emerald-800/30';
            default: return 'bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-gray-800';
        }
    };

    const getHeadingStyle = () => {
        switch(template) {
            case 'modern': return 'text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30';
            case 'classic': return 'text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3';
            case 'minimal': return 'text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4';
            case 'executive': return 'text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30';
            case 'creative': return 'text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30';
            case 'academic': return 'text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30';
            default: return 'text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30';
        }
    };

    const getNameStyle = () => {
        switch(template) {
            case 'modern': return 'text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent';
            case 'classic': return 'text-3xl font-bold text-gray-900 tracking-[0.3px]';
            case 'minimal': return 'text-3xl font-light text-gray-900 tracking-[0.5px]';
            case 'executive': return 'text-3xl font-bold mb-1 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent';
            case 'creative': return 'text-3xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent';
            case 'academic': return 'text-3xl font-bold mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent';
            default: return 'text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent';
        }
    };

    const getTitleStyle = () => {
        switch(template) {
            case 'modern': return 'text-lg mb-5 text-gray-400';
            case 'classic': return 'text-base text-gray-600';
            case 'minimal': return 'text-base font-light text-gray-600 tracking-[0.3px]';
            case 'executive': return 'text-lg mb-5 text-amber-300/70';
            case 'creative': return 'text-lg mb-5 text-pink-300/70';
            case 'academic': return 'text-lg mb-5 text-emerald-300/70';
            default: return 'text-lg mb-5 text-gray-400';
        }
    };

    const getContactStyle = () => {
        switch(template) {
            case 'modern': return 'flex gap-4 flex-wrap mb-6 text-sm text-gray-400 max-w-full';
            case 'classic': return 'flex gap-4 flex-wrap text-sm text-gray-600 max-w-full';
            case 'minimal': return 'flex gap-4 flex-wrap text-sm text-gray-600 max-w-full';
            case 'executive': return 'flex gap-4 flex-wrap mb-6 text-sm text-amber-300/60 max-w-full';
            case 'creative': return 'flex gap-4 flex-wrap mb-6 text-sm text-pink-300/60 max-w-full';
            case 'academic': return 'flex gap-4 flex-wrap mb-6 text-sm text-emerald-300/60 max-w-full';
            default: return 'flex gap-4 flex-wrap mb-6 text-sm text-gray-400 max-w-full';
        }
    };

    const getPhotoBorderClass = () => {
        switch(template) {
            case 'modern': return 'border-4 border-purple-500 shadow-lg shadow-purple-500/30';
            case 'classic': return 'border-2 border-gray-300';
            case 'minimal': return 'border-2 border-gray-300';
            case 'executive': return 'border-4 border-amber-500 shadow-lg shadow-amber-500/30';
            case 'creative': return 'border-4 border-pink-500 shadow-lg shadow-pink-500/30';
            case 'academic': return 'border-4 border-emerald-500 shadow-lg shadow-emerald-500/30';
            default: return 'border-4 border-purple-500 shadow-lg shadow-purple-500/30';
        }
    };

    const getDescriptionStyle = () => {
        switch(template) {
            case 'modern': return 'text-gray-300 text-sm';
            case 'classic': return 'text-gray-700 text-sm leading-relaxed';
            case 'minimal': return 'text-gray-700 text-sm leading-relaxed';
            case 'executive': return 'text-amber-100/80 text-sm';
            case 'creative': return 'text-pink-100/80 text-sm';
            case 'academic': return 'text-emerald-100/80 text-sm';
            default: return 'text-gray-300 text-sm';
        }
    };

    // Helper: Safe text rendering with overflow protection
    const safeText = (text: string): string => {
        return text || '';
    };

    // Helper function to clean bullets - REMOVES EXISTING BULLETS
    const cleanBulletText = (text: string): string => {
        return text.replace(/^[•▪◦*-]\s*/, '').trim();
    };

    // Helper to render bullet points with SINGLE bullet and MINIMAL spacing
    const renderBulletPoints = (text: string) => {
        if (!text) return null;
        const lines = text.split('\n').filter(line => line.trim());
        return lines.map((line, idx) => {
            const clean = cleanBulletText(line);
            if (!clean) return null;
            return (
                <div key={idx} className="flex items-start gap-1.5 overflow-hidden w-full">
                    <span className="text-gray-400 flex-shrink-0">•</span>
                    <span className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere min-w-0 flex-1">
                        {safeText(clean)}
                    </span>
                </div>
            );
        }).filter(Boolean);
    };

    // Render inline items (skills, languages) as dot-separated
    const renderInlineItems = (text: string) => {
        if (!text) return null;
        const items = text.split('\n')
            .map(line => cleanBulletText(line))
            .filter(item => item);
        if (items.length === 0) return null;
        return (
            <div className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere w-full">
                {items.map((item, idx) => (
                    <span key={idx}>
                        {idx > 0 && <span className="mx-1.5 text-gray-400">•</span>}
                        <span>{safeText(item)}</span>
                    </span>
                ))}
            </div>
        );
    };

    // Render languages inline
    const renderLanguagesInline = () => {
        if (languages.length === 0) return null;
        return (
            <div className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere w-full">
                {languages.filter(l => l.language).map((l, i) => (
                    <span key={i}>
                        {i > 0 && <span className="mx-1.5 text-gray-400">•</span>}
                        <span className="font-medium">{safeText(l.language)}</span> {safeText(l.proficiency)}
                    </span>
                ))}
            </div>
        );
    };

    const calculatePersonalScore = (): number => {
        let score = 0;
        if (personalInfo.name && personalInfo.name.trim().length > 0) score += 25;
        if (personalInfo.title && personalInfo.title.trim().length > 0) score += 25;
        if (personalInfo.email && personalInfo.email.includes('@') && personalInfo.email.includes('.')) score += 25;
        if (phoneNumber && phoneNumber.trim().length >= 7) score += 25;
        return score;
    };

    const calculateExperienceScore = (): number => {
        const validExperiences = experiences.filter(exp => 
            exp.title && exp.title.trim() && 
            exp.company && exp.company.trim()
        );
        if (validExperiences.length === 0) return 0;
        let score = Math.min(validExperiences.length * 50, 100);
        const hasDescriptions = validExperiences.some(exp => exp.description && exp.description.trim().length > 20);
        if (hasDescriptions && validExperiences.length >= 1) score = Math.min(score + 20, 100);
        return score;
    };

    const calculateEducationScore = (): number => {
        const validEducations = educations.filter(edu => 
            edu.degree && edu.degree.trim() && 
            edu.institution && edu.institution.trim()
        );
        if (validEducations.length === 0) return 0;
        let score = Math.min(validEducations.length * 50, 100);
        return score;
    };

    const calculateProjectsScore = (): number => {
        const validProjects = projects.filter(proj => proj.name && proj.name.trim());
        if (validProjects.length === 0) return 0;
        let score = Math.min(validProjects.length * 33, 100);
        const hasDetails = validProjects.some(proj => 
            (proj.description && proj.description.trim().length > 10) || 
            (proj.tech && proj.tech.trim().length > 0)
        );
        if (hasDetails) score = Math.min(score + 20, 100);
        return score;
    };

    const calculateSkillsScore = (): number => {
        if (!skills || skills.trim().length === 0) return 0;
        const skillArray = skills.includes(',') 
            ? skills.split(',').map(s => s.trim()).filter(s => s)
            : skills.split('\n').map(s => s.trim().replace(/^[•\-*]\s*/, '')).filter(s => s);
        if (skillArray.length === 0) return 0;
        if (skillArray.length === 1) return 20;
        if (skillArray.length === 2) return 40;
        if (skillArray.length >= 3 && skillArray.length <= 5) return 70;
        if (skillArray.length >= 6) return 100;
        return 0;
    };

    const calculateSummaryScore = (): number => {
        if (!professionalSummary || professionalSummary.trim().length === 0) return 0;
        const length = professionalSummary.trim().length;
        if (length < 30) return 30;
        if (length >= 30 && length < 60) return 60;
        if (length >= 60 && length < 100) return 80;
        if (length >= 100) return 100;
        return 0;
    };

    const calculateLanguagesScore = (): number => {
        const validLanguages = languages.filter(l => l.language && l.language.trim());
        if (validLanguages.length === 0) return 0;
        return Math.min(validLanguages.length * 35, 100);
    };

    const calculateCertificationsScore = (): number => {
        const validCerts = certifications.filter(c => c.name && c.name.trim());
        if (validCerts.length === 0) return 0;
        return Math.min(validCerts.length * 34, 100);
    };

    const calculateAchievementsScore = (): number => {
        const validAchievements = achievements.filter(a => a.title && a.title.trim());
        if (validAchievements.length === 0) return 0;
        return Math.min(validAchievements.length * 34, 100);
    };

    const sectionScores = {
        Personal: calculatePersonalScore(),
        Experience: calculateExperienceScore(),
        Education: calculateEducationScore(),
        Projects: calculateProjectsScore(),
        Skills: calculateSkillsScore(),
        Summary: calculateSummaryScore(),
        Languages: calculateLanguagesScore(),
        Certifications: calculateCertificationsScore(),
        Achievements: calculateAchievementsScore()
    };

    const getATSBreakdown = () => {
        let keywords = 0;
        if (professionalSummary && professionalSummary.length > 50) keywords += 50;
        else if (professionalSummary && professionalSummary.length > 0) keywords += 25;
        const skillCount = skills ? (skills.includes(',') ? skills.split(',').length : skills.split('\n').length) : 0;
        if (skillCount >= 5) keywords += 50;
        else if (skillCount >= 3) keywords += 30;
        else if (skillCount >= 1) keywords += 15;
        keywords = Math.min(keywords, 100);
        
        let structure = 0;
        if (personalInfo.name && personalInfo.name.trim()) structure += 25;
        if (personalInfo.title && personalInfo.title.trim()) structure += 25;
        if (personalInfo.email && personalInfo.email.includes('@')) structure += 25;
        if (phoneNumber && phoneNumber.length >= 7) structure += 25;
        
        const completeness = Math.round((sectionScores.Personal + sectionScores.Education + sectionScores.Skills + sectionScores.Summary) / 4);
        
        return { 
            keywords, 
            structure, 
            experience: sectionScores.Experience, 
            skills: sectionScores.Skills, 
            completeness 
        };
    };

    const breakdown = getATSBreakdown();
    const weightedAverage = Math.round((breakdown.keywords + breakdown.structure + breakdown.experience + breakdown.skills + breakdown.completeness) / 5);
    const realCompletionPercentage = Math.round((sectionScores.Personal + sectionScores.Education + sectionScores.Skills + sectionScores.Summary) / 4);

    const getRealWeakPoints = (): string[] => {
        const weakPoints: string[] = [];
        if (!personalInfo.name || !personalInfo.name.trim()) weakPoints.push("Full Name is required");
        if (!personalInfo.title || !personalInfo.title.trim()) weakPoints.push("Job Title is required");
        if (!personalInfo.email || !personalInfo.email.includes('@')) weakPoints.push("Valid Email is required");
        if (!phoneNumber || phoneNumber.length < 7) weakPoints.push("Phone number is required");
        const validEducations = educations.filter(edu => edu.degree && edu.degree.trim() && edu.institution && edu.institution.trim());
        if (validEducations.length === 0) weakPoints.push("Add at least one education entry");
        const skillCount = skills ? (skills.includes(',') ? skills.split(',').length : skills.split('\n').length) : 0;
        if (skillCount === 0) weakPoints.push("Add at least one skill");
        if (!professionalSummary || professionalSummary.length < 50) weakPoints.push("Professional summary too short");
        const validExperiences = experiences.filter(exp => exp.title && exp.title.trim() && exp.company && exp.company.trim());
        if (validExperiences.length === 0) weakPoints.push("Add work experience");
        return weakPoints.slice(0, 6);
    };

    const allWeakPoints = getRealWeakPoints();

    const getRealStrengthDisplay = () => {
        const score = weightedAverage;
        if (score >= 90) return { text: 'Excellent', icon: '🏆', colorClass: 'text-green-400' };
        if (score >= 75) return { text: 'Very Good', icon: '🎯', colorClass: 'text-indigo-400' };
        if (score >= 60) return { text: 'Good', icon: '👍', colorClass: 'text-purple-400' };
        if (score >= 40) return { text: 'Fair', icon: '📈', colorClass: 'text-blue-400' };
        return { text: 'Needs Improvement', icon: '⚠️', colorClass: 'text-purple-300' };
    };

    const strengthDisplay = getRealStrengthDisplay();

    // Check if sections have content
    const hasAbout = professionalSummary && professionalSummary.trim().length > 0;
    const hasExperience = experiences.filter(e => e.title || e.company).length > 0;
    const hasEducation = educations.filter(e => e.degree || e.institution).length > 0;
    const hasProjects = projects.filter(p => p.name).length > 0;
    const hasLanguages = languages.filter(l => l.language).length > 0;
    const hasCertifications = certifications.filter(c => c.name).length > 0;
    const hasAchievements = achievements.filter(a => a.title).length > 0;
    const hasSkills = skills && skills.trim().length > 0;

    return (
        <div className="w-full h-full overflow-auto p-4 sm:p-6" style={{ background: getBackgroundStyle() }}>
            <div className="max-w-3xl mx-auto w-full">
                
                {/* CV Health Cards */}
                <div className="rounded-2xl p-5 mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                    <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <span className="text-base">📊</span> CV Health
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <CircularProgress score={sectionScores.Personal} size={70} strokeWidth={4} label="Personal" />
                        <CircularProgress score={sectionScores.Experience} size={70} strokeWidth={4} label="Experience" />
                        <CircularProgress score={sectionScores.Education} size={70} strokeWidth={4} label="Education" />
                        <CircularProgress score={sectionScores.Skills} size={70} strokeWidth={4} label="Skills" />
                        <CircularProgress score={sectionScores.Summary} size={70} strokeWidth={4} label="Summary" />
                        <CircularProgress score={sectionScores.Projects} size={70} strokeWidth={4} label="Projects" />
                    </div>
                </div>

                {/* ATS Analysis Cards */}
                <div className="rounded-2xl p-5 mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                    <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                        <span className="text-base">📈</span> ATS Analysis
                    </h3>
                    <div className="space-y-3">
                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>🔑 Keywords</span><span className="text-purple-400">{breakdown.keywords}%</span></div><div className="h-1.5 bg-gray-800/80 rounded-full"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${breakdown.keywords}%` }}></div></div></div>
                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>📐 Structure</span><span className="text-purple-400">{breakdown.structure}%</span></div><div className="h-1.5 bg-gray-800/80 rounded-full"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${breakdown.structure}%` }}></div></div></div>
                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>💼 Experience</span><span className="text-purple-400">{breakdown.experience}%</span></div><div className="h-1.5 bg-gray-800/80 rounded-full"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${breakdown.experience}%` }}></div></div></div>
                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>⚡ Skills</span><span className="text-purple-400">{breakdown.skills}%</span></div><div className="h-1.5 bg-gray-800/80 rounded-full"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${breakdown.skills}%` }}></div></div></div>
                        <div><div className="flex justify-between text-xs text-gray-400 mb-1"><span>✅ Completeness</span><span className="text-purple-400">{breakdown.completeness}%</span></div><div className="h-1.5 bg-gray-800/80 rounded-full"><div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${breakdown.completeness}%` }}></div></div></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-purple-500/10 flex justify-between text-xs"><span className="text-gray-500">Weighted Average</span><span className="text-purple-400 font-medium">{weightedAverage}%</span></div>
                </div>

                {/* CV Improvement Suggestions */}
                {allWeakPoints.length > 0 && (
                    <div className="rounded-2xl p-5 mb-4 bg-gray-900/40 backdrop-blur-md border border-purple-500/20 shadow-xl">
                        <h3 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2"><span className="text-base">💡</span> CV Improvement Suggestions <span className="text-xs text-gray-500 ml-2">{allWeakPoints.length} items</span></h3>
                        <div className="flex flex-wrap gap-2">{allWeakPoints.map((point, i) => (<span key={i} className="text-xs text-purple-300 bg-purple-500/10 px-2 py-1 rounded-full border border-purple-500/20">{point}</span>))}</div>
                    </div>
                )}

                {/* Score Bar */}
                <div className="rounded-xl p-4 mb-5 bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/30">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2"><span className="text-xl">{strengthDisplay.icon}</span><span className={`font-semibold text-sm ${strengthDisplay.colorClass}`}>{strengthDisplay.text}</span></div>
                        <div className="flex gap-4">
                            <div className="text-right"><div className="text-white font-bold text-base">{weightedAverage}<span className="text-xs text-white/60">/100</span></div><div className="text-xs text-white/60">ATS Score</div></div>
                            <div className="text-right"><div className="text-white font-bold text-base">{realCompletionPercentage}<span className="text-xs text-white/60">%</span></div><div className="text-xs text-white/60">Complete</div></div>
                        </div>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 mt-2"><div className="bg-white h-1.5 rounded-full" style={{ width: `${weightedAverage}%` }}></div></div>
                </div>

                {/* ============================================ */}
                {/* MINIMAL TEMPLATE - PREMIUM EXECUTIVE */}
                {/* ============================================ */}
                {template === 'minimal' ? (
                    <div className="bg-white shadow-lg px-8 py-8 max-w-3xl mx-auto overflow-hidden w-full">
                        {/* HEADER - Photo + Name/Title/Contact INLINE */}
                        <div className="flex items-start gap-6 mb-6 w-full">
                            {profilePhoto && (
                                <div className="flex-shrink-0">
                                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 w-full">
                                <h1 className="text-3xl font-light text-gray-900 tracking-[0.5px] break-words overflow-wrap-anywhere w-full">
                                    {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                                </h1>
                                <p className="text-base font-light text-gray-600 tracking-[0.3px] mb-1.5 break-words overflow-wrap-anywhere w-full">
                                    {safeText(personalInfo.title || 'JOB TITLE')}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 max-w-full w-full">
                                    {getContactInfo().map((c, i) => (
                                        <span key={i} className="break-words overflow-wrap-anywhere max-w-full">
                                            {safeText(c)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* PROFILE SECTION */}
                        {hasAbout && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    PROFILE
                                </h2>
                                <p className="text-gray-700 text-sm leading-relaxed break-words overflow-wrap-anywhere w-full">
                                    {safeText(professionalSummary)}
                                </p>
                            </div>
                        )}

                        {/* EXPERIENCE - Timeline Layout */}
                        {hasExperience && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    EXPERIENCE
                                </h2>
                                <div className="space-y-5 w-full">
                                    {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                        <div key={i} className="relative pl-4 border-l-2 border-gray-300 ml-1 w-full">
                                            <div className="text-xs font-medium text-gray-500 mb-0.5 break-words overflow-wrap-anywhere">
                                                {safeText(exp.startDate || 'Start')} — {safeText(exp.endDate || 'Present')}
                                            </div>
                                            <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                                {safeText(exp.title || 'Position')}
                                            </div>
                                            <div className="text-gray-600 text-sm break-words overflow-wrap-anywhere w-full">
                                                {safeText(exp.company || 'Company')}
                                            </div>
                                            {exp.description && (
                                                <div className="mt-1.5 space-y-0.5 overflow-hidden w-full">
                                                    {renderBulletPoints(exp.description)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EDUCATION */}
                        {hasEducation && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    EDUCATION
                                </h2>
                                {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                    <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                        <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                            {safeText(edu.degree || 'Degree')}
                                        </div>
                                        <div className="text-gray-700 text-sm break-words overflow-wrap-anywhere w-full">
                                            {safeText(edu.institution || 'Institution')}
                                        </div>
                                        <div className="text-xs text-gray-500 break-words overflow-wrap-anywhere w-full">
                                            {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* PROJECTS */}
                        {hasProjects && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    PROJECTS
                                </h2>
                                {projects.filter(p => p.name).map((p, i) => (
                                    <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                        <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                            {safeText(p.name)}
                                            {p.tech && <span className="font-normal text-gray-500 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                        </div>
                                        {p.description && (
                                            <div className="space-y-0.5 overflow-hidden w-full">
                                                {renderBulletPoints(p.description)}
                                            </div>
                                        )}
                                        {p.github && (
                                            <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-600 text-xs hover:text-blue-800 inline-block mt-1 break-words overflow-wrap-anywhere">
                                                GitHub
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* SKILLS - Inline Format */}
                        {hasSkills && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    SKILLS
                                </h2>
                                {renderInlineItems(skills)}
                            </div>
                        )}

                        {/* LANGUAGES - Inline Format */}
                        {hasLanguages && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    LANGUAGES
                                </h2>
                                {renderLanguagesInline()}
                            </div>
                        )}

                        {/* CERTIFICATIONS - Clean Executive Style */}
                        {hasCertifications && (
                            <div className="w-full mb-6">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    CERTIFICATIONS
                                </h2>
                                {certifications.filter(c => c.name).map((c, i) => (
                                    <div key={i} className="text-gray-700 text-sm mb-1.5 last:mb-0 break-words overflow-wrap-anywhere w-full">
                                        <span className="font-medium">{safeText(c.name)}</span>
                                        {c.issuer && ` - ${safeText(c.issuer)}`}
                                        {c.date && ` (${safeText(c.date)})`}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ACHIEVEMENTS - Clean Bullet System */}
                        {hasAchievements && (
                            <div className="w-full">
                                <h2 className="text-[11px] font-medium uppercase tracking-[1.5px] text-gray-800 border-b border-gray-300 pb-2 mb-4 w-full">
                                    ACHIEVEMENTS
                                </h2>
                                {achievements.filter(a => a.title).map((a, i) => (
                                    <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                        <div className="font-semibold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                            {safeText(a.title)}
                                            {a.date && <span className="font-normal text-gray-500 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                                        </div>
                                        {a.description && (
                                            <div className="space-y-0.5 mt-0.5 overflow-hidden w-full">
                                                {renderBulletPoints(a.description)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : template === 'classic' ? (
                    /* CLASSIC TEMPLATE - FIXED CONTACT OVERFLOW */
                    <div className="bg-white shadow-lg px-8 py-8 max-w-3xl mx-auto overflow-hidden w-full">
                        {/* HEADER: Photo + Name/Title/Contact INLINE */}
                        <div className="flex items-start gap-6 mb-6 w-full">
                            {profilePhoto && (
                                <div className="flex-shrink-0">
                                    <img src={profilePhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0 w-full">
                                <h1 className="text-3xl font-bold text-gray-900 tracking-[0.3px] break-words overflow-wrap-anywhere w-full">
                                    {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                                </h1>
                                <p className="text-base text-gray-600 mb-1.5 break-words overflow-wrap-anywhere w-full">
                                    {safeText(personalInfo.title || 'JOB TITLE')}
                                </p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 max-w-full w-full">
                                    {getContactInfoWithEmojis().map((c, i) => (
                                        <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere min-w-0 max-w-full">
                                            {safeText(c)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ABOUT SECTION - Full Width */}
                        {hasAbout && (
                            <>
                                <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                    ABOUT
                                </h2>
                                <p className="text-gray-700 text-sm leading-relaxed mb-6 break-words overflow-wrap-anywhere w-full">
                                    {safeText(professionalSummary)}
                                </p>
                            </>
                        )}

                        {/* TWO COLUMN LAYOUT WITH PROFESSIONAL DIVIDER */}
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 w-full">
                            {/* LEFT COLUMN */}
                            <div className="pr-6 space-y-6 min-w-0 overflow-hidden w-full">
                                {/* EXPERIENCE */}
                                {hasExperience && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            EXPERIENCE
                                        </h2>
                                        {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                            <div key={i} className="mb-4 last:mb-0 overflow-hidden w-full">
                                                <div className="flex flex-wrap items-baseline gap-2 w-full">
                                                    <span className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                        {safeText(exp.title || 'Position')}
                                                    </span>
                                                    <span className="text-gray-600 text-sm break-words overflow-wrap-anywhere">
                                                        | {safeText(exp.company || 'Company')}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 mb-1.5 break-words overflow-wrap-anywhere">
                                                    {safeText(exp.startDate || 'Start')} — {safeText(exp.endDate || 'Present')}
                                                </div>
                                                {exp.description && (
                                                    <div className="space-y-0.5 overflow-hidden w-full">
                                                        {renderBulletPoints(exp.description)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* PROJECTS - Left Column */}
                                {hasProjects && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            PROJECTS
                                        </h2>
                                        {projects.filter(p => p.name).map((p, i) => (
                                            <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                                <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                                    {safeText(p.name)}
                                                    {p.tech && <span className="font-normal text-gray-600 text-xs ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                                </div>
                                                {p.description && (
                                                    <div className="space-y-0.5 overflow-hidden w-full">
                                                        {renderBulletPoints(p.description)}
                                                    </div>
                                                )}
                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                                       className="text-blue-600 text-xs hover:text-blue-800 inline-block mt-1 break-words overflow-wrap-anywhere">
                                                        🔗 GitHub
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DIVIDER */}
                            <div className="hidden md:block px-0">
                                <div className="h-full w-px bg-[rgba(124,58,237,0.12)] mx-auto"></div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="pl-6 space-y-6 min-w-0 overflow-hidden w-full">
                                {/* EDUCATION */}
                                {hasEducation && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            EDUCATION
                                        </h2>
                                        {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                            <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                                <div className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere w-full">
                                                    {safeText(edu.degree || 'Degree')}
                                                </div>
                                                <div className="text-gray-700 text-sm break-words overflow-wrap-anywhere w-full">
                                                    {safeText(edu.institution || 'Institution')}
                                                </div>
                                                <div className="text-xs text-gray-500 break-words overflow-wrap-anywhere w-full">
                                                    {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SKILLS */}
                                {hasSkills && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            SKILLS
                                        </h2>
                                        <div className="text-gray-700 text-sm leading-relaxed overflow-hidden w-full">
                                            {skills.split('\n').map((line, idx) => {
                                                const clean = cleanBulletText(line);
                                                if (!clean) return null;
                                                return (
                                                    <div key={idx} className="flex items-start gap-1.5 overflow-hidden w-full">
                                                        <span className="text-gray-500 flex-shrink-0">•</span>
                                                        <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                            {safeText(clean)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* LANGUAGES */}
                                {hasLanguages && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            LANGUAGES
                                        </h2>
                                        <ul className="text-gray-700 text-sm space-y-0.5 overflow-hidden w-full">
                                            {languages.filter(l => l.language).map((l, i) => (
                                                <li key={i} className="flex items-start gap-1.5 overflow-hidden w-full">
                                                    <span className="text-gray-500 flex-shrink-0">•</span>
                                                    <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                        <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* CERTIFICATIONS */}
                                {hasCertifications && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            CERTIFICATIONS
                                        </h2>
                                        {certifications.filter(c => c.name).map((c, i) => (
                                            <div key={i} className="text-gray-700 text-sm mb-1.5 last:mb-0 break-words overflow-wrap-anywhere overflow-hidden w-full">
                                                <span className="font-medium">📜 {safeText(c.name)}</span>
                                                {c.issuer && ` - ${safeText(c.issuer)}`}
                                                {c.date && ` (${safeText(c.date)})`}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ACHIEVEMENTS */}
                                {hasAchievements && (
                                    <div className="w-full">
                                        <h2 className="text-[11px] font-bold uppercase tracking-[0.5px] text-purple-700 border-b-2 border-purple-500 pb-1 mb-3 w-full">
                                            ACHIEVEMENTS
                                        </h2>
                                        {achievements.filter(a => a.title).map((a, i) => (
                                            <div key={i} className="mb-3 last:mb-0 overflow-hidden w-full">
                                                <div className="flex items-center gap-2 flex-wrap w-full">
                                                    <span className="font-bold text-gray-900 text-sm break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                        🏆 {safeText(a.title)}
                                                    </span>
                                                    {a.date && <span className="text-xs text-gray-500 break-words overflow-wrap-anywhere flex-shrink-0">({safeText(a.date)})</span>}
                                                </div>
                                                {a.description && (
                                                    <div className="space-y-0.5 mt-0.5 overflow-hidden w-full">
                                                        {renderBulletPoints(a.description)}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : template === 'executive' ? (
                    /* ============================================ */
                    /* EXECUTIVE TEMPLATE - Premium Amber Theme */
                    /* ============================================ */
                    <div className="bg-gradient-to-br from-gray-950 to-black rounded-xl shadow-2xl border border-amber-800/30 p-8 overflow-hidden w-full">
                        <div className="text-white w-full max-w-full overflow-hidden">
                            {profilePhoto && (
                                <div className="flex justify-center mb-6">
                                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-amber-500 shadow-lg shadow-amber-500/30" />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                            </h1>
                            <h2 className="text-lg mb-5 text-amber-300/70 break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.title || 'JOB TITLE')}
                            </h2>
                            <div className="flex gap-4 flex-wrap mb-6 text-sm text-amber-300/60 max-w-full w-full">
                                {getContactInfoWithEmojis().map((c, i) => (
                                    <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere max-w-full min-w-0 flex-shrink-0">
                                        {safeText(c)}
                                    </span>
                                ))}
                            </div>
                            <hr className="my-6 border-amber-800/30 w-full max-w-full" />
                            {hasAbout && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">PROFESSIONAL SUMMARY</h3>
                                    <p className="text-amber-100/80 text-sm mb-5 break-words overflow-wrap-anywhere w-full max-w-full">{safeText(professionalSummary)}</p>
                                </>
                            )}
                            {hasExperience && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">EXECUTIVE EXPERIENCE</h3>
                                    {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                        <div key={i} className="mb-5 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-base text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.title || 'Position')} | {safeText(exp.company || 'Company')}
                                            </div>
                                            <div className="text-sm mb-2 text-amber-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.startDate || 'Start')} - {safeText(exp.endDate || 'Present')}
                                            </div>
                                            {exp.description && (
                                                <div className="pl-1 text-amber-100/80 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere w-full max-w-full">
                                                    {exp.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-amber-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasEducation && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">EDUCATION</h3>
                                    {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.degree || 'Degree')}</div>
                                            <div className="text-amber-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.institution || 'Institution')}</div>
                                            <div className="text-sm text-amber-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasLanguages && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">LANGUAGES</h3>
                                    <ul className="list-disc ml-4 text-amber-100/80 text-sm w-full max-w-full">
                                        {languages.filter(l => l.language).map((l, i) => (
                                            <li key={i} className="break-words overflow-wrap-anywhere w-full max-w-full">
                                                <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {hasCertifications && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">CERTIFICATIONS</h3>
                                    {certifications.filter(c => c.name).map((c, i) => (
                                        <div key={i} className="mb-2 text-amber-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">
                                            <span className="font-medium text-amber-400">📜 {safeText(c.name)}</span>
                                            {c.issuer && ` - ${safeText(c.issuer)}`}
                                            {c.date && ` (${safeText(c.date)})`}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasProjects && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">PROJECTS</h3>
                                    {projects.filter(p => p.name).map((p, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(p.name)}
                                                {p.tech && <span className="text-sm font-normal text-amber-300/60 ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                            </div>
                                            {p.description && (
                                                <div className="pl-1 text-amber-100/80 text-sm w-full max-w-full">
                                                    {p.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-amber-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {p.github && (
                                                <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                                   className="text-amber-400 text-sm hover:text-amber-300 transition break-words overflow-wrap-anywhere inline-block max-w-full pl-1">
                                                    🔗 GitHub Repository
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasAchievements && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">ACHIEVEMENTS</h3>
                                    {achievements.filter(a => a.title).map((a, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-semibold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                🏆 {safeText(a.title)}
                                                {a.date && <span className="text-sm font-normal text-amber-300/60 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                                            </div>
                                            {a.description && (
                                                <div className="pl-1 text-amber-100/80 text-sm w-full max-w-full">
                                                    {a.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-amber-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasSkills && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-amber-400 border-b border-amber-500/30 w-full max-w-full">SKILLS</h3>
                                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                                        {skills.split('\n').map((line, idx) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1.5 rounded-md bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/30 break-words"
                                                >
                                                    {safeText(clean)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : template === 'creative' ? (
                    /* ============================================ */
                    /* CREATIVE TEMPLATE - Pink/Rose Theme */
                    /* ============================================ */
                    <div className="bg-gradient-to-br from-gray-950 to-black rounded-xl shadow-2xl border border-pink-800/30 p-8 overflow-hidden w-full">
                        <div className="text-white w-full max-w-full overflow-hidden">
                            {profilePhoto && (
                                <div className="flex justify-center mb-6">
                                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-pink-500 shadow-lg shadow-pink-500/30" />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                            </h1>
                            <h2 className="text-lg mb-5 text-pink-300/70 break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.title || 'JOB TITLE')}
                            </h2>
                            <div className="flex gap-4 flex-wrap mb-6 text-sm text-pink-300/60 max-w-full w-full">
                                {getContactInfoWithEmojis().map((c, i) => (
                                    <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere max-w-full min-w-0 flex-shrink-0">
                                        {safeText(c)}
                                    </span>
                                ))}
                            </div>
                            <hr className="my-6 border-pink-800/30 w-full max-w-full" />
                            {hasAbout && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">PROFESSIONAL SUMMARY</h3>
                                    <p className="text-pink-100/80 text-sm mb-5 break-words overflow-wrap-anywhere w-full max-w-full">{safeText(professionalSummary)}</p>
                                </>
                            )}
                            {hasExperience && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">WORK EXPERIENCE</h3>
                                    {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                        <div key={i} className="mb-5 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-base text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.title || 'Position')} | {safeText(exp.company || 'Company')}
                                            </div>
                                            <div className="text-sm mb-2 text-pink-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.startDate || 'Start')} - {safeText(exp.endDate || 'Present')}
                                            </div>
                                            {exp.description && (
                                                <div className="pl-1 text-pink-100/80 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere w-full max-w-full">
                                                    {exp.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-pink-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasEducation && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">EDUCATION</h3>
                                    {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.degree || 'Degree')}</div>
                                            <div className="text-pink-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.institution || 'Institution')}</div>
                                            <div className="text-sm text-pink-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasLanguages && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">LANGUAGES</h3>
                                    <ul className="list-disc ml-4 text-pink-100/80 text-sm w-full max-w-full">
                                        {languages.filter(l => l.language).map((l, i) => (
                                            <li key={i} className="break-words overflow-wrap-anywhere w-full max-w-full">
                                                <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {hasCertifications && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">CERTIFICATIONS</h3>
                                    {certifications.filter(c => c.name).map((c, i) => (
                                        <div key={i} className="mb-2 text-pink-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">
                                            <span className="font-medium text-pink-400">📜 {safeText(c.name)}</span>
                                            {c.issuer && ` - ${safeText(c.issuer)}`}
                                            {c.date && ` (${safeText(c.date)})`}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasProjects && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">PROJECTS</h3>
                                    {projects.filter(p => p.name).map((p, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(p.name)}
                                                {p.tech && <span className="text-sm font-normal text-pink-300/60 ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                            </div>
                                            {p.description && (
                                                <div className="pl-1 text-pink-100/80 text-sm w-full max-w-full">
                                                    {p.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-pink-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {p.github && (
                                                <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                                   className="text-pink-400 text-sm hover:text-pink-300 transition break-words overflow-wrap-anywhere inline-block max-w-full pl-1">
                                                    🔗 GitHub Repository
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasAchievements && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">ACHIEVEMENTS</h3>
                                    {achievements.filter(a => a.title).map((a, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-semibold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                🏆 {safeText(a.title)}
                                                {a.date && <span className="text-sm font-normal text-pink-300/60 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                                            </div>
                                            {a.description && (
                                                <div className="pl-1 text-pink-100/80 text-sm w-full max-w-full">
                                                    {a.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-pink-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasSkills && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-pink-400 border-b border-pink-500/30 w-full max-w-full">SKILLS</h3>
                                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                                        {skills.split('\n').map((line, idx) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1.5 rounded-md bg-pink-500/20 text-pink-300 text-sm font-medium border border-pink-500/30 break-words"
                                                >
                                                    {safeText(clean)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : template === 'academic' ? (
                    /* ============================================ */
                    /* ACADEMIC TEMPLATE - Emerald/Teal Theme */
                    /* ============================================ */
                    <div className="bg-gradient-to-br from-gray-950 to-black rounded-xl shadow-2xl border border-emerald-800/30 p-8 overflow-hidden w-full">
                        <div className="text-white w-full max-w-full overflow-hidden">
                            {profilePhoto && (
                                <div className="flex justify-center mb-6">
                                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-emerald-500 shadow-lg shadow-emerald-500/30" />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                            </h1>
                            <h2 className="text-lg mb-5 text-emerald-300/70 break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.title || 'JOB TITLE')}
                            </h2>
                            <div className="flex gap-4 flex-wrap mb-6 text-sm text-emerald-300/60 max-w-full w-full">
                                {getContactInfoWithEmojis().map((c, i) => (
                                    <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere max-w-full min-w-0 flex-shrink-0">
                                        {safeText(c)}
                                    </span>
                                ))}
                            </div>
                            <hr className="my-6 border-emerald-800/30 w-full max-w-full" />
                            {hasAbout && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">PROFESSIONAL SUMMARY</h3>
                                    <p className="text-emerald-100/80 text-sm mb-5 break-words overflow-wrap-anywhere w-full max-w-full">{safeText(professionalSummary)}</p>
                                </>
                            )}
                            {hasExperience && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">RESEARCH EXPERIENCE</h3>
                                    {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                        <div key={i} className="mb-5 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-base text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.title || 'Position')} | {safeText(exp.company || 'Institution')}
                                            </div>
                                            <div className="text-sm mb-2 text-emerald-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.startDate || 'Start')} - {safeText(exp.endDate || 'Present')}
                                            </div>
                                            {exp.description && (
                                                <div className="pl-1 text-emerald-100/80 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere w-full max-w-full">
                                                    {exp.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-emerald-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasEducation && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">ACADEMIC QUALIFICATIONS</h3>
                                    {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.degree || 'Degree')}</div>
                                            <div className="text-emerald-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.institution || 'Institution')}</div>
                                            <div className="text-sm text-emerald-300/60 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasLanguages && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">LANGUAGES</h3>
                                    <ul className="list-disc ml-4 text-emerald-100/80 text-sm w-full max-w-full">
                                        {languages.filter(l => l.language).map((l, i) => (
                                            <li key={i} className="break-words overflow-wrap-anywhere w-full max-w-full">
                                                <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {hasCertifications && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">CERTIFICATIONS</h3>
                                    {certifications.filter(c => c.name).map((c, i) => (
                                        <div key={i} className="mb-2 text-emerald-100/80 text-sm break-words overflow-wrap-anywhere w-full max-w-full">
                                            <span className="font-medium text-emerald-400">📜 {safeText(c.name)}</span>
                                            {c.issuer && ` - ${safeText(c.issuer)}`}
                                            {c.date && ` (${safeText(c.date)})`}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasProjects && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">RESEARCH PROJECTS</h3>
                                    {projects.filter(p => p.name).map((p, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(p.name)}
                                                {p.tech && <span className="text-sm font-normal text-emerald-300/60 ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                            </div>
                                            {p.description && (
                                                <div className="pl-1 text-emerald-100/80 text-sm w-full max-w-full">
                                                    {p.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-emerald-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {p.github && (
                                                <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                                   className="text-emerald-400 text-sm hover:text-emerald-300 transition break-words overflow-wrap-anywhere inline-block max-w-full pl-1">
                                                    🔗 GitHub Repository
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasAchievements && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">ACADEMIC ACHIEVEMENTS</h3>
                                    {achievements.filter(a => a.title).map((a, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-semibold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                🏆 {safeText(a.title)}
                                                {a.date && <span className="text-sm font-normal text-emerald-300/60 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                                            </div>
                                            {a.description && (
                                                <div className="pl-1 text-emerald-100/80 text-sm w-full max-w-full">
                                                    {a.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-emerald-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasSkills && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-emerald-400 border-b border-emerald-500/30 w-full max-w-full">SKILLS</h3>
                                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                                        {skills.split('\n').map((line, idx) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1.5 rounded-md bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30 break-words"
                                                >
                                                    {safeText(clean)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ============================================ */
                    /* MODERN TEMPLATE - FIXED SKILLS AS TAGS 🎯 */
                    /* ============================================ */
                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-xl shadow-2xl border border-gray-800 p-8 overflow-hidden w-full">
                        <div className="text-white w-full max-w-full overflow-hidden">
                            {profilePhoto && (
                                <div className="flex justify-center mb-6">
                                    <img src={profilePhoto} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-purple-500 shadow-lg shadow-purple-500/30" />
                                </div>
                            )}
                            <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.name?.toUpperCase() || 'YOUR NAME')}
                            </h1>
                            <h2 className="text-lg mb-5 text-gray-400 break-words overflow-wrap-anywhere w-full max-w-full">
                                {safeText(personalInfo.title || 'JOB TITLE')}
                            </h2>
                            <div className="flex gap-4 flex-wrap mb-6 text-sm text-gray-400 max-w-full w-full">
                                {getContactInfoWithEmojis().map((c, i) => (
                                    <span key={i} className="flex items-center gap-1 break-words overflow-wrap-anywhere max-w-full min-w-0 flex-shrink-0">
                                        {safeText(c)}
                                    </span>
                                ))}
                            </div>
                            <hr className="my-6 border-gray-800 w-full max-w-full" />
                            {hasAbout && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">PROFESSIONAL SUMMARY</h3>
                                    <p className="text-gray-300 text-sm mb-5 break-words overflow-wrap-anywhere w-full max-w-full">{safeText(professionalSummary)}</p>
                                </>
                            )}
                            {hasExperience && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">WORK EXPERIENCE</h3>
                                    {experiences.filter(e => e.title || e.company).map((exp, i) => (
                                        <div key={i} className="mb-5 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-base text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.title || 'Position')} | {safeText(exp.company || 'Company')}
                                            </div>
                                            <div className="text-sm mb-2 text-gray-400 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(exp.startDate || 'Start')} - {safeText(exp.endDate || 'Present')}
                                            </div>
                                            {exp.description && (
                                                <div className="pl-1 text-gray-300 text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere w-full max-w-full">
                                                    {exp.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-gray-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasEducation && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">EDUCATION</h3>
                                    {educations.filter(e => e.degree || e.institution).map((edu, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.degree || 'Degree')}</div>
                                            <div className="text-gray-300 text-sm break-words overflow-wrap-anywhere w-full max-w-full">{safeText(edu.institution || 'Institution')}</div>
                                            <div className="text-sm text-gray-400 break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(edu.year || 'Year')}{edu.grade && ` | Grade: ${safeText(edu.grade)}`}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasLanguages && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">LANGUAGES</h3>
                                    <ul className="list-disc ml-4 text-gray-300 text-sm w-full max-w-full">
                                        {languages.filter(l => l.language).map((l, i) => (
                                            <li key={i} className="break-words overflow-wrap-anywhere w-full max-w-full">
                                                <span className="font-medium">{safeText(l.language)}</span>: {safeText(l.proficiency)}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {hasCertifications && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">CERTIFICATIONS</h3>
                                    {certifications.filter(c => c.name).map((c, i) => (
                                        <div key={i} className="mb-2 text-gray-300 text-sm break-words overflow-wrap-anywhere w-full max-w-full">
                                            <span className="font-medium text-purple-400">📜 {safeText(c.name)}</span>
                                            {c.issuer && ` - ${safeText(c.issuer)}`}
                                            {c.date && ` (${safeText(c.date)})`}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasProjects && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">PROJECTS</h3>
                                    {projects.filter(p => p.name).map((p, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-bold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                {safeText(p.name)}
                                                {p.tech && <span className="text-sm font-normal text-gray-400 ml-2 break-words overflow-wrap-anywhere">({safeText(p.tech)})</span>}
                                            </div>
                                            {p.description && (
                                                <div className="pl-1 text-gray-300 text-sm w-full max-w-full">
                                                    {p.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-gray-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {p.github && (
                                                <a href={p.github} target="_blank" rel="noopener noreferrer" 
                                                   className="text-indigo-400 text-sm hover:text-indigo-300 transition break-words overflow-wrap-anywhere inline-block max-w-full pl-1">
                                                    🔗 GitHub Repository
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {hasAchievements && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">ACHIEVEMENTS</h3>
                                    {achievements.filter(a => a.title).map((a, i) => (
                                        <div key={i} className="mb-4 overflow-hidden w-full max-w-full">
                                            <div className="font-semibold text-white break-words overflow-wrap-anywhere w-full max-w-full">
                                                🏆 {safeText(a.title)}
                                                {a.date && <span className="text-sm font-normal text-gray-400 break-words overflow-wrap-anywhere">({safeText(a.date)})</span>}
                                            </div>
                                            {a.description && (
                                                <div className="pl-1 text-gray-300 text-sm w-full max-w-full">
                                                    {a.description.split('\n').map((line, idx) => {
                                                        const clean = cleanBulletText(line);
                                                        if (!clean) return null;
                                                        return (
                                                            <div key={idx} className="flex items-start gap-1.5 w-full">
                                                                <span className="text-gray-400 flex-shrink-0">•</span>
                                                                <span className="break-words overflow-wrap-anywhere min-w-0 flex-1">
                                                                    {safeText(clean)}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                            {/* ============================================ */}
                            {/* ✅ MODERN TEMPLATE SKILLS - FIXED AS TAGS 🎯 */}
                            {/* ============================================ */}
                            {hasSkills && (
                                <>
                                    <h3 className="text-lg font-semibold mt-6 mb-3 pb-1 text-purple-400 border-b border-purple-500/30 w-full max-w-full">
                                        SKILLS
                                    </h3>
                                    <div className="flex flex-wrap gap-2 w-full max-w-full">
                                        {skills.split('\n').map((line, idx) => {
                                            const clean = cleanBulletText(line);
                                            if (!clean) return null;
                                            return (
                                                <span 
                                                    key={idx} 
                                                    className="px-3 py-1.5 rounded-md bg-purple-500/20 text-purple-300 text-sm font-medium border border-purple-500/30 break-words"
                                                >
                                                    {safeText(clean)}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                            {/* ============================================ */}
                            {/* ✅ END SKILLS TAGS 🎯 */}
                            {/* ============================================ */}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVPreview;