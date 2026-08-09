// utils/profession/summaries/templates/technology/index.ts
// ============================================
// TECHNOLOGY TEMPLATES - Combined Exports
// ============================================
// 
// ✅ Combines all technology sub-categories
// ✅ EXACT SAME output as before
// ✅ Only imports changed to sub-files
// 
// ============================================

import { DEVELOPERS_TEMPLATES } from './developers';
import { ENGINEERS_TEMPLATES } from './engineers';
import { INFRASTRUCTURE_TEMPLATES } from './infrastructure';
import { DATA_TEMPLATES } from './data';
import { SUPPORT_TEMPLATES } from './support';

// ===== NEW IMPORTS =====
import { QA_ENGINEER_TEMPLATES } from './qaEngineer';
import { DATA_ENGINEER_TEMPLATES } from './dataEngineer';
import { COMPUTER_OPERATOR_TEMPLATES } from './computerOperator';

export const TECHNOLOGY_TEMPLATES: Record<string, Record<string, string[]>> = {
    ...DEVELOPERS_TEMPLATES,
    ...ENGINEERS_TEMPLATES,
    ...INFRASTRUCTURE_TEMPLATES,
    ...DATA_TEMPLATES,
    ...SUPPORT_TEMPLATES,
    
    // ===== NEW PROFESSIONS - FIXED =====
    qa: QA_ENGINEER_TEMPLATES,
    dataEngineer: DATA_ENGINEER_TEMPLATES,
    computerOperator: COMPUTER_OPERATOR_TEMPLATES
};