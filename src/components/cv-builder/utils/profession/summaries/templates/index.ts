// utils/profession/summaries/templates/index.ts
// ============================================
// TEMPLATES INDEX - Combine All Profession Templates
// ============================================
// 
// ✅ Re-exports all templates from sub-folders
// ✅ EXACT SAME output as before
// ✅ Import paths updated to sub-folders
// 
// ============================================

// ============================================
// IMPORT ALL CATEGORY TEMPLATES (from sub-folders)
// ============================================

// Medical (13 professions) - moved to sub-folder
import { MEDICAL_TEMPLATES } from './medical';

// Technology (17 professions) - moved to sub-folder
import { TECHNOLOGY_TEMPLATES } from './technology';

// Education (12 professions) - moved to sub-folder
import { EDUCATION_TEMPLATES } from './education';

// Business (6 professions)
import { BUSINESS_TEMPLATES } from './business';

// Engineering (3 professions)
import { ENGINEERING_TEMPLATES } from './engineering';

// Finance (4 professions)
import { FINANCE_TEMPLATES } from './finance';

// Design (4 professions)
import { DESIGN_TEMPLATES } from './design';

// Sales/Marketing (5 professions)
import { SALES_TEMPLATES } from './sales';

// Customer Support (1 profession)
import { SUPPORT_TEMPLATES } from './support';

// Legal (1 profession)
import { LEGAL_TEMPLATES } from './legal';

// Social Sciences (2 professions)
import { SOCIAL_TEMPLATES } from './social';

// Science (1 profession)
import { SCIENCE_TEMPLATES } from './science';

// Arts (1 profession)
import { ARTS_TEMPLATES } from './arts';

// Hospitality (5 professions)
import { HOSPITALITY_TEMPLATES } from './hospitality';

// Aviation (1 profession)
import { AVIATION_TEMPLATES } from './aviation';

// Defense (1 profession)
import { DEFENSE_TEMPLATES } from './defense';

// General (Fallback - 1 profession)
import { GENERAL_TEMPLATES } from './general';

// ===== NEW IMPORT - VOCATIONAL (10 professions) =====
import { VOCATIONAL_TEMPLATES } from './vocational';

// ============================================
// PROFESSIONAL_TEMPLATES - Combine All (EXACT SAME as before)
// ============================================
export const PROFESSIONAL_TEMPLATES: Record<string, Record<string, string[]>> = {
    ...MEDICAL_TEMPLATES,
    ...TECHNOLOGY_TEMPLATES,
    ...EDUCATION_TEMPLATES,
    ...BUSINESS_TEMPLATES,
    ...ENGINEERING_TEMPLATES,
    ...FINANCE_TEMPLATES,
    ...DESIGN_TEMPLATES,
    ...SALES_TEMPLATES,
    ...SUPPORT_TEMPLATES,
    ...LEGAL_TEMPLATES,
    ...SOCIAL_TEMPLATES,
    ...SCIENCE_TEMPLATES,
    ...ARTS_TEMPLATES,
    ...HOSPITALITY_TEMPLATES,
    ...AVIATION_TEMPLATES,
    ...DEFENSE_TEMPLATES,
    ...GENERAL_TEMPLATES,
    
    // ===== NEW CATEGORY =====
    ...VOCATIONAL_TEMPLATES
};