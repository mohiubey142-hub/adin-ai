import { PersonalInfo, ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem } from '../types/cvTypes';

interface ATSParams {
    personalInfo: PersonalInfo;
    phoneNumber: string;
    professionalSummary: string;
    experiences: ExperienceItem[];
    educations: EducationItem[];
    skills: string;
    projects: ProjectItem[];
    certifications: CertificationItem[];
    languages: LanguageItem[];
    achievements: AchievementItem[];
    profilePhoto: string | null;
}

// Helper to parse skills
const parseSkillsToArray = (skillsStr: string): string[] => {
    if (!skillsStr || !skillsStr.trim()) return [];
    if (skillsStr.includes(',')) {
        return skillsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }
    return skillsStr.split('\n')
        .map(s => s.trim())
        .map(s => s.replace(/^[•\-*]\s*/, ''))
        .filter(s => s.length > 0);
};

export const calculateATSScore = (params: ATSParams): number => {
    let score = 0;
    
    const { personalInfo, phoneNumber, professionalSummary, experiences, educations, skills, projects, certifications, languages, achievements } = params;
    
    // Personal Info (25 points)
    if (personalInfo.name && personalInfo.name.trim()) score += 5;
    if (personalInfo.title && personalInfo.title.trim()) score += 5;
    if (personalInfo.email && personalInfo.email.includes('@')) score += 5;
    if (phoneNumber && phoneNumber.trim()) score += 5;
    if (personalInfo.linkedin || personalInfo.github) score += 5;
    
    // Summary (15 points)
    if (professionalSummary && professionalSummary.trim()) {
        score += 10;
        if (professionalSummary.length > 100) score += 5;
    }
    
    // Education (20 points)
    const validEducations = educations.filter(e => e.degree && e.degree.trim() && e.institution && e.institution.trim());
    if (validEducations.length > 0) {
        score += 15;
        if (validEducations.some(e => e.grade && e.grade.trim())) score += 5;
    }
    
    // Skills (15 points)
    const skillCount = parseSkillsToArray(skills).length;
    if (skillCount >= 6) score += 15;
    else if (skillCount >= 4) score += 12;
    else if (skillCount >= 2) score += 8;
    else if (skillCount >= 1) score += 5;
    
    // Experience (10 points - optional bonus)
    const validExperiences = experiences.filter(e => e.title && e.title.trim() && e.company && e.company.trim());
    if (validExperiences.length >= 2) score += 10;
    else if (validExperiences.length === 1) score += 6;
    
    // Projects (10 points - optional bonus)
    const validProjects = projects.filter(p => p.name && p.name.trim());
    if (validProjects.length >= 2) score += 10;
    else if (validProjects.length === 1) score += 6;
    
    // Certifications (5 points - optional bonus)
    const validCerts = certifications.filter(c => c.name && c.name.trim());
    if (validCerts.length >= 1) score += 5;
    
    return Math.min(score, 100);
};

export const getStrengthStatus = (atsScore: number) => {
    if (atsScore < 40) return { text: 'Needs Attention', color: 'text-red-400', bg: 'bg-red-500/20', icon: '⚠️' };
    if (atsScore < 60) return { text: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '📊' };
    if (atsScore < 75) return { text: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '👍' };
    if (atsScore < 90) return { text: 'Strong', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '💪' };
    return { text: 'Excellent', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🏆' };
};

// Re-export for backward compatibility
export const getATSFeedback = (params: ATSParams) => {
    const { personalInfo, phoneNumber, professionalSummary, experiences, educations, skills, projects, certifications, languages, achievements } = params;
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    if (personalInfo.name && personalInfo.title && personalInfo.email && phoneNumber) {
        strengths.push('Complete personal information');
    }
    
    if (professionalSummary && professionalSummary.length > 100) {
        strengths.push('Well-written professional summary');
    } else if (professionalSummary && professionalSummary.length > 0) {
        improvements.push('Expand your professional summary');
    } else {
        improvements.push('Add a professional summary');
    }
    
    const validEducations = educations.filter(e => e.degree && e.degree.trim() && e.institution && e.institution.trim());
    if (validEducations.length >= 1) {
        strengths.push('Education information complete');
    } else {
        improvements.push('Add your educational background');
    }
    
    const skillCount = parseSkillsToArray(skills).length;
    if (skillCount >= 6) {
        strengths.push('Comprehensive skills section');
    } else if (skillCount >= 3) {
        strengths.push(`${skillCount} relevant skills added`);
    } else {
        improvements.push('Add more skills (3+ recommended)');
    }
    
    const validProjects = projects.filter(p => p.name && p.name.trim());
    if (validProjects.length >= 2) {
        strengths.push('Multiple projects demonstrating experience');
    } else if (validProjects.length === 1) {
        strengths.push('Project portfolio included');
    }
    
    let overall = '';
    const totalScore = calculateATSScore(params);
    if (totalScore >= 85) overall = 'Excellent CV! Well-structured and professionally presented.';
    else if (totalScore >= 70) overall = 'Strong CV with good content.';
    else if (totalScore >= 50) overall = 'Good foundation. Add more details.';
    else overall = 'Complete the recommended sections for better results.';
    
    return { strengths, improvements, overall };
};