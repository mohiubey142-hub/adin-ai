import { ExperienceItem, EducationItem, ProjectItem, LanguageItem, CertificationItem, AchievementItem } from '../../types/cvTypes';

// Parse skills string to array
const parseSkillsToArray = (skills: string): string[] => {
    if (!skills?.trim()) return [];
    if (skills.includes(',')) {
        return skills.split(',').map(s => s.trim()).filter(s => s);
    }
    return skills.split('\n')
        .map(s => s.trim().replace(/^[•\-*]\s*/, ''))
        .filter(s => s);
};

export const calculatePersonalScore = (
    personalInfo: any,
    phoneNumber: string
): number => {
    let score = 0;
    if (personalInfo.name?.trim()) score += 25;
    if (personalInfo.title?.trim()) score += 25;
    if (personalInfo.email?.includes('@') && personalInfo.email?.includes('.')) score += 25;
    if (phoneNumber?.trim().length >= 7) score += 25;
    return score;
};

export const calculateExperienceScore = (
    experiences: ExperienceItem[]
): number => {
    const validExperiences = experiences.filter(exp =>
        exp.title?.trim() && exp.company?.trim()
    );
    if (validExperiences.length === 0) return 0;
    let score = Math.min(validExperiences.length * 50, 100);
    const hasDescriptions = validExperiences.some(
        exp => exp.description?.trim().length > 20
    );
    if (hasDescriptions && validExperiences.length >= 1) {
        score = Math.min(score + 20, 100);
    }
    return score;
};

export const calculateEducationScore = (
    educations: EducationItem[]
): number => {
    const validEducations = educations.filter(edu =>
        edu.degree?.trim() && edu.institution?.trim()
    );
    if (validEducations.length === 0) return 0;
    return Math.min(validEducations.length * 50, 100);
};

export const calculateProjectsScore = (
    projects: ProjectItem[]
): number => {
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

export const calculateSkillsScore = (skills: string): number => {
    if (!skills?.trim()) return 0;
    const skillArray = parseSkillsToArray(skills);
    if (skillArray.length === 0) return 0;
    if (skillArray.length === 1) return 20;
    if (skillArray.length === 2) return 40;
    if (skillArray.length >= 3 && skillArray.length <= 5) return 70;
    if (skillArray.length >= 6) return 100;
    return 0;
};

export const calculateSummaryScore = (summary: string): number => {
    if (!summary?.trim()) return 0;
    const length = summary.trim().length;
    if (length < 30) return 30;
    if (length < 60) return 60;
    if (length < 100) return 80;
    return 100;
};

export const calculateLanguagesScore = (
    languages: LanguageItem[]
): number => {
    const validLanguages = languages.filter(l => l.language?.trim());
    if (validLanguages.length === 0) return 0;
    return Math.min(validLanguages.length * 35, 100);
};

export const calculateCertificationsScore = (
    certifications: CertificationItem[]
): number => {
    const validCerts = certifications.filter(c => c.name?.trim());
    if (validCerts.length === 0) return 0;
    return Math.min(validCerts.length * 34, 100);
};

export const calculateAchievementsScore = (
    achievements: AchievementItem[]
): number => {
    const validAchievements = achievements.filter(a => a.title?.trim());
    if (validAchievements.length === 0) return 0;
    return Math.min(validAchievements.length * 34, 100);
};

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

export const calculateAllScores = (
    personalInfo: any,
    phoneNumber: string,
    experiences: ExperienceItem[],
    educations: EducationItem[],
    projects: ProjectItem[],
    skills: string,
    languages: LanguageItem[],
    certifications: CertificationItem[],
    achievements: AchievementItem[],
    professionalSummary: string
): SectionScores => {
    return {
        Personal: calculatePersonalScore(personalInfo, phoneNumber),
        Experience: calculateExperienceScore(experiences),
        Education: calculateEducationScore(educations),
        Projects: calculateProjectsScore(projects),
        Skills: calculateSkillsScore(skills),
        Summary: calculateSummaryScore(professionalSummary),
        Languages: calculateLanguagesScore(languages),
        Certifications: calculateCertificationsScore(certifications),
        Achievements: calculateAchievementsScore(achievements)
    };
};

export const getCompletionPercentage = (sectionScores: SectionScores): number => {
    return Math.round(
        (sectionScores.Personal + sectionScores.Education + 
         sectionScores.Skills + sectionScores.Summary) / 4
    );
};