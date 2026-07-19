// ============================================
// 🚀 UTILITIES INDEX - All Exports
// Complete Export File for All Utilities
// ============================================

// ============================================
// AI GENERATORS
// ============================================
export {
    // Main generation
    generateDescriptionFromData,
    generateSmartProjectDescription,
    generateSmartAchievementDescription,
    generateSkillsFromData,
    enhanceUserSkills,
    detectProfession,
    normalizeJobTitle,
    getYearsForCurrentExp,
    fixJobTitleSpelling,
    validateAndSuggestEmail,
    formatLanguageProficiency,
    resetExperienceCache,
    
    // Grammar (from aiGenerators)
    polishGrammar,
    
    // Fallback System (from aiGenerators)
    generateCVFromQA,
    generateFallbackCV,
    generateFallbackBullets,
    generateFallbackSummary,
    generateSmartQuestions,
    
    // Grammar Expert (from aiGenerators)
    polishText,
    polishBullets,
    fixGrammar,
    needsPolishing,
    getPolishingSuggestions
} from './aiGenerators';

// ============================================
// PROFESSION DETECTOR
// ============================================
export {
    detectProfession as detectProfessionStrict,
    getProfessionLabel,
    getProfessionCategory,
    isValidProfession,
    testProfessionDetector
} from './professionDetector';

// ============================================
// SENIORITY DETECTOR
// ============================================
export {
    detectSeniority,
    getSeniorityLabel,
    getSeniorityYears,
    isValidSeniority,
    getSeniorityFromYears,
    detectSeniorityStrict,
    getSeniorityScore,
    testSeniorityDetector
} from './seniorityDetector';

// ============================================
// ATS CALCULATOR
// ============================================
export {
    calculateATSScore,
    getATSBreakdown,
    getStrengthStatus,
    getATSFeedback,
    getDetailedScore,
    testATSCalculator
} from './atsCalculator';

// ============================================
// SECTION VALIDATOR
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
    validateSummarySection,
    getFinalCVScore,
    getQualityRating,
    getATSFeedback as getATSFeedbackFromValidator,
    getSectionSummary
} from './sectionValidator';

// ============================================
// PHONE VALIDATION
// ============================================
export {
    validatePhoneNumber,
    getFullPhoneNumber,
    getCountryByCode
} from './phoneValidation';

// ============================================
// 📄 PDF GENERATOR - NEW ARCHITECTURE
// ============================================
// Main router - decides which PDF generator to call
export {
    generateTextPDF
} from './pdfGeneratorText';

// Individual PDF generators (for direct access if needed)
export {
    generateModernPDF,
    generateClassicPDF,
    generateMinimalPDF
} from './pdf';

// ============================================
// PROFESSION POOLS (All 60+)
// ============================================
export * from './pools/index';

// ============================================
// ✅ NEW: ENHANCERS (Full English Expert)
// ============================================
export {
    // Action Verbs
    ACTION_VERBS,
    getRandomVerb,
    getAllActionVerbs,
    isActionVerb,
    suggestStrongerVerb
} from './enhancers/actionVerbs';

export {
    // CV Cleaner
    removeDiaryPhrases,
    fixActionVerbPatterns,
    removeRedundantAnd,
    removeDuplicateHeadings,
    removePageNumbers,
    cleanCVText,
    hasDiaryStyle,
    getDiaryStyleSuggestions
} from './enhancers/cvCleaner';

export {
    // Profession Normalizer
    normalizeCompanyName,
    normalizeNumbers,
    normalizeTechNames,
    formatLanguages,
    organizeSkills,
    normalizeCVText
} from './enhancers/professionNormalizer';

export {
    // Main Enhancer
    enhanceCVText,
    enhanceCVBullets,
    needsEnhancement,
    getEnhancementSuggestions
} from './enhancers/cvEnhancer';

// ============================================
// GRAMMAR EXPERT (Direct Export - Simplified)
// ============================================
export {
    polishText as polishTextExpert,
    polishBullets as polishBulletsExpert,
    fixGrammar as fixGrammarExpert,
    needsPolishing as needsPolishingExpert,
    getPolishingSuggestions as getPolishingSuggestionsExpert,
    testGrammarExpert
} from './grammarExpert';

// ============================================
// FALLBACK SYSTEM (Direct Export)
// ============================================
export {
    generateSmartQuestions as generateSmartQuestionsFallback,
    generateFromAnswers,
    generateCVFromQA as generateCVFromQAFallback
} from './fallback/guidedQAFallback';

export type {
    QAResponse,
    GeneratedContent
} from './fallback/guidedQAFallback';

// ============================================
// PROFESSION DETECTOR (Direct Export)
// ============================================
export type {
    Profession
} from './professionDetector';

// ============================================
// SENIORITY DETECTOR (Direct Export)
// ============================================
export type {
    SeniorityLevel
} from './seniorityDetector';

// ============================================
// ATS CALCULATOR (Direct Export)
// ============================================
export type {
    ATSParams
} from './atsCalculator';

// ============================================
// SECTION VALIDATOR (Direct Export)
// ============================================
export type {
    SectionStatus
} from './sectionValidator';

// ============================================
// DEFAULT EXPORT — All Utils Object
// ============================================
import * as allUtils from './aiGenerators';
import * as professionDetector from './professionDetector';
import * as seniorityDetector from './seniorityDetector';
import * as atsCalculator from './atsCalculator';
import * as sectionValidator from './sectionValidator';
import * as phoneValidation from './phoneValidation';
import * as pdfGenerator from './pdfGeneratorText';
import * as pdfGenerators from './pdf';  // NEW: Individual PDF generators
import * as grammarExpert from './grammarExpert';
import * as fallbackSystem from './fallback/guidedQAFallback';
import * as pools from './pools/index';
import * as actionVerbs from './enhancers/actionVerbs';
import * as cvCleaner from './enhancers/cvCleaner';
import * as professionNormalizer from './enhancers/professionNormalizer';
import * as cvEnhancer from './enhancers/cvEnhancer';

export const Utils = {
    ...allUtils,
    ...professionDetector,
    ...seniorityDetector,
    ...atsCalculator,
    ...sectionValidator,
    ...phoneValidation,
    ...pdfGenerator,
    ...pdfGenerators,  // NEW: Adds generateModernPDF, generateClassicPDF, generateMinimalPDF
    ...grammarExpert,
    ...fallbackSystem,
    ...pools,
    ...actionVerbs,
    ...cvCleaner,
    ...professionNormalizer,
    ...cvEnhancer
};

export default Utils;