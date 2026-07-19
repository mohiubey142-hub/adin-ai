// utils/sectionValidator/score/cvScoreCalculator.ts
// ============================================
// CV SCORE CALCULATOR
// ============================================

import { SectionStatus } from '../../types/cvTypes';

export const getFinalCVScore = (sections: {
    personal?: SectionStatus;
    experience?: SectionStatus;
    education?: SectionStatus;
    skills?: SectionStatus;
    summary?: SectionStatus;
    projects?: SectionStatus;
    certifications?: SectionStatus;
    languages?: SectionStatus;
    achievements?: SectionStatus;
}): number => {
    const weights: Record<string, number> = {
        personal: 30,
        education: 25,
        skills: 25,
        summary: 20
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
        const status = sections[key as keyof typeof sections];
        if (status && typeof status.score === 'number' && !isNaN(status.score)) {
            totalScore += status.score * (weight / 100);
            totalWeight += weight;
        }
    }

    if (totalWeight === 0) return 0;

    let finalScore = (totalScore / totalWeight) * 100;

    // Bonus for optional sections (max 5% extra)
    if (sections.experience && sections.experience.score > 70) finalScore += 2;
    if (sections.projects && sections.projects.score > 70) finalScore += 1.5;
    if (sections.certifications && sections.certifications.score === 100) finalScore += 1;
    if (sections.languages && sections.languages.score === 100) finalScore += 0.5;

    return Math.min(Math.round(finalScore), 100);
};