// utils/professionDetector/detection/config.ts
// ============================================
// DETECTION CONFIG
// ============================================

import { Profession } from '../types';

export const DEFAULT_PROFESSION: Profession = 'general';

export const DETECTION_PRIORITY = {
    // Specific professions pehle check hoti hain
    // General professions baad me
    MEDICAL_SPECIFIC: 1,
    EDUCATION_SPECIFIC: 1,
    IT_SPECIFIC: 1,
    BUSINESS_SPECIFIC: 1,
    ENGINEERING_SPECIFIC: 1,
    COMMERCE_SPECIFIC: 1,
    SALES_SPECIFIC: 1,
    CREATIVE_SPECIFIC: 1,
    LEGAL_SPECIFIC: 1,
    SOCIAL_SPECIFIC: 1,
    SCIENCE_SPECIFIC: 1,
    ARTS_SPECIFIC: 1,
    AVIATION_SPECIFIC: 1,
    VOCATIONAL_SPECIFIC: 1,
    RENEWABLE_SPECIFIC: 1,
    HOSPITALITY_SPECIFIC: 1,
    REALESTATE_SPECIFIC: 1,
    HR_SPECIFIC: 1,
    GENERAL: 2  // General professions baad me
};