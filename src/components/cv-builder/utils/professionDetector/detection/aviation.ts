// utils/professionDetector/detection/aviation.ts
// ============================================
// AVIATION & DEFENSE PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectAviation = (t: string): Profession | null => {
    // ===== SPECIFIC AVIATION (Pehle check) =====
    if (t.includes('air traffic controller')) return 'air-traffic-controller';
    if (t.includes('pilot') || t.includes('aviator') || t.includes('captain') && t.includes('plane')) return 'pilot';
    if (t.includes('army officer') || t.includes('army')) return 'army-officer';
    if (t.includes('navy officer') || t.includes('navy')) return 'navy-officer';
    if (t.includes('air force officer') || t.includes('air force')) return 'air-force-officer';
    if (t.includes('police officer') || t.includes('police')) return 'police-officer';
    if (t.includes('firefighter') || t.includes('fire fighter')) return 'firefighter';
    
    return null;
};