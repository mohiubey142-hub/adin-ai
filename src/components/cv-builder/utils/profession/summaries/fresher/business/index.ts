// utils/profession/summaries/fresher/business/index.ts
// ============================================
// BUSINESS FRESHER TEMPLATES - Combined Exports
// ============================================

import { BUSINESS_FRESHER } from './business.fresher';
import { BUSINESS_ANALYST_FRESHER } from './businessAnalyst.fresher';
import { BUSINESS_DEVELOPMENT_EXECUTIVE_FRESHER } from './businessDevelopmentExecutive.fresher';
import { PROJECT_MANAGER_FRESHER } from './projectManager.fresher';
import { OPERATIONS_MANAGER_FRESHER } from './operationsManager.fresher';
import { ENTREPRENEUR_FRESHER } from './entrepreneur.fresher';

// ===== NEW IMPORT =====
import { SUPPLY_CHAIN_ANALYST_FRESHER } from './supplyChainAnalyst.fresher';

export const BUSINESS_FRESHER_TEMPLATES: Record<string, string[]> = {
    business: BUSINESS_FRESHER,
    businessAnalyst: BUSINESS_ANALYST_FRESHER,
    businessDevelopmentExecutive: BUSINESS_DEVELOPMENT_EXECUTIVE_FRESHER,
    projectManager: PROJECT_MANAGER_FRESHER,
    operationsManager: OPERATIONS_MANAGER_FRESHER,
    entrepreneur: ENTREPRENEUR_FRESHER,
    
    // ===== NEW PROFESSION =====
    supplyChainAnalyst: SUPPLY_CHAIN_ANALYST_FRESHER
};