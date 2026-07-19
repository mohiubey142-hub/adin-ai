// utils/professionDetector/detection/social.ts
// ============================================
// SOCIAL SCIENCES PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectSocial = (t: string): Profession | null => {
    // ===== SPECIFIC SOCIAL SCIENCES (Pehle check) =====
    if (t.includes('psychologist') || t.includes('psychology')) return 'psychologist';
    if (t.includes('sociologist') || t.includes('sociology')) return 'sociologist';
    if (t.includes('economist') || t.includes('economics')) return 'economist';
    if (t.includes('social worker')) return 'social-worker';
    if (t.includes('political scientist') || t.includes('political science')) return 'political-scientist';
    if (t.includes('social sciences')) return 'social-sciences';
    
    return null;
};