// utils/profession/index.ts
// ============================================
// PROFESSION EXPORTS
// ============================================
// 
// ✅ Main entry point for all profession utilities
// ✅ Exports detection, bullets, and summaries
// ✅ Same API as before - NO BREAKING CHANGES
// 
// ============================================

// ============================================
// PROFESSION DETECTION
// ============================================
export { detectProfession } from './detection';

// ============================================
// PROFESSION BULLETS
// ============================================
export { getBulletsByProfession } from './bullets';

// ============================================
// PROFESSION SUMMARIES
// ============================================
// ✅ getProfessionalSummary - Main summary generator
// ✅ getIndustry - Industry detection helper
// ============================================
export { 
    getProfessionalSummary,
    getIndustry 
} from './summaries';

// ============================================
// TYPE RE-EXPORTS (if needed by external files)
// ============================================
// Note: SummaryLevel type is internal to summaries.ts
// No external types needed for now