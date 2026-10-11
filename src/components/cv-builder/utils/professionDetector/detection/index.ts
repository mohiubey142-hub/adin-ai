// utils/professionDetector/detection/index.ts
// ============================================
// DETECTION EXPORTS
// ============================================

export { DEFAULT_PROFESSION, DETECTION_PRIORITY } from './config';

export { detectMedical } from './medical';
export { detectEducation } from './education';
export { detectIT } from './it';
export { detectBusiness } from './business';
export { detectEngineering } from './engineering';
export { detectCommerce } from './commerce';
export { detectSales } from './sales';
export { detectCreative } from './creative';
export { detectLegal } from './legal';
export { detectSocial } from './social';
export { detectScience } from './science';
export { detectArts } from './arts';
export { detectAviation } from './aviation';
export { detectVocational } from './vocational';
export { detectRenewable } from './renewable';
export { detectHospitality } from './hospitality';
export { detectRealEstate } from './realestate';
export { detectHR } from './hr';
export { detectOfficeAdmin } from './officeAdmin';
export { detectSafetySecurity } from './safetySecurity';

// ============================================
// NEW: FREELANCER DETECTION (Inlined)
// ============================================
import { Profession } from '../types';

export const detectFreelancer = (t: string): Profession | null => {
    if (t.includes('freelancer') || t.includes('freelance')) return 'freelancer';
    return null;
};