// utils/professionDetector/detection/sales.ts
// ============================================
// SALES & MARKETING PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectSales = (t: string): Profession | null => {
    // ===== SPECIFIC SALES (Pehle check) =====
    if (t.includes('digital marketing') || t.includes('digital marketer')) return 'digital-marketing';
    if (t.includes('seo') || t.includes('search engine optimization')) return 'seo';
    if (t.includes('performance marketer') || t.includes('ppc')) return 'performance-marketer';
    if (t.includes('content creator') || t.includes('content writer')) return 'content-creator';
    if (t.includes('copywriter')) return 'copywriter';
    if (t.includes('journalist') || t.includes('reporter')) return 'journalist';
    if (t.includes('pr specialist') || t.includes('public relations')) return 'pr-specialist';
    
    // ===== NEW SALES PROFESSIONS =====
    if (t.includes('customer support specialist') || t.includes('customer service')) return 'customer-support-specialist';
    
    // ===== GENERAL SALES & MARKETING (Baad me check) =====
    if (t.includes('sales') || t.includes('account executive') || 
        t.includes('business development') || t.includes('bdm')) return 'sales';
    if (t.includes('marketing') || t.includes('brand')) return 'marketing';
    
    return null;
};