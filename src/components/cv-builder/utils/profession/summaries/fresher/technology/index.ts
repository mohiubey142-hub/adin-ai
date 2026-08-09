// utils/profession/summaries/fresher/technology/index.ts
// ============================================
// TECHNOLOGY FRESHER TEMPLATES - Combined Exports
// ============================================

import { DEVELOPER_FRESHER } from './developer.fresher';
import { SOFTWARE_ENGINEER_FRESHER } from './softwareEngineer.fresher';
import { AI_RESEARCH_ENGINEER_FRESHER } from './aiResearchEngineer.fresher';
import { EMBEDDED_SYSTEMS_ENGINEER_FRESHER } from './embeddedSystemsEngineer.fresher';
import { DATABASE_ADMINISTRATOR_FRESHER } from './databaseAdministrator.fresher';
import { MECHATRONICS_ENGINEER_FRESHER } from './mechatronicsEngineer.fresher';
import { DATA_SCIENTIST_FRESHER } from './dataScientist.fresher';
import { CYBERSECURITY_FRESHER } from './cybersecurity.fresher';
import { CLOUD_FRESHER } from './cloud.fresher';
import { DEVOPS_FRESHER } from './devops.fresher';
import { FRONTEND_FRESHER } from './frontend.fresher';
import { BACKEND_FRESHER } from './backend.fresher';
import { FULL_STACK_FRESHER } from './fullStack.fresher';
import { AI_ML_FRESHER } from './aiMl.fresher';
import { GAME_DEVELOPER_FRESHER } from './gameDeveloper.fresher';
import { IT_SUPPORT_FRESHER } from './itSupport.fresher';
import { PRODUCT_MANAGER_FRESHER } from './productManager.fresher';

// ===== NEW IMPORTS =====
import { QA_ENGINEER_FRESHER } from './qaEngineer.fresher';
import { DATA_ENGINEER_FRESHER } from './dataEngineer.fresher';
import { COMPUTER_OPERATOR_FRESHER } from './computerOperator.fresher';

export const TECHNOLOGY_FRESHER_TEMPLATES: Record<string, string[]> = {
    developer: DEVELOPER_FRESHER,
    softwareEngineer: SOFTWARE_ENGINEER_FRESHER,
    aiResearchEngineer: AI_RESEARCH_ENGINEER_FRESHER,
    embeddedSystemsEngineer: EMBEDDED_SYSTEMS_ENGINEER_FRESHER,
    databaseAdministrator: DATABASE_ADMINISTRATOR_FRESHER,
    mechatronicsEngineer: MECHATRONICS_ENGINEER_FRESHER,
    dataScientist: DATA_SCIENTIST_FRESHER,
    cybersecurity: CYBERSECURITY_FRESHER,
    cloud: CLOUD_FRESHER,
    devops: DEVOPS_FRESHER,
    frontend: FRONTEND_FRESHER,
    backend: BACKEND_FRESHER,
    fullStack: FULL_STACK_FRESHER,
    aiMl: AI_ML_FRESHER,
    gameDeveloper: GAME_DEVELOPER_FRESHER,
    itSupport: IT_SUPPORT_FRESHER,
    productManager: PRODUCT_MANAGER_FRESHER,
    
    // ===== NEW PROFESSIONS =====
    qaEngineer: QA_ENGINEER_FRESHER,
    dataEngineer: DATA_ENGINEER_FRESHER,
    computerOperator: COMPUTER_OPERATOR_FRESHER
};