// utils/profession/summaries/fresher/sales/index.ts
// ============================================
// SALES FRESHER TEMPLATES - Combined Exports
// ============================================

import { SALES_FRESHER } from './sales.fresher';
import { MARKETING_FRESHER } from './marketing.fresher';
import { DIGITAL_MARKETING_FRESHER } from './digitalMarketing.fresher';
import { SEO_FRESHER } from './seo.fresher';
import { PERFORMANCE_MARKETER_FRESHER } from './performanceMarketer.fresher';

// ===== NEW IMPORT =====
import { MEDICAL_SALES_REPRESENTATIVE_FRESHER } from './medicalSalesRepresentative.fresher';

export const SALES_FRESHER_TEMPLATES: Record<string, string[]> = {
    sales: SALES_FRESHER,
    marketing: MARKETING_FRESHER,
    digitalMarketing: DIGITAL_MARKETING_FRESHER,
    seo: SEO_FRESHER,
    performanceMarketer: PERFORMANCE_MARKETER_FRESHER,
    
    // ===== NEW PROFESSION =====
    medicalSalesRepresentative: MEDICAL_SALES_REPRESENTATIVE_FRESHER
};