// utils/professionDetector/detection/renewable.ts
// ============================================
// RENEWABLE ENERGY PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectRenewable = (t: string): Profession | null => {
    // ===== SPECIFIC RENEWABLE (Pehle check) =====
    if (t.includes('solar installer') || t.includes('solar pv')) return 'solar-installer';
    if (t.includes('wind turbine technician') || t.includes('wind technician')) return 'wind-turbine-technician';
    if (t.includes('energy engineer') || t.includes('renewable energy')) return 'energy-engineer';
    if (t.includes('renewable')) return 'renewable';
    
    return null;
};