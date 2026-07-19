// utils/professionDetector/detection/vocational.ts
// ============================================
// VOCATIONAL PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectVocational = (t: string): Profession | null => {
    // ===== SPECIFIC VOCATIONAL (Pehle check) =====
    if (t.includes('electrician')) return 'electrician';
    if (t.includes('plumber')) return 'plumber';
    if (t.includes('carpenter')) return 'carpenter';
    if (t.includes('welder')) return 'welder';
    if (t.includes('mason')) return 'mason';
    if (t.includes('construction worker')) return 'construction-worker';
    if (t.includes('cnc operator') || t.includes('cnc')) return 'cnc-operator';
    if (t.includes('machine operator')) return 'machine-operator';
    
    return null;
};