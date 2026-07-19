import { ExperienceItem, EducationItem, ProjectItem, CertificationItem, LanguageItem, AchievementItem } from '../types/cvTypes';

export const hasExperienceData = (experiences: ExperienceItem[]): boolean => {
    return experiences.some(e => e.title?.trim() && e.company?.trim());
};

export const hasEducationData = (educations: EducationItem[]): boolean => {
    return educations.some(e => e.degree?.trim() && e.institution?.trim());
};

export const hasLanguageData = (languages: LanguageItem[]): boolean => {
    return languages.some(l => l.language?.trim() && l.proficiency?.trim());
};

export const hasSkillsData = (skills: string): boolean => {
    return !!skills.trim();
};

export const hasCertificationData = (certifications: CertificationItem[]): boolean => {
    return certifications.some(c => c.name?.trim());
};

export const hasProjectData = (projects: ProjectItem[]): boolean => {
    return projects.some(p => p.name?.trim() && p.description?.trim());
};

export const hasAchievementData = (achievements: AchievementItem[]): boolean => {
    return achievements.some(a => a.title?.trim() && a.description?.trim());
};

export const hasSummaryData = (summary: string): boolean => {
    return !!summary.trim();
};

export const getValidItems = <T extends { [key: string]: any }>(
    items: T[], 
    requiredFields: (keyof T)[]
): T[] => {
    return items.filter(item => 
        requiredFields.every(field => {
            const value = item[field];
            return value !== undefined && value !== null && String(value).trim() !== '';
        })
    );
};