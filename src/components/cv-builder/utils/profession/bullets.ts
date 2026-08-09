// utils/profession/bullets.ts
// ============================================
// PROFESSION BULLETS - 100+ Professions
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

// ============================================
// TURN 1 - 10 PROFESSIONS
// ============================================
import { getCivilEngineerBullets } from '../pools/civilEngineerPool';
import { getMechanicalEngineerBullets } from '../pools/mechanicalEngineerPool';
import { getElectricalEngineerBullets } from '../pools/electricalEngineerPool';
import { getQaEngineerBullets } from '../pools/qaEngineerPool';
import { getComputerOperatorBullets } from '../pools/computerOperatorPool';
import { getElectricalTechnicianBullets } from '../pools/electricalTechnicianPool';
import { getCncOperatorBullets } from '../pools/cncOperatorPool';
import { getWelderBullets } from '../pools/welderPool';
import { getDataEngineerBullets } from '../pools/dataEngineerPool';
import { getSupplyChainAnalystBullets } from '../pools/supplyChainAnalystPool';

// ============================================
// TURN 2 - 10 PROFESSIONS
// ============================================
import { getMachineOperatorBullets } from '../pools/machineOperatorPool';
import { getStitchingMachineOperatorBullets } from '../pools/stitchingMachineOperatorPool';
import { getMasonBullets } from '../pools/masonPool';
import { getChefBullets } from '../pools/chefPool';
import { getCivilTechnicianBullets } from '../pools/civilTechnicianPool';
import { getAutoMechanicBullets } from '../pools/autoMechanicPool';
import { getHvacTechnicianBullets } from '../pools/hvacTechnicianPool';
import { getParamedicBullets } from '../pools/paramedicPool';
import { getMedicalTechnicianBullets } from '../pools/medicalTechnicianPool';
import { getAgriculturalTechnicianBullets } from '../pools/agriculturalTechnicianPool';

// ============================================
// TURN 3 - 7 PROFESSIONS (4 new + 3 existing)
// ============================================
import { getTelecommunicationsEngineerBullets } from '../pools/telecommunicationsEngineerPool';
import { getQuantitySurveyorBullets } from '../pools/quantitySurveyorPool';
import { getPhysicianAssistantBullets } from '../pools/physicianAssistantPool';
import { getMedicalSalesRepresentativeBullets } from '../pools/medicalSalesRepresentativePool';

// ============================================
// EXISTING NEW POOLS (23) - Already had
// ============================================
import { getPhysiotherapistBullets } from '../pools/physiotherapistPool';
import { getNutritionistBullets } from '../pools/nutritionistPool';
import { getMedicalLabTechnologistBullets } from '../pools/medicalLabTechnologistPool';
import { getRadiologyTechnologistBullets } from '../pools/radiologyTechnologistPool';
import { getOccupationalTherapistBullets } from '../pools/occupationalTherapistPool';
import { getSpeechTherapistBullets } from '../pools/speechTherapistPool';
import { getOptometristBullets } from '../pools/optometristPool';
import { getVeterinaryDoctorBullets } from '../pools/veterinaryDoctorPool';
import { getHealthcareAdministratorBullets } from '../pools/healthcareAdministratorPool';
import { getSoftwareEngineerBullets } from '../pools/softwareEngineerPool';
import { getAiResearchEngineerBullets } from '../pools/aiResearchEngineerPool';
import { getEmbeddedSystemsEngineerBullets } from '../pools/embeddedSystemsEngineerPool';
import { getDatabaseAdministratorBullets } from '../pools/databaseAdministratorPool';
import { getMechatronicsEngineerBullets } from '../pools/mechatronicsEngineerPool';
import { getFinanceAnalystBullets } from '../pools/financeAnalystPool';
import { getFinancialAdvisorBullets } from '../pools/financialAdvisorPool';
import { getSupplyChainManagerBullets } from '../pools/supplyChainManagerPool';
import { getProcurementOfficerBullets } from '../pools/procurementOfficerPool';
import { getLogisticsManagerBullets } from '../pools/logisticsManagerPool';
import { getBusinessDevelopmentExecutiveBullets } from '../pools/businessDevelopmentExecutivePool';
import { getAutomobileEngineerBullets } from '../pools/automobileEngineerPool';
import { getMiningEngineerBullets } from '../pools/miningEngineerPool';
import { getCustomerSupportSpecialistBullets } from '../pools/customerSupportSpecialistPool';

// ============================================
// NEW IMPORT - LECTURER
// ============================================
import { getLecturerBullets } from '../pools/lecturerPool';

