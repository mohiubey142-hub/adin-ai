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
    if (t.includes('mechatronics') || t.includes('mechatronic')) return 'mechatronics-engineer';
    if (t.includes('architect') || t.includes('architecture')) return 'architect';
    
    // ===== NEW ENGINEERING PROFESSIONS =====
    if (t.includes('telecommunications engineer') || t.includes('telecom engineer')) return 'telecommunications-engineer';
    if (t.includes('quantity surveyor') || t.includes('qs ') || t.includes('cost estimator')) return 'quantity-surveyor';
    if (t.includes('automobile engineer') || t.includes('automotive engineer')) return 'automobile-engineer';
    if (t.includes('mining engineer') || t.includes('mining')) return 'mining-engineer';
    
    // ===== BATCH 2 - NEW ENGINEERING PROFESSIONS =====
    if (t.includes('construction supervisor')) return 'construction-supervisor';
    if (t.includes('foreman') || t.includes('site foreman')) return 'foreman';
    if (t.includes('industrial electrician')) return 'industrial-electrician';
    if (t.includes('instrumentation technician') || t.includes('instrument technician')) return 'instrumentation-technician';
    if (t.includes('maintenance technician') || t.includes('maintenance tech')) return 'maintenance-technician';
    if (t.includes('site engineer')) return 'site-engineer';
    if (t.includes('site supervisor')) return 'site-supervisor';
    if (t.includes('surveyor') || t.includes('land surveyor')) return 'surveyor';
    if (t.includes('textile engineer')) return 'textile-engineer';
    if (t.includes('textile technician')) return 'textile-technician';
    
    // ===== GENERAL ENGINEERING (Baad me check) =====
    if (t.includes('engineering') || t.includes('engineer')) return 'engineering';
    
    return null;
};