// utils/profession/summaries/templates/engineering/index.ts
// ============================================
// ENGINEERING TEMPLATES - Main Export
// Combines all profession templates into one object
// ============================================

import { ENGINEERING_TEMPLATES as ENGINEERING } from './engineering';
import { AUTOMOBILE_ENGINEER_TEMPLATES } from './automobileEngineer';
import { MINING_ENGINEER_TEMPLATES } from './miningEngineer';

// ===== NEW IMPORTS =====
import { CIVIL_ENGINEER_TEMPLATES } from './civilEngineer';
import { MECHANICAL_ENGINEER_TEMPLATES } from './mechanicalEngineer';
import { ELECTRICAL_ENGINEER_TEMPLATES } from './electricalEngineer';
import { TELECOMMUNICATIONS_ENGINEER_TEMPLATES } from './telecommunicationsEngineer';
import { QUANTITY_SURVEYOR_TEMPLATES } from './quantitySurveyor';

// Recreate the exact same structure as the original ENGINEERING_TEMPLATES
export const ENGINEERING_TEMPLATES = {
    engineering: ENGINEERING,
    automobileEngineer: AUTOMOBILE_ENGINEER_TEMPLATES,
    miningEngineer: MINING_ENGINEER_TEMPLATES,
    
    // ===== NEW PROFESSIONS =====
    civilEngineer: CIVIL_ENGINEER_TEMPLATES,
    mechanicalEngineer: MECHANICAL_ENGINEER_TEMPLATES,
    electricalEngineer: ELECTRICAL_ENGINEER_TEMPLATES,
    telecommunicationsEngineer: TELECOMMUNICATIONS_ENGINEER_TEMPLATES,
    quantitySurveyor: QUANTITY_SURVEYOR_TEMPLATES
};

// Default export to maintain compatibility
export default ENGINEERING_TEMPLATES;