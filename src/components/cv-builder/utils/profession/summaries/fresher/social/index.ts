// utils/profession/summaries/fresher/social/index.ts
// ============================================
// SOCIAL FRESHER TEMPLATES - Combined Exports
// ============================================

import { SOCIAL_SCIENCES_FRESHER } from './socialSciences.fresher';
import { HR_FRESHER } from './hr.fresher';

export const SOCIAL_FRESHER_TEMPLATES: Record<string, string[]> = {
    socialSciences: SOCIAL_SCIENCES_FRESHER,
    hr: HR_FRESHER
};