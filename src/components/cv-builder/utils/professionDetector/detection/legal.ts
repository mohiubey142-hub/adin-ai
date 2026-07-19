// utils/professionDetector/detection/legal.ts
// ============================================
// LEGAL PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectLegal = (t: string): Profession | null => {
    // ===== SPECIFIC LEGAL (Pehle check) =====
    if (t.includes('judge') || t.includes('justice')) return 'judge';
    if (t.includes('legal advisor') || t.includes('legal counsel')) return 'legal-advisor';
    if (t.includes('barrister')) return 'barrister';
    if (t.includes('attorney')) return 'attorney';
    if (t.includes('advocate')) return 'advocate';
    if (t.includes('lawyer') || t.includes('law')) return 'lawyer';
    if (t.includes('law') || t.includes('llb') || t.includes('legal')) return 'law';
    
    return null;
};