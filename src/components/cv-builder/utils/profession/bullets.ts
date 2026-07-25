// utils/profession/bullets.ts
// ============================================
// PROFESSION BULLETS - 80+ Professions
// ============================================

import { getDoctorBullets } from '../pools/doctorPool';
import { getTeacherBullets } from '../pools/teacherPool';
import { getDeveloperBullets } from '../pools/developerPool';
import { getBusinessBullets } from '../pools/businessPool';
import { getEngineeringBullets } from '../pools/engineeringPool';
import { getAccountantBullets } from '../pools/accountantPool';
import { getSalesBullets } from '../pools/salesPool';
import { getHrBullets } from '../pools/hrPool';
import { getDesignerBullets } from '../pools/designerPool';
import { getLawBullets } from '../pools/lawPool';
import { getSocialSciencesBullets } from '../pools/socialSciencesPool';
import { getNaturalSciencesBullets } from '../pools/naturalSciencesPool';
import { getArtsBullets } from '../pools/artsPool';
import { getGeneralBullets } from '../pools/generalPool';
import { getDataScientistBullets } from '../pools/dataScientistPool';
import { getCybersecurityBullets } from '../pools/cybersecurityPool';
import { getCloudEngineerBullets } from '../pools/cloudEngineerPool';
import { getDevopsBullets } from '../pools/devopsPool';
import { getProductManagerBullets } from '../pools/productManagerPool';
import { getProjectManagerBullets } from '../pools/projectManagerPool';
import { getMarketingBullets } from '../pools/marketingPool';
import { getContentCreatorBullets } from '../pools/contentCreatorPool';
import { getUiuxDesignerBullets } from '../pools/uiuxDesignerPool';
import { getEntrepreneurBullets } from '../pools/entrepreneurPool';
import { getFreelancerBullets } from '../pools/freelancerPool';
import { getAiMlEngineerBullets } from '../pools/aiMlEngineerPool';
import { getFrontendDeveloperBullets } from '../pools/frontendDeveloperPool';
import { getBackendDeveloperBullets } from '../pools/backendDeveloperPool';
import { getFullStackDeveloperBullets } from '../pools/fullStackDeveloperPool';
import { getGraphicDesignerBullets } from '../pools/graphicDesignerPool';
import { getNurseBullets } from '../pools/nursePool';
import { getDataAnalystBullets } from '../pools/dataAnalystPool';
import { getBusinessAnalystBullets } from '../pools/businessAnalystPool';
import { getBankerBullets } from '../pools/bankerPool';
import { getDentistBullets } from '../pools/dentistPool';
import { getPharmacistBullets } from '../pools/pharmacistPool';
import { getPilotBullets } from '../pools/pilotPool';
import { getArmyOfficerBullets } from '../pools/armyOfficerPool';
import { getItSupportBullets } from '../pools/itSupportPool';
import { getProfessorBullets } from '../pools/professorPool';
import { getOperationsManagerBullets } from '../pools/operationsManagerPool';
import { getGameDeveloperBullets } from '../pools/gameDeveloperPool';
import { getSolarPVInstallerBullets } from '../pools/solarPVInstallerPool';
import { getWindTurbineTechnicianBullets } from '../pools/windTurbineTechnicianPool';
import { getRenewableEnergyEngineerBullets } from '../pools/renewableEnergyEngineerPool';
import { getSeoSpecialistBullets } from '../pools/seoSpecialistPool';
import { getPerformanceMarketerBullets } from '../pools/performanceMarketerPool';
import { getElectricianBullets } from '../pools/electricianPool';
import { getPlumberBullets } from '../pools/plumberPool';
import { getPhysicsTeacherBullets } from '../pools/physicsTeacherPool';
import { getChemistryTeacherBullets } from '../pools/chemistryTeacherPool';
import { getMathTeacherBullets } from '../pools/mathTeacherPool';
import { getBiologyTeacherBullets } from '../pools/biologyTeacherPool';
import { getEnglishTeacherBullets } from '../pools/englishTeacherPool';
import { getUrduTeacherBullets } from '../pools/urduTeacherPool';
import { getComputerTeacherBullets } from '../pools/computerTeacherPool';
import { getIslamicStudiesTeacherBullets } from '../pools/islamicStudiesTeacherPool';
import { getPakistanStudiesTeacherBullets } from '../pools/pakistanStudiesTeacherPool';
import { getHistoryTeacherBullets } from '../pools/historyTeacherPool';

