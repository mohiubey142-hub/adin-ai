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
    
    // ===== NEW MEDICAL PROFESSIONS =====
    if (t.includes('physician assistant') || t.includes('clinical assistant') || t.includes('pa ')) return 'physician-assistant';
    if (t.includes('paramedic') || t.includes('emergency medical')) return 'paramedic';
    if (t.includes('medical technician') || t.includes('lab technician')) return 'medical-technician';
    if (t.includes('medical sales representative') || t.includes('pharma sales') || t.includes('medical representative')) return 'medical-sales-representative';
    
    // ===== BATCH 2 - NEW MEDICAL PROFESSIONS =====
    if (t.includes('dental assistant')) return 'dental-assistant';
    if (t.includes('dental technician') || t.includes('dental lab')) return 'dental-technician';
    if (t.includes('dietitian') || t.includes('nutritionist')) return 'dietitian';
    if (t.includes('emergency medical technician') || t.includes('emt')) return 'emergency-medical-technician';
    if (t.includes('lab assistant') || t.includes('laboratory assistant')) return 'lab-assistant';
    if (t.includes('medical assistant')) return 'medical-assistant';
    if (t.includes('medical coder') || t.includes('medical coding')) return 'medical-coder';
    if (t.includes('midwife') || t.includes('midwifery')) return 'midwife';
    if (t.includes('public health officer') || t.includes('public health')) return 'public-health-officer';
    if (t.includes('caregiver') || t.includes('care giver') || t.includes('care taker')) return 'caregiver';
    
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