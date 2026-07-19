// utils/professionDetector/detection/realestate.ts
// ============================================
// REAL ESTATE PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectRealEstate = (t: string): Profession | null => {
    // ===== SPECIFIC REAL ESTATE (Pehle check) =====
    if (t.includes('real estate agent') || t.includes('realtor')) return 'real-estate-agent';
    if (t.includes('insurance agent') || t.includes('insurance')) return 'insurance-agent';
    
    return null;
};