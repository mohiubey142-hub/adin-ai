// utils/professionDetector/detection/medical.ts
// ============================================
// MEDICAL PROFESSION DETECTION
// ============================================

import { Profession } from '../types';

export const detectMedical = (t: string): Profession | null => {
    // ===== SPECIFIC MEDICAL PROFESSIONS (Pehle check) =====
    if (t.includes('cardiologist')) return 'cardiologist';
    if (t.includes('pediatrician')) return 'pediatrician';
    if (t.includes('gynecologist')) return 'gynecologist';
    if (t.includes('psychiatrist')) return 'psychiatrist';
    if (t.includes('radiologist')) return 'radiologist';
    if (t.includes('physical therapist') || t.includes('dpt')) return 'physical-therapist';
    if (t.includes('medical technologist')) return 'medical-technologist';
    
    // ===== GENERAL MEDICAL (Baad me check) =====
    if (t.includes('doctor') || t.includes('physician') || t.includes('medical') || 
        t.includes('surgeon') || t.includes('mbbs') || t.includes('md ') || 
        t.includes('internal medicine') || t.includes('medicine') && t.includes('specialist')) {
        return 'doctor';
    }
    
    if (t.includes('nurse') || t.includes('registered nurse') || t.includes('rn')) {
        return 'nurse';
    }
    
    if (t.includes('dentist') || t.includes('dental')) return 'dentist';
    if (t.includes('pharmacist') || t.includes('pharma')) return 'pharmacist';
    
    return null;
};