// utils/profession/summaries/templates/sales/index.ts
// ============================================
// SALES TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { SALES_TEMPLATES as SALES } from './sales';
import { MARKETING_TEMPLATES } from './marketing';
import { DIGITAL_MARKETING_TEMPLATES } from './digitalMarketing';
import { SEO_TEMPLATES } from './seo';
import { PERFORMANCE_MARKETER_TEMPLATES } from './performanceMarketer';

// ===== NEW IMPORT =====
import { MEDICAL_SALES_REPRESENTATIVE_TEMPLATES } from './medicalSalesRepresentative';

// Recreate the exact same structure as the original SALES_TEMPLATES
export const SALES_TEMPLATES = {
    sales: SALES,
    marketing: MARKETING_TEMPLATES,
    digitalMarketing: DIGITAL_MARKETING_TEMPLATES,
    seo: SEO_TEMPLATES,
    performanceMarketer: PERFORMANCE_MARKETER_TEMPLATES,
    
    // ===== NEW PROFESSION =====
    medicalSalesRepresentative: MEDICAL_SALES_REPRESENTATIVE_TEMPLATES
};

// Default export to maintain compatibility
export default SALES_TEMPLATES;