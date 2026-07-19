// utils/professionDetector/detection/commerce.ts
// ============================================
// COMMERCE & FINANCE PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectCommerce = (t: string): Profession | null => {
    // ===== SPECIFIC FINANCE PROFESSIONS (Pehle check) =====
    if (t.includes('investment banker') || t.includes('investment banking')) return 'investment-banker';
    if (t.includes('financial analyst')) return 'financial-analyst';
    if (t.includes('auditor') || t.includes('auditing')) return 'auditor';
    if (t.includes('tax consultant')) return 'tax-consultant';
    if (t.includes('credit analyst')) return 'credit-analyst';
    if (t.includes('treasury manager')) return 'treasury-manager';
    if (t.includes('fintech') || t.includes('financial technology')) return 'fintech';
    if (t.includes('risk manager') || t.includes('risk management')) return 'risk-manager';
    if (t.includes('banker') || t.includes('banking')) return 'banker';
    
    // ===== GENERAL ACCOUNTING (Baad me check) =====
    if (t.includes('accountant') || t.includes('accounting') || t.includes('finance') || 
        t.includes('controller') || t.includes('cpa') || t.includes('bookkeeper')) {
        return 'accountant';
    }
    
    return null;
};