// utils/professionDetector/detection/engineering.ts
// ============================================
// ENGINEERING PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectEngineering = (t: string): Profession | null => {
    // ===== SPECIFIC ENGINEERING (Pehle check) =====
    if (t.includes('civil engineer')) return 'civil-engineer';
    if (t.includes('electrical engineer')) return 'electrical-engineer';
    if (t.includes('mechanical engineer')) return 'mechanical-engineer';
    if (t.includes('chemical engineer')) return 'chemical-engineer';
    if (t.includes('industrial engineer')) return 'industrial-engineer';
    if (t.includes('petroleum engineer')) return 'petroleum-engineer';
    if (t.includes('structural engineer')) return 'structural-engineer';
    if (t.includes('environmental engineer')) return 'environmental-engineer';
    if (t.includes('biomedical engineer')) return 'biomedical-engineer';
    if (t.includes('robotics engineer') || t.includes('robotics')) return 'robotics-engineer';
    if (t.includes('architect') || t.includes('architecture')) return 'architect';
    
    // ===== GENERAL ENGINEERING (Baad me check) =====
    if (t.includes('engineering') || t.includes('engineer')) return 'engineering';
    
    return null;
};