// utils/sectionValidator/validators/experienceValidator.ts
// ============================================
// EXPERIENCE VALIDATOR
// ============================================

import { ExperienceItem, SectionStatus } from '../../types/cvTypes';

export const validateExperienceSection = (experiences: ExperienceItem[]): SectionStatus => {
    const validExperiences = experiences.filter(exp => 
        exp.title?.trim().length > 0 && exp.company?.trim().length > 0
    );

    if (validExperiences.length === 0) {
        return { isComplete: true, score: 100, weakPoints: [] };
    }

    let completed = 0;
    const total = validExperiences.length * 5;

    validExperiences.forEach(exp => {
        if (exp.title?.trim()) completed++;
        if (exp.company?.trim()) completed++;
        if (exp.startDate?.trim()) completed++;
        if (exp.endDate?.trim()) completed++;
        if (exp.description?.trim().length > 30) completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    return { isComplete: true, score, weakPoints: [] };
};