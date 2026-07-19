// utils/sectionValidator.ts
// ============================================
// SECTION VALIDATOR - ENTRY POINT
// ============================================
// 
// 🚀 This file is the main entry point for all validation logic.
// All validation functions are exported from modular sub-folders.
// 
// ============================================

// ============================================
// HELPERS
// ============================================
export { parseSkillsToArray, getCompletionStatus } from './sectionValidator/helpers';

// ============================================
// VALIDATORS - All Section Validations
// ============================================
export {
    validatePersonalSection,
    validateExperienceSection,
    validateEducationSection,
    validateProjectsSection,
    validateSkillsSection,
    validateCertificationsSection,
    validateLanguagesSection,
    validateAchievementsSection,
    validateSummarySection
} from './sectionValidator/validators';

// ============================================
// SCORE CALCULATOR
// ============================================
export { getFinalCVScore } from './sectionValidator/score';

// ============================================
// QUALITY RATING
// ============================================
export { getQualityRating } from './sectionValidator/rating';

// ============================================
// ATS FEEDBACK
// ============================================
export { getATSFeedback } from './sectionValidator/feedback';

// ============================================
// SECTION SUMMARY
// ============================================
export { getSectionSummary } from './sectionValidator/summary';

// ============================================
// TYPES - Re-export for convenience
// ============================================
export type { SectionStatus } from './types/cvTypes';