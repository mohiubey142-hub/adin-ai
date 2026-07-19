// utils/sectionValidator/helpers/completionStatus.ts
// ============================================
// COMPLETION STATUS
// ============================================

import { SectionStatus } from '../../types/cvTypes';

export const getCompletionStatus = (
    completed: number, 
    total: number, 
    weakPoints: string[]
): SectionStatus => {
    const score = total > 0 ? Math.round((completed / total) * 100) : 0;
    const isComplete = completed === total && total > 0;
    return { isComplete, score, weakPoints };
};