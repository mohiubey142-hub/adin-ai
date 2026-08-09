// utils/profession/summaries/templates/finance/index.ts
// ============================================
// FINANCE TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { FINANCE_ANALYST_TEMPLATES } from './financeAnalyst';
import { FINANCIAL_ADVISOR_TEMPLATES } from './financialAdvisor';
import { ACCOUNTANT_TEMPLATES } from './accountant';
import { BANKER_TEMPLATES } from './banker';

// Recreate the exact same structure as the original FINANCE_TEMPLATES
export const FINANCE_TEMPLATES = {
    financeAnalyst: FINANCE_ANALYST_TEMPLATES,
    financialAdvisor: FINANCIAL_ADVISOR_TEMPLATES,
    accountant: ACCOUNTANT_TEMPLATES,
    banker: BANKER_TEMPLATES
};

// Default export to maintain compatibility
export default FINANCE_TEMPLATES;