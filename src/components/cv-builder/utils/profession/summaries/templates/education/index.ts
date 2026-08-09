// utils/profession/summaries/templates/education/index.ts
// ============================================
// EDUCATION TEMPLATES - Combined Exports
// ============================================
// 
// ✅ Combines all education sub-categories
// ✅ EXACT SAME output as before
// ✅ Only imports changed to sub-files
// 
// ============================================

import { GENERAL_TEMPLATES } from './general';
import { SUBJECTS_TEMPLATES } from './subjects';

// ===== NEW IMPORT =====
import { LECTURER_TEMPLATES } from './lecturer';

export const EDUCATION_TEMPLATES: Record<string, Record<string, string[]>> = {
    ...GENERAL_TEMPLATES,
    ...SUBJECTS_TEMPLATES,
    
    // ===== NEW PROFESSION - FIXED =====
    lecturer: LECTURER_TEMPLATES
};