// utils/sectionValidator/validators/languagesValidator.ts
// ============================================
// LANGUAGES VALIDATOR
// ============================================

import { LanguageItem, SectionStatus } from '../../types/cvTypes';

export const validateLanguagesSection = (languages: LanguageItem[]): SectionStatus => {
    const validLangs = languages.filter(l => l.language?.trim().length > 0);

    if (validLangs.length === 0) {
        return { isComplete: true, score: 100, weakPoints: [] };
    }

    let completed = 0;
    const total = validLangs.length * 2;

    validLangs.forEach(lang => {
        if (lang.language?.trim()) completed++;
        if (lang.proficiency?.trim() && lang.proficiency !== 'Beginner') completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    return { isComplete: true, score, weakPoints: [] };
};