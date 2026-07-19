// utils/professionDetector/detection/hospitality.ts
// ============================================
// HOSPITALITY PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectHospitality = (t: string): Profession | null => {
    // ===== SPECIFIC HOSPITALITY (Pehle check) =====
    if (t.includes('chef') || t.includes('cook')) return 'chef';
    if (t.includes('hotel manager') || t.includes('hotel')) return 'hotel-manager';
    if (t.includes('event planner') || t.includes('event manager')) return 'event-planner';
    
    return null;
};