// utils/profession/summaries/fresher/engineering/index.ts
// ============================================
// ENGINEERING FRESHER TEMPLATES - Combined Exports
// ============================================

import { ENGINEERING_FRESHER } from './engineering.fresher';
import { AUTOMOBILE_ENGINEER_FRESHER } from './automobileEngineer.fresher';
import { MINING_ENGINEER_FRESHER } from './miningEngineer.fresher';

// ===== NEW IMPORTS =====
import { CIVIL_ENGINEER_FRESHER } from './civilEngineer.fresher';
import { MECHANICAL_ENGINEER_FRESHER } from './mechanicalEngineer.fresher';
import { ELECTRICAL_ENGINEER_FRESHER } from './electricalEngineer.fresher';
import { TELECOMMUNICATIONS_ENGINEER_FRESHER } from './telecommunicationsEngineer.fresher';
import { QUANTITY_SURVEYOR_FRESHER } from './quantitySurveyor.fresher';

export const ENGINEERING_FRESHER_TEMPLATES: Record<string, string[]> = {
    engineering: ENGINEERING_FRESHER,
    automobileEngineer: AUTOMOBILE_ENGINEER_FRESHER,
    miningEngineer: MINING_ENGINEER_FRESHER,
    
    // ===== NEW PROFESSIONS =====
    civilEngineer: CIVIL_ENGINEER_FRESHER,
    mechanicalEngineer: MECHANICAL_ENGINEER_FRESHER,
    electricalEngineer: ELECTRICAL_ENGINEER_FRESHER,
    telecommunicationsEngineer: TELECOMMUNICATIONS_ENGINEER_FRESHER,
    quantitySurveyor: QUANTITY_SURVEYOR_FRESHER
};