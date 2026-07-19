// utils/professionDetector/detection/creative.ts
// ============================================
// CREATIVE & DESIGN PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectCreative = (t: string): Profession | null => {
    // ===== SPECIFIC CREATIVE (Pehle check) =====
    if (t.includes('illustrator') || t.includes('illustration')) return 'illustrator';
    if (t.includes('animator') || t.includes('animation')) return 'animator';
    if (t.includes('video editor') || t.includes('video editing')) return 'video-editor';
    if (t.includes('photographer') || t.includes('photography')) return 'photographer';
    if (t.includes('motion designer') || t.includes('motion graphics')) return 'motion-designer';
    if (t.includes('3d artist') || t.includes('3d modeling')) return '3d-artist';
    
    // ===== GRAPHIC DESIGN (Baad me check) =====
    if (t.includes('graphic designer') || t.includes('visual designer') || t.includes('creative designer') ||
        t.includes('brand designer') || t.includes('digital designer') || t.includes('art director') ||
        t.includes('logo designer') || t.includes('print designer')) {
        return 'graphic-designer';
    }
    
    // ===== UI/UX (Baad me check) =====
    if (t.includes('ui designer') || t.includes('ux designer') || t.includes('product designer') ||
        t.includes('interaction designer') || t.includes('user experience') || t.includes('ui/ux')) {
        return 'ui-ux';
    }
    
    return null;
};