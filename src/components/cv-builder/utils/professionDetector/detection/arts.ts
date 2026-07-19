// utils/professionDetector/detection/arts.ts
// ============================================
// ARTS & HUMANITIES PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectArts = (t: string): Profession | null => {
    // ===== SPECIFIC ARTS (Pehle check) =====
    if (t.includes('historian') || t.includes('history')) return 'historian';
    if (t.includes('philosopher') || t.includes('philosophy')) return 'philosopher';
    if (t.includes('linguist') || t.includes('linguistics')) return 'linguist';
    if (t.includes('literature')) return 'literature';
    if (t.includes('journalism') || t.includes('media')) return 'journalism';
    if (t.includes('arts') || t.includes('humanities')) return 'arts';
    
    return null;
};