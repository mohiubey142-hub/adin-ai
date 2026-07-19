// utils/sectionValidator/validators/skillsValidator.ts
// ============================================
// SKILLS VALIDATOR
// ============================================

import { SectionStatus } from '../../types/cvTypes';
import { parseSkillsToArray } from '../helpers';

export const validateSkillsSection = (skills: string): SectionStatus => {
    const weakPoints: string[] = [];
    const skillList = parseSkillsToArray(skills);
    const count = skillList.length;

    if (count === 0) {
        weakPoints.push('Add at least one skill');
        return { isComplete: false, score: 0, weakPoints };
    }

    let score = 0;
    if (count >= 8) score = 100;
    else if (count >= 6) score = 90;
    else if (count >= 5) score = 80;
    else if (count >= 4) score = 70;
    else if (count >= 3) score = 60;
    else if (count >= 2) score = 50;
    else if (count >= 1) score = 40;

    if (count < 3) {
        weakPoints.push(`Add ${3 - count} more skill(s) for better score`);
    }

    return { isComplete: true, score, weakPoints };
};