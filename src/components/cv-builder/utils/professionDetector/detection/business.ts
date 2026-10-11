// utils/professionDetector/detection/business.ts
// ============================================
// BUSINESS PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectBusiness = (t: string): Profession | null => {
    // ===== SPECIFIC BUSINESS PROFESSIONS (Pehle check) =====
    if (t.includes('project manager') || t.includes('project lead') || 
        t.includes('scrum master') || t.includes('agile')) return 'project-manager';
    if (t.includes('product manager') || t.includes('product owner')) return 'product-manager';
    if (t.includes('operations manager') || t.includes('ops manager')) return 'operations-manager';
    if (t.includes('entrepreneur') || t.includes('founder') || t.includes('startup') || 
        t.includes('ceo') || t.includes('cto') || t.includes('cfo') || t.includes('cmo')) return 'entrepreneur';
    if (t.includes('business analyst')) return 'business-analyst';
    if (t.includes('supply chain analyst')) return 'supply-chain-analyst';
    if (t.includes('supply chain manager') || t.includes('scm manager')) return 'supply-chain-manager';
    if (t.includes('procurement officer') || t.includes('procurement')) return 'procurement-officer';
    if (t.includes('logistics manager') || t.includes('logistics')) return 'logistics-manager';
    if (t.includes('business development executive') || t.includes('bde') || t.includes('business development')) return 'business-development-executive';
    if (t.includes('supply chain') || t.includes('logistics')) return 'supply-chain';
    if (t.includes('consultant') || t.includes('consulting')) return 'consultant';
    
    // ===== BATCH 2 - NEW BUSINESS PROFESSIONS =====
    if (t.includes('procurement manager')) return 'procurement-manager';
    if (t.includes('sales manager') || t.includes('sales lead')) return 'sales-manager';
    if (t.includes('sales executive') || t.includes('sales representative')) return 'sales-executive';
    if (t.includes('store manager')) return 'store-manager';
    if (t.includes('retail manager')) return 'retail-manager';
    
    // ===== GENERAL BUSINESS (Baad me check) =====
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || t.includes('business operations')) {
        return 'business';
    }
    
    return null;
};