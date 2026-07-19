// utils/sectionValidator/summary/sectionSummary.ts
// ============================================
// SECTION SUMMARY
// ============================================

import { SectionStatus } from '../../types/cvTypes';

export const getSectionSummary = (sections: Record<number, SectionStatus>): {
    total: number;
    completed: number;
    averageScore: number;
} => {
    const entries = Object.values(sections);
    const total = entries.length;
    const completed = entries.filter(s => s.isComplete).length;
    const averageScore = entries.length > 0 
        ? Math.round(entries.reduce((sum, s) => sum + (s.score || 0), 0) / entries.length)
        : 0;

    return { total, completed, averageScore };
};