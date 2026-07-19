// utils/professionDetector/detection/science.ts
// ============================================
// NATURAL SCIENCES PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectScience = (t: string): Profession | null => {
    // ===== SPECIFIC SCIENCES (Pehle check) =====
    if (t.includes('physicist') || t.includes('physics')) return 'physicist';
    if (t.includes('chemist') || t.includes('chemistry')) return 'chemist';
    if (t.includes('biologist') || t.includes('biology')) return 'biologist';
    if (t.includes('microbiologist') || t.includes('microbiology')) return 'microbiologist';
    if (t.includes('zoologist') || t.includes('zoology')) return 'zoologist';
    if (t.includes('botanist') || t.includes('botany')) return 'botanist';
    if (t.includes('natural sciences')) return 'natural-sciences';
    
    return null;
};