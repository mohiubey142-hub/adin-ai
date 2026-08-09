// utils/profession/summaries/fresher/medical/index.ts
// ============================================
// MEDICAL FRESHER TEMPLATES - Combined Exports
// ============================================

import { DOCTOR_FRESHER } from './doctor.fresher';
import { PHYSIOTHERAPIST_FRESHER } from './physiotherapist.fresher';
import { NUTRITIONIST_FRESHER } from './nutritionist.fresher';
import { MEDICAL_LAB_TECHNOLOGIST_FRESHER } from './medicalLabTechnologist.fresher';
import { RADIOLOGY_TECHNOLOGIST_FRESHER } from './radiologyTechnologist.fresher';
import { OCCUPATIONAL_THERAPIST_FRESHER } from './occupationalTherapist.fresher';
import { SPEECH_THERAPIST_FRESHER } from './speechTherapist.fresher';
import { OPTOMETRIST_FRESHER } from './optometrist.fresher';
import { VETERINARY_DOCTOR_FRESHER } from './veterinaryDoctor.fresher';
import { HEALTHCARE_ADMINISTRATOR_FRESHER } from './healthcareAdministrator.fresher';
import { NURSE_FRESHER } from './nurse.fresher';
import { DENTIST_FRESHER } from './dentist.fresher';
import { PHARMACIST_FRESHER } from './pharmacist.fresher';

// ===== NEW IMPORTS =====
import { PARAMEDIC_FRESHER } from './paramedic.fresher';
import { MEDICAL_TECHNICIAN_FRESHER } from './medicalTechnician.fresher';
import { PHYSICIAN_ASSISTANT_FRESHER } from './physicianAssistant.fresher';

export const MEDICAL_FRESHER_TEMPLATES: Record<string, string[]> = {
    doctor: DOCTOR_FRESHER,
    physiotherapist: PHYSIOTHERAPIST_FRESHER,
    nutritionist: NUTRITIONIST_FRESHER,
    medicalLabTechnologist: MEDICAL_LAB_TECHNOLOGIST_FRESHER,
    radiologyTechnologist: RADIOLOGY_TECHNOLOGIST_FRESHER,
    occupationalTherapist: OCCUPATIONAL_THERAPIST_FRESHER,
    speechTherapist: SPEECH_THERAPIST_FRESHER,
    optometrist: OPTOMETRIST_FRESHER,
    veterinaryDoctor: VETERINARY_DOCTOR_FRESHER,
    healthcareAdministrator: HEALTHCARE_ADMINISTRATOR_FRESHER,
    nurse: NURSE_FRESHER,
    dentist: DENTIST_FRESHER,
    pharmacist: PHARMACIST_FRESHER,
    
    // ===== NEW PROFESSIONS =====
    paramedic: PARAMEDIC_FRESHER,
    medicalTechnician: MEDICAL_TECHNICIAN_FRESHER,
    physicianAssistant: PHYSICIAN_ASSISTANT_FRESHER
};