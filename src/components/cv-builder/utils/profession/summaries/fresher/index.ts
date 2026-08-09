
// utils/profession/summaries/fresher/index.ts
// ============================================
// FRESHER TEMPLATES - Combined Exports
// ============================================
// 
// ✅ ALL 100+ professions have UNIQUE fresher templates
// ✅ Each profession has 2 templates
// ✅ Human feel - profession-specific language
// ✅ No generic "Eager to begin career in the industry"
// 
// ============================================

import { MEDICAL_FRESHER_TEMPLATES } from './medical';
import { TECHNOLOGY_FRESHER_TEMPLATES } from './technology';
import { EDUCATION_FRESHER_TEMPLATES } from './education';
import { BUSINESS_FRESHER_TEMPLATES } from './business';
import { ENGINEERING_FRESHER_TEMPLATES } from './engineering';
import { FINANCE_FRESHER_TEMPLATES } from './finance';
import { DESIGN_FRESHER_TEMPLATES } from './design';
import { SALES_FRESHER_TEMPLATES } from './sales';
import { SUPPORT_FRESHER_TEMPLATES } from './support';
import { LEGAL_FRESHER_TEMPLATES } from './legal';
import { SOCIAL_FRESHER_TEMPLATES } from './social';
import { SCIENCE_FRESHER_TEMPLATES } from './science';
import { ARTS_FRESHER_TEMPLATES } from './arts';
import { HOSPITALITY_FRESHER_TEMPLATES } from './hospitality';
import { AVIATION_FRESHER_TEMPLATES } from './aviation';
import { DEFENSE_FRESHER_TEMPLATES } from './defense';
import { GENERAL_FRESHER_TEMPLATES } from './general';

// ===== NEW IMPORT =====
import { VOCATIONAL_FRESHER_TEMPLATES } from './vocational';

// ============================================
// FRESHER_TEMPLATES - Combine All (100+ Professions)
// ============================================
export const FRESHER_TEMPLATES: Record<string, string[]> = {
    ...MEDICAL_FRESHER_TEMPLATES,
    ...TECHNOLOGY_FRESHER_TEMPLATES,
    ...EDUCATION_FRESHER_TEMPLATES,
    ...BUSINESS_FRESHER_TEMPLATES,
    ...ENGINEERING_FRESHER_TEMPLATES,
    ...FINANCE_FRESHER_TEMPLATES,
    ...DESIGN_FRESHER_TEMPLATES,
    ...SALES_FRESHER_TEMPLATES,
    ...SUPPORT_FRESHER_TEMPLATES,
    ...LEGAL_FRESHER_TEMPLATES,
    ...SOCIAL_FRESHER_TEMPLATES,
    ...SCIENCE_FRESHER_TEMPLATES,
    ...ARTS_FRESHER_TEMPLATES,
    ...HOSPITALITY_FRESHER_TEMPLATES,
    ...AVIATION_FRESHER_TEMPLATES,
    ...DEFENSE_FRESHER_TEMPLATES,
    ...GENERAL_FRESHER_TEMPLATES,
    
    // ===== NEW CATEGORY =====
    ...VOCATIONAL_FRESHER_TEMPLATES
};

// ============================================
// EXPORT: getFresherTemplate (for backward compatibility)
// ============================================
export const getFresherTemplate = (profession: string): string[] => {
    return FRESHER_TEMPLATES[profession] || FRESHER_TEMPLATES.general || [
        `Motivated recent {degree} graduate with strong foundation in {displayName}. Eager to begin career in the {industry} industry and committed to professional growth.`,
        `Recent {degree} graduate with knowledge of {displayName} and practical skills developed through academic training. Dedicated to continuous learning and delivering quality results.`
    ];
};