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
    if (t.includes('supply chain') || t.includes('logistics')) return 'supply-chain';
    if (t.includes('consultant') || t.includes('consulting')) return 'consultant';
    
    // ===== GENERAL BUSINESS (Baad me check) =====
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || t.includes('business operations')) {
        return 'business';
    }
    
    return null;
};