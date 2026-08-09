// utils/profession/summaries/templates/education/subjects.ts
// ============================================
// SUBJECT TEACHERS PROFESSIONS TEMPLATES - 10 Professions
// ============================================
// 
// ✅ RE-EXPORTS from split files
// ✅ EXACT SAME exports as before
// ✅ No content changes - only organization
// 
// This file now acts as a central export point
// All templates are imported from sub-files and re-exported
// 
// Professions: physicsTeacher, chemistryTeacher, mathTeacher, biologyTeacher,
//              englishTeacher, urduTeacher, computerTeacher,
//              islamicStudiesTeacher, pakistanStudiesTeacher, historyTeacher
// ============================================

import { SCIENCE_TEMPLATES } from './science';
import { LANGUAGES_TEMPLATES } from './languages';
import { SOCIAL_STUDIES_TEMPLATES } from './socialStudies';
import { MATH_TECH_TEMPLATES } from './mathTech';

// ===== NEW IMPORT =====
import { LECTURER_TEMPLATES } from './lecturer';

export const SUBJECTS_TEMPLATES: Record<string, Record<string, string[]>> = {
    ...SCIENCE_TEMPLATES,
    ...LANGUAGES_TEMPLATES,
    ...SOCIAL_STUDIES_TEMPLATES,
    ...MATH_TECH_TEMPLATES,
    
    // ===== NEW PROFESSION =====
    ...LECTURER_TEMPLATES
};