// ===== NEW POOL IMPORTS (23) =====
// Healthcare (9)
import { getPhysiotherapistBullets } from '../pools/physiotherapistPool';
import { getNutritionistBullets } from '../pools/nutritionistPool';
import { getMedicalLabTechnologistBullets } from '../pools/medicalLabTechnologistPool';
import { getRadiologyTechnologistBullets } from '../pools/radiologyTechnologistPool';
import { getOccupationalTherapistBullets } from '../pools/occupationalTherapistPool';
import { getSpeechTherapistBullets } from '../pools/speechTherapistPool';
import { getOptometristBullets } from '../pools/optometristPool';
import { getVeterinaryDoctorBullets } from '../pools/veterinaryDoctorPool';
import { getHealthcareAdministratorBullets } from '../pools/healthcareAdministratorPool';

// IT (5)
import { getSoftwareEngineerBullets } from '../pools/softwareEngineerPool';
import { getAiResearchEngineerBullets } from '../pools/aiResearchEngineerPool';
import { getEmbeddedSystemsEngineerBullets } from '../pools/embeddedSystemsEngineerPool';
import { getDatabaseAdministratorBullets } from '../pools/databaseAdministratorPool';
import { getMechatronicsEngineerBullets } from '../pools/mechatronicsEngineerPool';

// Business (6)
import { getFinanceAnalystBullets } from '../pools/financeAnalystPool';
import { getFinancialAdvisorBullets } from '../pools/financialAdvisorPool';
import { getSupplyChainManagerBullets } from '../pools/supplyChainManagerPool';
import { getProcurementOfficerBullets } from '../pools/procurementOfficerPool';
import { getLogisticsManagerBullets } from '../pools/logisticsManagerPool';
import { getBusinessDevelopmentExecutiveBullets } from '../pools/businessDevelopmentExecutivePool';

// Engineering (2)
import { getAutomobileEngineerBullets } from '../pools/automobileEngineerPool';
import { getMiningEngineerBullets } from '../pools/miningEngineerPool';

// Sales & Marketing (1)
import { getCustomerSupportSpecialistBullets } from '../pools/customerSupportSpecialistPool';