export const getBulletsByProfession = (profession: string, level: string, company: string): string[] => {
    const levelKey = level === 'director' || level === 'manager' ? 'senior' : level;
    
    switch (profession) {
        // ============================================
        // MEDICAL & HEALTHCARE
        // ============================================
        case 'doctor': return getDoctorBullets(levelKey, company);
        case 'nurse': return getNurseBullets(levelKey, company);
        case 'dentist': return getDentistBullets(levelKey, company);
        case 'pharmacist': return getPharmacistBullets(levelKey, company);
        case 'physiotherapist': return getPhysiotherapistBullets(levelKey, company);
        case 'nutritionist': return getNutritionistBullets(levelKey, company);
        case 'medical-lab-technologist': return getMedicalLabTechnologistBullets(levelKey, company);
        case 'radiology-technologist': return getRadiologyTechnologistBullets(levelKey, company);
        case 'occupational-therapist': return getOccupationalTherapistBullets(levelKey, company);
        case 'speech-therapist': return getSpeechTherapistBullets(levelKey, company);
        case 'optometrist': return getOptometristBullets(levelKey, company);
        case 'veterinary-doctor': return getVeterinaryDoctorBullets(levelKey, company);
        case 'healthcare-administrator': return getHealthcareAdministratorBullets(levelKey, company);
        case 'paramedic': return getParamedicBullets(levelKey, company);
        case 'medical-technician': return getMedicalTechnicianBullets(levelKey, company);
        case 'physician-assistant': return getPhysicianAssistantBullets(levelKey, company);
        case 'medical-sales-representative': return getMedicalSalesRepresentativeBullets(levelKey, company);

        // ============================================
        // EDUCATION & TEACHING
        // ============================================
        case 'teacher': return getTeacherBullets(levelKey, company);
        case 'professor': return getProfessorBullets(levelKey, company);
        case 'lecturer': return getLecturerBullets(levelKey, company);  // ✅ NEW
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

        // ============================================
        // IT & TECHNOLOGY
        // ============================================
        case 'developer': return getDeveloperBullets(levelKey, company);
        case 'frontend': return getFrontendDeveloperBullets(levelKey, company);
        case 'backend': return getBackendDeveloperBullets(levelKey, company);
        case 'full-stack': return getFullStackDeveloperBullets(levelKey, company);
        case 'software-engineer': return getSoftwareEngineerBullets(levelKey, company);
        case 'ai-ml': return getAiMlEngineerBullets(levelKey, company);
        case 'ai-research-engineer': return getAiResearchEngineerBullets(levelKey, company);
        case 'data-scientist': return getDataScientistBullets(levelKey, company);
        case 'data-analyst': return getDataAnalystBullets(levelKey, company);
        case 'data-engineer': return getDataEngineerBullets(levelKey, company);
        case 'cybersecurity': return getCybersecurityBullets(levelKey, company);
        case 'cloud': return getCloudEngineerBullets(levelKey, company);
        case 'devops': return getDevopsBullets(levelKey, company);
        case 'game-developer': return getGameDeveloperBullets(levelKey, company);
        case 'embedded-systems-engineer': return getEmbeddedSystemsEngineerBullets(levelKey, company);
        case 'database-administrator': return getDatabaseAdministratorBullets(levelKey, company);
        case 'mechatronics-engineer': return getMechatronicsEngineerBullets(levelKey, company);
        case 'qa': return getQaEngineerBullets(levelKey, company);
        case 'it-support': return getItSupportBullets(levelKey, company);

        // ============================================
        // ENGINEERING
        // ============================================
        case 'engineering': return getEngineeringBullets(levelKey, company);
        case 'civil-engineer': return getCivilEngineerBullets(levelKey, company);
        case 'mechanical-engineer': return getMechanicalEngineerBullets(levelKey, company);
        case 'electrical-engineer': return getElectricalEngineerBullets(levelKey, company);
        case 'automobile-engineer': return getAutomobileEngineerBullets(levelKey, company);
        case 'mining-engineer': return getMiningEngineerBullets(levelKey, company);
        case 'telecommunications-engineer': return getTelecommunicationsEngineerBullets(levelKey, company);
        case 'quantity-surveyor': return getQuantitySurveyorBullets(levelKey, company);

        // ============================================
        // BUSINESS & MANAGEMENT
        // ============================================
        case 'business': return getBusinessBullets(levelKey, company);
        case 'business-analyst': return getBusinessAnalystBullets(levelKey, company);
        case 'business-development-executive': return getBusinessDevelopmentExecutiveBullets(levelKey, company);
        case 'product-manager': return getProductManagerBullets(levelKey, company);
        case 'project-manager': return getProjectManagerBullets(levelKey, company);
        case 'operations-manager': return getOperationsManagerBullets(levelKey, company);
        case 'supply-chain-manager': return getSupplyChainManagerBullets(levelKey, company);
        case 'supply-chain-analyst': return getSupplyChainAnalystBullets(levelKey, company);
        case 'procurement-officer': return getProcurementOfficerBullets(levelKey, company);
        case 'logistics-manager': return getLogisticsManagerBullets(levelKey, company);
        case 'finance-analyst': return getFinanceAnalystBullets(levelKey, company);
        case 'financial-advisor': return getFinancialAdvisorBullets(levelKey, company);
        case 'entrepreneur': return getEntrepreneurBullets(levelKey, company);

        // ============================================
        // COMMERCE & FINANCE
        // ============================================
        case 'accountant': return getAccountantBullets(levelKey, company);
        case 'banker': return getBankerBullets(levelKey, company);

        // ============================================
        // SALES & MARKETING
        // ============================================
        case 'sales': return getSalesBullets(levelKey, company);
        case 'marketing': return getMarketingBullets(levelKey, company);
        case 'digital-marketing': return getPerformanceMarketerBullets(levelKey, company);
        case 'seo': return getSeoSpecialistBullets(levelKey, company);
        case 'content-creator': return getContentCreatorBullets(levelKey, company);
        case 'customer-support-specialist': return getCustomerSupportSpecialistBullets(levelKey, company);

        // ============================================
        // CREATIVE & DESIGN
        // ============================================
        case 'designer': return getDesignerBullets(levelKey, company);
        case 'graphic-designer': return getGraphicDesignerBullets(levelKey, company);
        case 'uiux': return getUiuxDesignerBullets(levelKey, company);

        // ============================================
        // VOCATIONAL & TRADES
        // ============================================
        case 'vocational': return getElectricianBullets(levelKey, company);
        case 'electrician': return getElectricianBullets(levelKey, company);
        case 'plumber': return getPlumberBullets(levelKey, company);
        case 'welder': return getWelderBullets(levelKey, company);
        case 'mason': return getMasonBullets(levelKey, company);
        case 'machine-operator': return getMachineOperatorBullets(levelKey, company);
        case 'cnc-operator': return getCncOperatorBullets(levelKey, company);
        case 'stitching-machine-operator': return getStitchingMachineOperatorBullets(levelKey, company);
        case 'computer-operator': return getComputerOperatorBullets(levelKey, company);
        case 'electrical-technician': return getElectricalTechnicianBullets(levelKey, company);
        case 'civil-technician': return getCivilTechnicianBullets(levelKey, company);
        case 'auto-mechanic': return getAutoMechanicBullets(levelKey, company);
        case 'hvac-technician': return getHvacTechnicianBullets(levelKey, company);
        case 'agricultural-technician': return getAgriculturalTechnicianBullets(levelKey, company);

        // ============================================
        // RENEWABLE ENERGY
        // ============================================
        case 'renewable': return getRenewableEnergyEngineerBullets(levelKey, company);
        case 'solar': return getSolarPVInstallerBullets(levelKey, company);
        case 'wind': return getWindTurbineTechnicianBullets(levelKey, company);

        // ============================================
        // AVIATION & DEFENSE
        // ============================================
        case 'pilot': return getPilotBullets(levelKey, company);
        case 'army': return getArmyOfficerBullets(levelKey, company);

        // ============================================
        // HOSPITALITY
        // ============================================
        case 'chef': return getChefBullets(levelKey, company);

        // ============================================
        // ARTS & HUMANITIES
        // ============================================
        case 'arts': return getArtsBullets(levelKey, company);

        // ============================================
        // SOCIAL SCIENCES
        // ============================================
        case 'social-sciences': return getSocialSciencesBullets(levelKey, company);
        case 'natural-sciences': return getNaturalSciencesBullets(levelKey, company);

        // ============================================
        // HR
        // ============================================
        case 'hr': return getHrBullets(levelKey, company);

        // ============================================
        // FREELANCER
        // ============================================
        case 'freelancer': return getFreelancerBullets(levelKey, company);

        // ============================================
        // LAW
        // ============================================
        case 'law': return getLawBullets(levelKey, company);

        // ============================================
        // DEFAULT
        // ============================================
        default: return getGeneralBullets(levelKey, company);
    }
};