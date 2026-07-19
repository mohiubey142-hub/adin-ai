import { 
    ExperienceItem, EducationItem, ProjectItem, 
    CertificationItem, LanguageItem, AchievementItem 
} from '../types/cvTypes';

export interface ATSScoreInput {
    personalInfo: any;
    phoneNumber: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    skills: string;
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
}

export interface ATSBreakdown {
    keywords: number;
    structure: number;
    experience: number;
    skills: number;
    completeness: number;
}

export interface SectionScores {
    Personal: number;
    Experience: number;
    Education: number;
    Projects: number;
    Skills: number;
    Summary: number;
    Languages: number;
    Certifications: number;
    Achievements: number;
}

export interface QualityRating {
    text: string;
    color: string;
    icon: string;
}

export const calculateSectionScores = (input: ATSScoreInput): SectionScores => {
    const {
        personalInfo,
        phoneNumber,
        professionalSummary,
        experiences,
        educations,
        projects,
        skills,
        languages,
        certifications,
        achievements
    } = input;

    const personal = calculatePersonalScore(personalInfo, phoneNumber);
    const experience = calculateExperienceScore(experiences);
    const education = calculateEducationScore(educations);
    const projectsScore = calculateProjectsScore(projects);
    const skillsScore = calculateSkillsScore(skills);
    const summary = calculateSummaryScore(professionalSummary);
    const languagesScore = calculateLanguagesScore(languages);
    const certificationsScore = calculateCertificationsScore(certifications);
    const achievementsScore = calculateAchievementsScore(achievements);

    return {
        Personal: personal,
        Experience: experience,
        Education: education,
        Projects: projectsScore,
        Skills: skillsScore,
        Summary: summary,
        Languages: languagesScore,
        Certifications: certificationsScore,
        Achievements: achievementsScore
    };
};

const calculatePersonalScore = (personalInfo: any, phoneNumber: string): number => {
    let score = 0;
    if (personalInfo.name?.trim()) score += 25;
    if (personalInfo.title?.trim()) score += 25;
    if (personalInfo.email?.includes('@') && personalInfo.email?.includes('.')) score += 25;
    if (phoneNumber?.trim().length >= 7) score += 25;
    return score;
};

const calculateExperienceScore = (experiences: ExperienceItem[]): number => {
    const validExperiences = experiences.filter(exp => 
        exp.title?.trim() && exp.company?.trim()
    );
    if (validExperiences.length === 0) return 0;
    let score = Math.min(validExperiences.length * 50, 100);
    const hasDescriptions = validExperiences.some(exp => exp.description?.trim().length > 20);
    if (hasDescriptions && validExperiences.length >= 1) score = Math.min(score + 20, 100);
    return score;
};

const calculateEducationScore = (educations: EducationItem[]): number => {
    const validEducations = educations.filter(edu => 
        edu.degree?.trim() && edu.institution?.trim()
    );
    if (validEducations.length === 0) return 0;
    return Math.min(validEducations.length * 50, 100);
};

const calculateProjectsScore = (projects: ProjectItem[]): number => {
    const validProjects = projects.filter(proj => proj.name?.trim());
    if (validProjects.length === 0) return 0;
    let score = Math.min(validProjects.length * 33, 100);
    const hasDetails = validProjects.some(proj => 
        (proj.description?.trim().length > 10) || 
        (proj.tech?.trim().length > 0)
    );
    if (hasDetails) score = Math.min(score + 20, 100);
    return score;
};

