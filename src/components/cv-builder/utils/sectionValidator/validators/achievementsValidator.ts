// utils/sectionValidator/validators/achievementsValidator.ts
// ============================================
// ACHIEVEMENTS VALIDATOR
// ============================================

import { AchievementItem, SectionStatus } from '../../types/cvTypes';

export const validateAchievementsSection = (achievements: AchievementItem[]): SectionStatus => {
    const validAchievements = achievements.filter(a => a.title?.trim().length > 0);

    if (validAchievements.length === 0) {
        return { isComplete: true, score: 100, weakPoints: [] };
    }

    let completed = 0;
    const total = validAchievements.length * 3;

    validAchievements.forEach(ach => {
        if (ach.title?.trim()) completed++;
        if (ach.date?.trim()) completed++;
        if (ach.description?.trim().length > 20) completed++;
    });

    const score = Math.min(Math.round((completed / total) * 100), 100);
    return { isComplete: true, score, weakPoints: [] };
};