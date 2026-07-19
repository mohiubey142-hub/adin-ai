// utils/professionDetector/detection/hr.ts
// ============================================
// HR PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectHR = (t: string): Profession | null => {
    // ===== HR DETECTION =====
    if (t.includes('hr') || t.includes('human resources') || t.includes('recruiter') ||
        t.includes('talent acquisition') || t.includes('hrbp') || t.includes('people operations') ||
        t.includes('hr manager') || t.includes('recruitment') || t.includes('hris')) {
        return 'hr';
    }
    
    return null;
};