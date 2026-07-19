// utils/sectionValidator/validators/educationValidator.ts
// ============================================
// EDUCATION VALIDATOR
// ============================================

import { EducationItem, SectionStatus } from '../../types/cvTypes';

export const validateEducationSection = (educations: EducationItem[]): SectionStatus => {
    const weakPoints: string[] = [];

    const validEducations = educations.filter(edu => 
        edu.degree?.trim().length > 0 && edu.institution?.trim().length > 0
    );

    if (validEducations.length === 0) {
        weakPoints.push('Add at least one education entry');
        return { isComplete: false, score: 0, weakPoints };
    }

    let completed = 0;
    const total = validEducations.length * 4;

    validEducations.forEach(edu => {
        if (edu.degree?.trim()) completed++;
        if (edu.institution?.trim()) completed++;
        if (edu.year?.trim()) completed++;
        if (edu.grade?.trim()) completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    const isComplete = validEducations.length >= 1;

    return { isComplete, score, weakPoints };
};