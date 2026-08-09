// utils/professionDetector/detection/vocational.ts
// ============================================
// VOCATIONAL PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectVocational = (t: string): Profession | null => {
    // ===== SPECIFIC VOCATIONAL (Pehle check) =====
    if (t.includes('electrician')) return 'electrician';
    if (t.includes('plumber')) return 'plumber';
    if (t.includes('carpenter') || t.includes('carpentry')) return 'carpenter';
    if (t.includes('welder') || t.includes('welding')) return 'welder';
    if (t.includes('mason') || t.includes('brick')) return 'mason';
    if (t.includes('construction worker') || t.includes('construction labor')) return 'construction-worker';
    if (t.includes('cnc operator') || t.includes('cnc machinist')) return 'cnc-operator';
    if (t.includes('machine operator')) return 'machine-operator';
    
    // ===== NEW VOCATIONAL PROFESSIONS =====
    if (t.includes('computer operator')) return 'computer-operator';
    if (t.includes('electrical technician')) return 'electrical-technician';
    if (t.includes('stitching machine operator') || t.includes('sewing machine operator')) return 'stitching-machine-operator';
    if (t.includes('civil technician')) return 'civil-technician';
    if (t.includes('auto mechanic') || t.includes('automotive mechanic')) return 'auto-mechanic';
    if (t.includes('hvac technician') || t.includes('ac technician') || t.includes('air conditioning')) return 'hvac-technician';
    if (t.includes('agricultural technician') || t.includes('agriculture technician')) return 'agricultural-technician';
    
    return null;
};