// utils/profession/summaries/fresher/finance/index.ts
// ============================================
// FINANCE FRESHER TEMPLATES - Combined Exports
// ============================================

import { FINANCE_ANALYST_FRESHER } from './financeAnalyst.fresher';
import { FINANCIAL_ADVISOR_FRESHER } from './financialAdvisor.fresher';
import { ACCOUNTANT_FRESHER } from './accountant.fresher';
import { BANKER_FRESHER } from './banker.fresher';

export const FINANCE_FRESHER_TEMPLATES: Record<string, string[]> = {
    financeAnalyst: FINANCE_ANALYST_FRESHER,
    financialAdvisor: FINANCIAL_ADVISOR_FRESHER,
    accountant: ACCOUNTANT_FRESHER,
    banker: BANKER_FRESHER
};