const calculateSkillsScore = (skills: string): number => {
    if (!skills?.trim()) return 0;
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

const calculateSummaryScore = (summary: string): number => {
    if (!summary?.trim()) return 0;
    const length = summary.trim().length;
    if (length < 30) return 30;
    if (length < 60) return 60;
    if (length < 100) return 80;
    return 100;
};

const calculateLanguagesScore = (languages: LanguageItem[]): number => {
    const validLanguages = languages.filter(l => l.language?.trim());
    if (validLanguages.length === 0) return 0;
    return Math.min(validLanguages.length * 35, 100);
};

const calculateCertificationsScore = (certifications: CertificationItem[]): number => {
    // ✅ FIXED: Sirf name check karo, issuer optional hai
    const validCerts = certifications.filter(c => c.name?.trim());
    if (validCerts.length === 0) return 0;
    return Math.min(validCerts.length * 34, 100);
};

const calculateAchievementsScore = (achievements: AchievementItem[]): number => {
    const validAchievements = achievements.filter(a => a.title?.trim());
    if (validAchievements.length === 0) return 0;
    return Math.min(validAchievements.length * 34, 100);
};

export const calculateATSBreakdown = (input: ATSScoreInput): ATSBreakdown => {
    const sectionScores = calculateSectionScores(input);
    
    // Keywords
    let keywords = 0;
    if (input.professionalSummary?.length > 50) keywords += 50;
    else if (input.professionalSummary?.length > 0) keywords += 25;
    
    const skillCount = input.skills ? (input.skills.includes(',') ? input.skills.split(',').length : input.skills.split('\n').length) : 0;
    if (skillCount >= 5) keywords += 50;
    else if (skillCount >= 3) keywords += 30;
    else if (skillCount >= 1) keywords += 15;
    keywords = Math.min(keywords, 100);
    
    // Structure
    let structure = 0;
    if (input.personalInfo.name?.trim()) structure += 25;
    if (input.personalInfo.title?.trim()) structure += 25;
    if (input.personalInfo.email?.includes('@')) structure += 25;
    if (input.phoneNumber?.length >= 7) structure += 25;
    
    const completeness = Math.round(
        (sectionScores.Personal + sectionScores.Education + sectionScores.Skills + sectionScores.Summary) / 4
    );
    
    return {
        keywords,
        structure,
        experience: sectionScores.Experience,
        skills: sectionScores.Skills,
        completeness
    };
};

export const calculateWeightedAverage = (breakdown: ATSBreakdown): number => {
    return Math.round(
        (breakdown.keywords + breakdown.structure + breakdown.experience + breakdown.skills + breakdown.completeness) / 5
    );
};

export const getQualityRating = (score: number): QualityRating => {
    if (score >= 90) return { text: 'Excellent', color: 'text-emerald-400', icon: '🌟' };
    if (score >= 70) return { text: 'Very Good', color: 'text-blue-400', icon: '⭐' };
    if (score >= 50) return { text: 'Good', color: 'text-yellow-400', icon: '👍' };
    if (score >= 30) return { text: 'Needs Improvement', color: 'text-orange-400', icon: '📈' };
    return { text: 'Needs Work', color: 'text-red-400', icon: '⚠️' };
};

export const getImprovementSuggestions = (input: ATSScoreInput): string[] => {
    const suggestions: string[] = [];
    
    if (!input.personalInfo.name?.trim()) suggestions.push('Add your full name');
    if (!input.personalInfo.title?.trim()) suggestions.push('Add your job title');
    if (!input.personalInfo.email?.trim()) suggestions.push('Add your email address');
    if (!input.phoneNumber) suggestions.push('Add your phone number');
    
    const hasEducation = input.educations.some(e => e.degree?.trim() && e.institution?.trim());
    if (!hasEducation) suggestions.push('Add at least one education entry');
    
    const hasExperience = input.experiences.some(e => e.title?.trim() && e.company?.trim());
    if (!hasExperience) suggestions.push('Add work experience');
    
    if (!input.skills?.trim()) suggestions.push('Add your skills');
    
    if (!input.professionalSummary?.trim() || input.professionalSummary.trim().length < 50) {
        suggestions.push('Write a detailed professional summary (minimum 50 characters)');
    }
    
    const hasProjects = input.projects.some(p => p.name?.trim() && p.description?.trim());
    if (!hasProjects) suggestions.push('Add projects to showcase your work');
    
    // ✅ FIXED: Sirf name check karo, issuer optional hai
    const hasCertifications = input.certifications.some(c => c.name?.trim());
    if (!hasCertifications) suggestions.push('Add certifications to boost credibility');
    
    const hasLanguages = input.languages.some(l => l.language?.trim() && l.proficiency?.trim());
    if (!hasLanguages) suggestions.push('Add languages you speak');
    
    const hasAchievements = input.achievements.some(a => a.title?.trim() && a.description?.trim());
    if (!hasAchievements) suggestions.push('Add achievements to highlight your successes');
    
    return suggestions;
};

export const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
};

export const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/20 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
};