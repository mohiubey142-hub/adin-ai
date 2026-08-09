// utils/profession/summaries/templates/business/index.ts
// ============================================
// BUSINESS TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { BUSINESS_TEMPLATES as BUSINESS } from './business';
import { BUSINESS_ANALYST_TEMPLATES } from './businessAnalyst';
import { BUSINESS_DEVELOPMENT_EXECUTIVE_TEMPLATES } from './businessDevelopmentExecutive';
import { PROJECT_MANAGER_TEMPLATES } from './projectManager';
import { OPERATIONS_MANAGER_TEMPLATES } from './operationsManager';
import { ENTREPRENEUR_TEMPLATES } from './entrepreneur';

// ===== NEW IMPORTS =====
import { SUPPLY_CHAIN_ANALYST_TEMPLATES } from './supplyChainAnalyst';

// Recreate the exact same structure as the original BUSINESS_TEMPLATES
export const BUSINESS_TEMPLATES = {
    business: BUSINESS,
    businessAnalyst: BUSINESS_ANALYST_TEMPLATES,
    businessDevelopmentExecutive: BUSINESS_DEVELOPMENT_EXECUTIVE_TEMPLATES,
    projectManager: PROJECT_MANAGER_TEMPLATES,
    operationsManager: OPERATIONS_MANAGER_TEMPLATES,
    entrepreneur: ENTREPRENEUR_TEMPLATES,
    
    // ===== NEW PROFESSION =====
    supplyChainAnalyst: SUPPLY_CHAIN_ANALYST_TEMPLATES
};

// Default export to maintain compatibility
export default BUSINESS_TEMPLATES;