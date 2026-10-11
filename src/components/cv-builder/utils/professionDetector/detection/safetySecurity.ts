// utils/professionDetector/detection/safetySecurity.ts
// ============================================
// SAFETY & SECURITY PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectSafetySecurity = (t: string): Profession | null => {
    // ===== SAFETY & SECURITY PROFESSIONS =====
    if (t.includes('safety officer') || t.includes('safety')) return 'safety-officer';
    if (t.includes('hse officer') || t.includes('hse')) return 'hse-officer';
    if (t.includes('food safety officer') || t.includes('food safety')) return 'food-safety-officer';
    if (t.includes('security guard') || t.includes('security guard')) return 'security-guard';
    if (t.includes('security officer') || t.includes('security')) return 'security-officer';
    
    return null;
};