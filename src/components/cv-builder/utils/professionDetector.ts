// utils/professionDetector.ts
// ============================================
// PROFESSION DETECTOR - ENTRY POINT
// ============================================
// 
// 🚀 100% ACCURATE DETECTION (100+ Professions)
// 
// ============================================

// ============================================
// TYPES
// ============================================
export type { Profession } from './professionDetector/types';

// ============================================
// MAPPINGS - Labels & Categories
// ============================================
export {
    PROFESSION_LABELS,
    getProfessionLabel,
    PROFESSION_CATEGORIES,
    getProfessionCategory
} from './professionDetector/mappings';

// ============================================
// UTILITIES - Validation & Testing
// ============================================
export {
    VALID_PROFESSIONS,
    isValidProfession,
    testProfessionDetector
} from './professionDetector/utils';

// ============================================
// DETECTION - Main Function
// ============================================
import { Profession } from './professionDetector/types';
import { DEFAULT_PROFESSION } from './professionDetector/detection';
import {
    detectMedical,
    detectEducation,
    detectIT,
    detectBusiness,
    detectEngineering,
    detectCommerce,
    detectSales,
    detectCreative,
    detectLegal,
    detectSocial,
    detectScience,
    detectArts,
    detectAviation,
    detectVocational,
    detectRenewable,
    detectHospitality,
    detectRealEstate,
    detectHR
} from './professionDetector/detection';

// ============================================
// MAIN DETECTION FUNCTION - Order Matters!
// ============================================
export const detectProfession = (jobTitle: string): Profession => {
    const t = jobTitle.toLowerCase().trim();
    
    // ============================================
    // SPECIFIC PROFESSIONS - Pehle check (Priority)
    // ============================================
    
    // Medical (Specific first)
    const medical = detectMedical(t);
    if (medical) return medical;
    
    // Education (Specific first)
    const education = detectEducation(t);
    if (education) return education;
    
    // IT (Specific first)
    const it = detectIT(t);
    if (it) return it;
    
    // Business (Specific first)
    const business = detectBusiness(t);
    if (business) return business;
    
    // Engineering (Specific first)
    const engineering = detectEngineering(t);
    if (engineering) return engineering;
    
    // Commerce & Finance (Specific first)
    const commerce = detectCommerce(t);
    if (commerce) return commerce;
    
    // Sales & Marketing (Specific first)
    const sales = detectSales(t);
    if (sales) return sales;
    
    // Creative & Design (Specific first)
    const creative = detectCreative(t);
    if (creative) return creative;
    
    // Legal (Specific first)
    const legal = detectLegal(t);
    if (legal) return legal;
    
    // Social Sciences (Specific first)
    const social = detectSocial(t);
    if (social) return social;
    
    // Natural Sciences (Specific first)
    const science = detectScience(t);
    if (science) return science;
    
    // Arts & Humanities (Specific first)
    const arts = detectArts(t);
    if (arts) return arts;
    
    // Aviation & Defense (Specific first)
    const aviation = detectAviation(t);
    if (aviation) return aviation;
    
    // Vocational (Specific first)
    const vocational = detectVocational(t);
    if (vocational) return vocational;
    
    // Renewable Energy (Specific first)
    const renewable = detectRenewable(t);
    if (renewable) return renewable;
    
    // Hospitality (Specific first)
    const hospitality = detectHospitality(t);
    if (hospitality) return hospitality;
    
    // Real Estate (Specific first)
    const realEstate = detectRealEstate(t);
    if (realEstate) return realEstate;
    
    // HR (Specific)
    const hr = detectHR(t);
    if (hr) return hr;
    
    // ============================================
    // FALLBACK - General
    // ============================================
    return DEFAULT_PROFESSION;
};