export const getBulletsByProfession = (profession: string, level: string, company: string): string[] => {
    const levelKey = level === 'director' || level === 'manager' ? 'senior' : level;
    
    switch (profession) {
        case 'doctor': return getDoctorBullets(levelKey, company);
        case 'teacher': return getTeacherBullets(levelKey, company);
        case 'developer': return getDeveloperBullets(levelKey, company);
        case 'business': return getBusinessBullets(levelKey, company);
        case 'engineering': return getEngineeringBullets(levelKey, company);
        case 'accountant': return getAccountantBullets(levelKey, company);
        case 'sales': return getSalesBullets(levelKey, company);
        case 'hr': return getHrBullets(levelKey, company);
        case 'designer': return getDesignerBullets(levelKey, company);
        case 'law': return getLawBullets(levelKey, company);
        case 'social-sciences': return getSocialSciencesBullets(levelKey, company);
        case 'natural-sciences': return getNaturalSciencesBullets(levelKey, company);
        case 'arts': return getArtsBullets(levelKey, company);
        case 'data-scientist': return getDataScientistBullets(levelKey, company);
        case 'cybersecurity': return getCybersecurityBullets(levelKey, company);
        case 'cloud': return getCloudEngineerBullets(levelKey, company);
        case 'devops': return getDevopsBullets(levelKey, company);
        case 'product-manager': return getProductManagerBullets(levelKey, company);
        case 'project-manager': return getProjectManagerBullets(levelKey, company);
        case 'marketing': return getMarketingBullets(levelKey, company);
        case 'content-creator': return getContentCreatorBullets(levelKey, company);
        case 'uiux': return getUiuxDesignerBullets(levelKey, company);
        case 'entrepreneur': return getEntrepreneurBullets(levelKey, company);
        case 'freelancer': return getFreelancerBullets(levelKey, company);
        case 'ai-ml': return getAiMlEngineerBullets(levelKey, company);
        case 'frontend': return getFrontendDeveloperBullets(levelKey, company);
        case 'backend': return getBackendDeveloperBullets(levelKey, company);
        case 'full-stack': return getFullStackDeveloperBullets(levelKey, company);
        case 'graphic-designer': return getGraphicDesignerBullets(levelKey, company);
        case 'nurse': return getNurseBullets(levelKey, company);
        case 'data-analyst': return getDataAnalystBullets(levelKey, company);
        case 'business-analyst': return getBusinessAnalystBullets(levelKey, company);
        case 'banker': return getBankerBullets(levelKey, company);
        case 'dentist': return getDentistBullets(levelKey, company);
        case 'pharmacist': return getPharmacistBullets(levelKey, company);
        case 'pilot': return getPilotBullets(levelKey, company);
        case 'army': return getArmyOfficerBullets(levelKey, company);
        case 'it-support': return getItSupportBullets(levelKey, company);
        case 'professor': return getProfessorBullets(levelKey, company);
        case 'operations-manager': return getOperationsManagerBullets(levelKey, company);
        case 'game-developer': return getGameDeveloperBullets(levelKey, company);
        case 'renewable': return getRenewableEnergyEngineerBullets(levelKey, company);
        case 'solar': return getSolarPVInstallerBullets(levelKey, company);
        case 'wind': return getWindTurbineTechnicianBullets(levelKey, company);
        case 'digital-marketing': return getPerformanceMarketerBullets(levelKey, company);
        case 'seo': return getSeoSpecialistBullets(levelKey, company);
        case 'vocational': return getElectricianBullets(levelKey, company);
        case 'electrician': return getElectricianBullets(levelKey, company);
        case 'plumber': return getPlumberBullets(levelKey, company);
        case 'physics-teacher': return getPhysicsTeacherBullets(levelKey, company);
        case 'chemistry-teacher': return getChemistryTeacherBullets(levelKey, company);
        case 'math-teacher': return getMathTeacherBullets(levelKey, company);
        case 'biology-teacher': return getBiologyTeacherBullets(levelKey, company);
        case 'english-teacher': return getEnglishTeacherBullets(levelKey, company);
        case 'urdu-teacher': return getUrduTeacherBullets(levelKey, company);
        case 'computer-teacher': return getComputerTeacherBullets(levelKey, company);
        case 'islamic-studies-teacher': return getIslamicStudiesTeacherBullets(levelKey, company);
        case 'pakistan-studies-teacher': return getPakistanStudiesTeacherBullets(levelKey, company);
        case 'history-teacher': return getHistoryTeacherBullets(levelKey, company);
        
        // ===== NEW PROFESSION CASES (23) =====
        // Healthcare (9)
        case 'physiotherapist': return getPhysiotherapistBullets(levelKey, company);
        case 'nutritionist': return getNutritionistBullets(levelKey, company);
        case 'medical-lab-technologist': return getMedicalLabTechnologistBullets(levelKey, company);
        case 'radiology-technologist': return getRadiologyTechnologistBullets(levelKey, company);
        case 'occupational-therapist': return getOccupationalTherapistBullets(levelKey, company);
        case 'speech-therapist': return getSpeechTherapistBullets(levelKey, company);
        case 'optometrist': return getOptometristBullets(levelKey, company);
        case 'veterinary-doctor': return getVeterinaryDoctorBullets(levelKey, company);
        case 'healthcare-administrator': return getHealthcareAdministratorBullets(levelKey, company);
        
        // IT (5)
        case 'software-engineer': return getSoftwareEngineerBullets(levelKey, company);
        case 'ai-research-engineer': return getAiResearchEngineerBullets(levelKey, company);
        case 'embedded-systems-engineer': return getEmbeddedSystemsEngineerBullets(levelKey, company);
        case 'database-administrator': return getDatabaseAdministratorBullets(levelKey, company);
        case 'mechatronics-engineer': return getMechatronicsEngineerBullets(levelKey, company);
        
        // Business (6)
        case 'finance-analyst': return getFinanceAnalystBullets(levelKey, company);
        case 'financial-advisor': return getFinancialAdvisorBullets(levelKey, company);
        case 'supply-chain-manager': return getSupplyChainManagerBullets(levelKey, company);
        case 'procurement-officer': return getProcurementOfficerBullets(levelKey, company);
        case 'logistics-manager': return getLogisticsManagerBullets(levelKey, company);
        case 'business-development-executive': return getBusinessDevelopmentExecutiveBullets(levelKey, company);
        
        // Engineering (2)
        case 'automobile-engineer': return getAutomobileEngineerBullets(levelKey, company);
        case 'mining-engineer': return getMiningEngineerBullets(levelKey, company);
        
        // Sales & Marketing (1)
        case 'customer-support-specialist': return getCustomerSupportSpecialistBullets(levelKey, company);
        
        default: return getGeneralBullets(levelKey, company);
    }
};