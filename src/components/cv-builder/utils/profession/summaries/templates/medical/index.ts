// utils/profession/summaries/templates/medical/index.ts
// ============================================
// MEDICAL TEMPLATES - Combined Exports
// ============================================
// 
// ✅ Combines all medical sub-categories
// ✅ EXACT SAME output as before
// ✅ Only imports changed to sub-files
// 
// ============================================

import { DOCTORS_TEMPLATES } from './doctors';
import { THERAPISTS_TEMPLATES } from './therapists';
import { TECHNICIANS_TEMPLATES } from './technicians';
import { ADMINISTRATORS_TEMPLATES } from './administrators';

// ===== NEW IMPORTS =====
import { PARAMEDIC_TEMPLATES } from './paramedic';
import { MEDICAL_TECHNICIAN_TEMPLATES } from './medicalTechnician';
import { PHYSICIAN_ASSISTANT_TEMPLATES } from './physicianAssistant';

export const MEDICAL_TEMPLATES: Record<string, Record<string, string[]>> = {
    ...DOCTORS_TEMPLATES,
    ...THERAPISTS_TEMPLATES,
    ...TECHNICIANS_TEMPLATES,
    ...ADMINISTRATORS_TEMPLATES,
    
    // ===== NEW PROFESSIONS - FIXED: Spread removed, Direct keys added =====
    paramedic: PARAMEDIC_TEMPLATES,
    medicalTechnician: MEDICAL_TECHNICIAN_TEMPLATES,
    physicianAssistant: PHYSICIAN_ASSISTANT_TEMPLATES
};