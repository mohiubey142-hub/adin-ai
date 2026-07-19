// utils/sectionValidator/validators/summaryValidator.ts
// ============================================
// SUMMARY VALIDATOR
// ============================================

import { SectionStatus } from '../../types/cvTypes';

export const validateSummarySection = (summary: string): SectionStatus => {
    const weakPoints: string[] = [];

    if (!summary?.trim()) {
        weakPoints.push('Professional Summary is required');
        return { isComplete: false, score: 0, weakPoints };
    }

    const length = summary.trim().length;
    let score = 0;

    if (length >= 150) score = 100;
    else if (length >= 120) score = 95;
    else if (length >= 100) score = 88;
    else if (length >= 80) score = 78;
    else if (length >= 65) score = 65;
    else if (length >= 50) score = 50;
    else {
        score = 30;
        weakPoints.push(`Summary is too short (${length}/50 minimum)`);
    }

    if (length < 100) {
        weakPoints.push(`Add ${100 - length} more characters for better summary`);
    }

    const isComplete = length >= 50;
    return { isComplete, score, weakPoints };
};