// utils/profession/bullets.ts
// ============================================
// PROFESSION BULLETS - 280+ Professions (UPDATED)
// ============================================

// ============================================
// EXISTING IMPORTS (109 pools)
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
import { getInvestmentBankerBullets } from '../pools/investmentBankerPool';
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
import { getTelecommunicationsEngineerBullets } from '../pools/telecommunicationsEngineerPool';
import { getQuantitySurveyorBullets } from '../pools/quantitySurveyorPool';
import { getPhysicianAssistantBullets } from '../pools/physicianAssistantPool';
import { getMedicalSalesRepresentativeBullets } from '../pools/medicalSalesRepresentativePool';
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
import { getLecturerBullets } from '../pools/lecturerPool';
import { getWebDeveloperBullets } from '../pools/webDeveloperPool';
import { getMobileDeveloperBullets } from '../pools/mobileDeveloperPool';
import { getBlockchainDeveloperBullets } from '../pools/blockchainDeveloperPool';
import { getSalesforceDeveloperBullets } from '../pools/salesforceDeveloperPool';
import { getSystemAdministratorBullets } from '../pools/systemAdministratorPool';
import { getNetworkEngineerBullets } from '../pools/networkEngineerPool';
import { getSoftwareArchitectBullets } from '../pools/softwareArchitectPool';
import { getFrontendBullets } from '../pools/frontendPool';
import { getSupplyChainBullets } from '../pools/supplyChainPool';
import { getConsultantBullets } from '../pools/consultantPool';
import { getChemicalEngineerBullets } from '../pools/chemicalEngineerPool';
import { getIndustrialEngineerBullets } from '../pools/industrialEngineerPool';
import { getPetroleumEngineerBullets } from '../pools/petroleumEngineerPool';
import { getArchitectBullets } from '../pools/architectPool';
import { getStructuralEngineerBullets } from '../pools/structuralEngineerPool';
import { getEnvironmentalEngineerBullets } from '../pools/environmentalEngineerPool';
import { getBiomedicalEngineerBullets } from '../pools/biomedicalEngineerPool';
import { getRoboticsEngineerBullets } from '../pools/roboticsEngineerPool';
import { getFinancialAnalystBullets } from '../pools/financialAnalystPool';
import { getAuditorBullets } from '../pools/auditorPool';
import { getRadiologistBullets } from '../pools/radiologistPool';
import { getMedicalTechnologistBullets } from '../pools/medicalTechnologistPool';
import { getPhysicalTherapistBullets } from '../pools/physicalTherapistPool';
import { getPrincipalBullets } from '../pools/principalPool';
import { getCopywriterBullets } from '../pools/copywriterPool';
import { getJournalistBullets } from '../pools/journalistPool';
import { getPrSpecialistBullets } from '../pools/prSpecialistPool';
import { getIllustratorBullets } from '../pools/illustratorPool';
import { getAnimatorBullets } from '../pools/animatorPool';
import { getVideoEditorBullets } from '../pools/videoEditorPool';
import { getPhotographerBullets } from '../pools/photographerPool';
import { getMotionDesignerBullets } from '../pools/motionDesignerPool';
import { get3dArtistBullets } from '../pools/3dArtistPool';
import { getLawyerBullets } from '../pools/lawyerPool';
import { getAttorneyBullets } from '../pools/attorneyPool';
import { getBarristerBullets } from '../pools/barristerPool';
import { getLegalAdvisorBullets } from '../pools/legalAdvisorPool';
import { getJudgeBullets } from '../pools/judgePool';
import { getPsychologistBullets } from '../pools/psychologistPool';
import { getSociologistBullets } from '../pools/sociologistPool';
import { getEconomistBullets } from '../pools/economistPool';
import { getSocialWorkerBullets } from '../pools/socialWorkerPool';
import { getPoliticalScientistBullets } from '../pools/politicalScientistPool';
import { getPhysicistBullets } from '../pools/physicistPool';
import { getChemistBullets } from '../pools/chemistPool';
import { getBiologistBullets } from '../pools/biologistPool';
import { getMicrobiologistBullets } from '../pools/microbiologistPool';
import { getZoologistBullets } from '../pools/zoologistPool';
import { getBotanistBullets } from '../pools/botanistPool';
import { getHistorianBullets } from '../pools/historianPool';
import { getPhilosopherBullets } from '../pools/philosopherPool';
import { getLinguistBullets } from '../pools/linguistPool';
import { getLiteratureBullets } from '../pools/literaturePool';
import { getJournalismBullets } from '../pools/journalismPool';
import { getAirTrafficControllerBullets } from '../pools/airTrafficControllerPool';
import { getNavyOfficerBullets } from '../pools/navyOfficerPool';
import { getAirForceOfficerBullets } from '../pools/airForceOfficerPool';
import { getPoliceOfficerBullets } from '../pools/policeOfficerPool';
import { getFirefighterBullets } from '../pools/firefighterPool';
import { getCarpenterBullets } from '../pools/carpenterPool';
import { getConstructionWorkerBullets } from '../pools/constructionWorkerPool';
import { getEnergyEngineerBullets } from '../pools/energyEngineerPool';
import { getHotelManagerBullets } from '../pools/hotelManagerPool';
import { getEventPlannerBullets } from '../pools/eventPlannerPool';
import { getRealEstateAgentBullets } from '../pools/realEstateAgentPool';
import { getInsuranceAgentBullets } from '../pools/insuranceAgentPool';
import { getTaxConsultantBullets } from '../pools/taxConsultantPool';
import { getCreditAnalystBullets } from '../pools/creditAnalystPool';
import { getTreasuryManagerBullets } from '../pools/treasuryManagerPool';
import { getFintechBullets } from '../pools/fintechPool';
import { getRiskManagerBullets } from '../pools/riskManagerPool';
import { getDigitalMarketingBullets } from '../pools/digitalMarketingPool';
import { getEventPlannerBullets as getEventPlannerBulletsPool } from '../pools/eventPlannerPool';

// ============================================
// NEW IMPORTS - BATCH 2 (60 pools)
// ============================================

// Healthcare (10)
import { getDentalAssistantBullets } from '../pools/dentalAssistantPool';
import { getDentalTechnicianBullets } from '../pools/dentalTechnicianPool';
import { getDietitianBullets } from '../pools/dietitianPool';
import { getEmergencyMedicalTechnicianBullets } from '../pools/emergencyMedicalTechnicianPool';
import { getLabAssistantBullets } from '../pools/labAssistantPool';
import { getMedicalAssistantBullets } from '../pools/medicalAssistantPool';
import { getMedicalCoderBullets } from '../pools/medicalCoderPool';
import { getMidwifeBullets } from '../pools/midwifePool';
import { getPublicHealthOfficerBullets } from '../pools/publicHealthOfficerPool';
import { getCaregiverBullets } from '../pools/caregiverPool';

// Education (3)
import { getSpecialEducationTeacherBullets } from '../pools/specialEducationTeacherPool';
import { getSchoolCounselorBullets } from '../pools/schoolCounselorPool';
import { getResearchAssistantBullets } from '../pools/researchAssistantPool';

// IT (5)
import { getComputerHardwareTechnicianBullets } from '../pools/computerHardwareTechnicianPool';
import { getComputerProgrammerBullets } from '../pools/computerProgrammerPool';
import { getElectronicsTechnicianBullets } from '../pools/electronicsTechnicianPool';
import { getItTechnicianBullets } from '../pools/itTechnicianPool';
import { getSoftwareTesterBullets } from '../pools/softwareTesterPool';

// Business (5)
import { getProcurementManagerBullets } from '../pools/procurementManagerPool';
import { getSalesManagerBullets } from '../pools/salesManagerPool';
import { getSalesExecutiveBullets } from '../pools/salesExecutivePool';
import { getStoreManagerBullets } from '../pools/storeManagerPool';
import { getRetailManagerBullets } from '../pools/retailManagerPool';

// Engineering (10)
import { getConstructionSupervisorBullets } from '../pools/constructionSupervisorPool';
import { getForemanBullets } from '../pools/foremanPool';
import { getIndustrialElectricianBullets } from '../pools/industrialElectricianPool';
import { getInstrumentationTechnicianBullets } from '../pools/instrumentationTechnicianPool';
import { getMaintenanceTechnicianBullets } from '../pools/maintenanceTechnicianPool';
import { getSiteEngineerBullets } from '../pools/siteEngineerPool';
import { getSiteSupervisorBullets } from '../pools/siteSupervisorPool';
import { getSurveyorBullets } from '../pools/surveyorPool';
import { getTextileEngineerBullets } from '../pools/textileEngineerPool';
import { getTextileTechnicianBullets } from '../pools/textileTechnicianPool';

// Vocational (8)
import { getPackagingOperatorBullets } from '../pools/packagingOperatorPool';
import { getProductionManagerBullets } from '../pools/productionManagerPool';
import { getProductionSupervisorBullets } from '../pools/productionSupervisorPool';
import { getQualityControlInspectorBullets } from '../pools/qualityControlInspectorPool';
import { getQualityControlEngineerBullets } from '../pools/qualityControlEngineerPool';
import { getSolarTechnicianBullets } from '../pools/solarTechnicianPool';
import { getDriverBullets } from '../pools/driverPool';
import { getTailorBullets } from '../pools/tailorPool';

// Hospitality (6)
import { getHotelReceptionistBullets } from '../pools/hotelReceptionistPool';
import { getHousekeepingSupervisorBullets } from '../pools/housekeepingSupervisorPool';
import { getRestaurantManagerBullets } from '../pools/restaurantManagerPool';
import { getTourismOfficerBullets } from '../pools/tourismOfficerPool';
import { getTravelConsultantBullets } from '../pools/travelConsultantPool';
import { getCallCenterAgentBullets } from '../pools/callCenterAgentPool';

// Office & Admin (8)
import { getOfficeAssistantBullets } from '../pools/officeAssistantPool';
import { getDataEntryOperatorBullets } from '../pools/dataEntryOperatorPool';
import { getCashierBullets } from '../pools/cashierPool';
import { getStorekeeperBullets } from '../pools/storekeeperPool';
import { getWarehouseManagerBullets } from '../pools/warehouseManagerPool';
import { getWarehouseSupervisorBullets } from '../pools/warehouseSupervisorPool';
import { getLogisticsCoordinatorBullets } from '../pools/logisticsCoordinatorPool';
import { getFreightForwarderBullets } from '../pools/freightForwarderPool';

// Safety & Security (5)
import { getSafetyOfficerBullets } from '../pools/safetyOfficerPool';
import { getHseOfficerBullets } from '../pools/hseOfficerPool';
import { getFoodSafetyOfficerBullets } from '../pools/foodSafetyOfficerPool';
import { getSecurityGuardBullets } from '../pools/securityGuardPool';
import { getSecurityOfficerBullets } from '../pools/securityOfficerPool';

// ============================================
// MAIN FUNCTION
// ============================================
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
        case 'radiologist': return getRadiologistBullets(levelKey, company);
        case 'medical-technologist': return getMedicalTechnologistBullets(levelKey, company);
        case 'physical-therapist': return getPhysicalTherapistBullets(levelKey, company);
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
        case 'dental-assistant': return getDentalAssistantBullets(levelKey, company);
        case 'dental-technician': return getDentalTechnicianBullets(levelKey, company);
        case 'dietitian': return getDietitianBullets(levelKey, company);
        case 'emergency-medical-technician': return getEmergencyMedicalTechnicianBullets(levelKey, company);
        case 'lab-assistant': return getLabAssistantBullets(levelKey, company);
        case 'medical-assistant': return getMedicalAssistantBullets(levelKey, company);
        case 'medical-coder': return getMedicalCoderBullets(levelKey, company);
        case 'midwife': return getMidwifeBullets(levelKey, company);
        case 'public-health-officer': return getPublicHealthOfficerBullets(levelKey, company);
        case 'caregiver': return getCaregiverBullets(levelKey, company);

        // ============================================
        // EDUCATION & TEACHING
        // ============================================
        case 'teacher': return getTeacherBullets(levelKey, company);
        case 'professor': return getProfessorBullets(levelKey, company);
        case 'lecturer': return getLecturerBullets(levelKey, company);
        case 'principal': return getPrincipalBullets(levelKey, company);
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
        case 'special-education-teacher': return getSpecialEducationTeacherBullets(levelKey, company);
        case 'school-counselor': return getSchoolCounselorBullets(levelKey, company);
        case 'research-assistant': return getResearchAssistantBullets(levelKey, company);

        // ============================================
        // IT & TECHNOLOGY
        // ============================================
        case 'developer': return getDeveloperBullets(levelKey, company);
        case 'frontend': return getFrontendDeveloperBullets(levelKey, company);
        case 'frontend-base': return getFrontendBullets(levelKey, company);
        case 'backend': return getBackendDeveloperBullets(levelKey, company);
        case 'full-stack': return getFullStackDeveloperBullets(levelKey, company);
        case 'web': return getWebDeveloperBullets(levelKey, company);
        case 'mobile': return getMobileDeveloperBullets(levelKey, company);
        case 'blockchain': return getBlockchainDeveloperBullets(levelKey, company);
        case 'salesforce': return getSalesforceDeveloperBullets(levelKey, company);
        case 'system-administrator': return getSystemAdministratorBullets(levelKey, company);
        case 'network-engineer': return getNetworkEngineerBullets(levelKey, company);
        case 'software-architect': return getSoftwareArchitectBullets(levelKey, company);
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
        case 'computer-hardware-technician': return getComputerHardwareTechnicianBullets(levelKey, company);
        case 'computer-programmer': return getComputerProgrammerBullets(levelKey, company);
        case 'electronics-technician': return getElectronicsTechnicianBullets(levelKey, company);
        case 'it-technician': return getItTechnicianBullets(levelKey, company);
        case 'software-tester': return getSoftwareTesterBullets(levelKey, company);

        // ============================================
        // ENGINEERING
        // ============================================
        case 'engineering': return getEngineeringBullets(levelKey, company);
        case 'civil-engineer': return getCivilEngineerBullets(levelKey, company);
        case 'mechanical-engineer': return getMechanicalEngineerBullets(levelKey, company);
        case 'electrical-engineer': return getElectricalEngineerBullets(levelKey, company);
        case 'chemical-engineer': return getChemicalEngineerBullets(levelKey, company);
        case 'industrial-engineer': return getIndustrialEngineerBullets(levelKey, company);
        case 'petroleum-engineer': return getPetroleumEngineerBullets(levelKey, company);
        case 'architect': return getArchitectBullets(levelKey, company);
        case 'structural-engineer': return getStructuralEngineerBullets(levelKey, company);
        case 'environmental-engineer': return getEnvironmentalEngineerBullets(levelKey, company);
        case 'biomedical-engineer': return getBiomedicalEngineerBullets(levelKey, company);
        case 'robotics-engineer': return getRoboticsEngineerBullets(levelKey, company);
        case 'automobile-engineer': return getAutomobileEngineerBullets(levelKey, company);
        case 'mining-engineer': return getMiningEngineerBullets(levelKey, company);
        case 'telecommunications-engineer': return getTelecommunicationsEngineerBullets(levelKey, company);
        case 'quantity-surveyor': return getQuantitySurveyorBullets(levelKey, company);
        case 'construction-supervisor': return getConstructionSupervisorBullets(levelKey, company);
        case 'foreman': return getForemanBullets(levelKey, company);
        case 'industrial-electrician': return getIndustrialElectricianBullets(levelKey, company);
        case 'instrumentation-technician': return getInstrumentationTechnicianBullets(levelKey, company);
        case 'maintenance-technician': return getMaintenanceTechnicianBullets(levelKey, company);
        case 'site-engineer': return getSiteEngineerBullets(levelKey, company);
        case 'site-supervisor': return getSiteSupervisorBullets(levelKey, company);
        case 'surveyor': return getSurveyorBullets(levelKey, company);
        case 'textile-engineer': return getTextileEngineerBullets(levelKey, company);
        case 'textile-technician': return getTextileTechnicianBullets(levelKey, company);

        // ============================================
        // BUSINESS & MANAGEMENT
        // ============================================
        case 'business': return getBusinessBullets(levelKey, company);
        case 'business-analyst': return getBusinessAnalystBullets(levelKey, company);
        case 'business-development-executive': return getBusinessDevelopmentExecutiveBullets(levelKey, company);
        case 'product-manager': return getProductManagerBullets(levelKey, company);
        case 'project-manager': return getProjectManagerBullets(levelKey, company);
        case 'operations-manager': return getOperationsManagerBullets(levelKey, company);
        case 'supply-chain': return getSupplyChainBullets(levelKey, company);
        case 'supply-chain-manager': return getSupplyChainManagerBullets(levelKey, company);
        case 'supply-chain-analyst': return getSupplyChainAnalystBullets(levelKey, company);
        case 'procurement-officer': return getProcurementOfficerBullets(levelKey, company);
        case 'procurement-manager': return getProcurementManagerBullets(levelKey, company);
        case 'logistics-manager': return getLogisticsManagerBullets(levelKey, company);
        case 'consultant': return getConsultantBullets(levelKey, company);
        case 'finance-analyst': return getFinanceAnalystBullets(levelKey, company);
        case 'financial-advisor': return getFinancialAdvisorBullets(levelKey, company);
        case 'entrepreneur': return getEntrepreneurBullets(levelKey, company);
        case 'sales-manager': return getSalesManagerBullets(levelKey, company);
        case 'sales-executive': return getSalesExecutiveBullets(levelKey, company);
        case 'store-manager': return getStoreManagerBullets(levelKey, company);
        case 'retail-manager': return getRetailManagerBullets(levelKey, company);

        // ============================================
        // COMMERCE & FINANCE
        // ============================================
        case 'accountant': return getAccountantBullets(levelKey, company);
        case 'banker': return getBankerBullets(levelKey, company);
        case 'investment-banker': return getInvestmentBankerBullets(levelKey, company);
        case 'financial-analyst': return getFinancialAnalystBullets(levelKey, company);
        case 'auditor': return getAuditorBullets(levelKey, company);
        case 'tax-consultant': return getTaxConsultantBullets(levelKey, company);
        case 'credit-analyst': return getCreditAnalystBullets(levelKey, company);
        case 'treasury-manager': return getTreasuryManagerBullets(levelKey, company);
        case 'fintech': return getFintechBullets(levelKey, company);
        case 'risk-manager': return getRiskManagerBullets(levelKey, company);

        // ============================================
        // SALES & MARKETING
        // ============================================
        case 'sales': return getSalesBullets(levelKey, company);
        case 'marketing': return getMarketingBullets(levelKey, company);
        case 'digital-marketing': return getDigitalMarketingBullets(levelKey, company);
        case 'seo': return getSeoSpecialistBullets(levelKey, company);
        case 'performance-marketer': return getPerformanceMarketerBullets(levelKey, company);
        case 'content-creator': return getContentCreatorBullets(levelKey, company);
        case 'copywriter': return getCopywriterBullets(levelKey, company);
        case 'journalist': return getJournalistBullets(levelKey, company);
        case 'pr-specialist': return getPrSpecialistBullets(levelKey, company);
        case 'customer-support-specialist': return getCustomerSupportSpecialistBullets(levelKey, company);

        // ============================================
        // CREATIVE & DESIGN
        // ============================================
        case 'designer': return getDesignerBullets(levelKey, company);
        case 'graphic-designer': return getGraphicDesignerBullets(levelKey, company);
        case 'ui-ux': return getUiuxDesignerBullets(levelKey, company);
        case 'illustrator': return getIllustratorBullets(levelKey, company);
        case 'animator': return getAnimatorBullets(levelKey, company);
        case 'video-editor': return getVideoEditorBullets(levelKey, company);
        case 'photographer': return getPhotographerBullets(levelKey, company);
        case 'motion-designer': return getMotionDesignerBullets(levelKey, company);
        case '3d-artist': return get3dArtistBullets(levelKey, company);

        // ============================================
        // LEGAL
        // ============================================
        case 'law': return getLawBullets(levelKey, company);
        case 'lawyer': return getLawyerBullets(levelKey, company);
        case 'advocate': return getLawBullets(levelKey, company);
        case 'attorney': return getAttorneyBullets(levelKey, company);
        case 'barrister': return getBarristerBullets(levelKey, company);
        case 'legal-advisor': return getLegalAdvisorBullets(levelKey, company);
        case 'judge': return getJudgeBullets(levelKey, company);

        // ============================================
        // SOCIAL SCIENCES
        // ============================================
        case 'social-sciences': return getSocialSciencesBullets(levelKey, company);
        case 'psychologist': return getPsychologistBullets(levelKey, company);
        case 'sociologist': return getSociologistBullets(levelKey, company);
        case 'economist': return getEconomistBullets(levelKey, company);
        case 'social-worker': return getSocialWorkerBullets(levelKey, company);
        case 'political-scientist': return getPoliticalScientistBullets(levelKey, company);

        // ============================================
        // NATURAL SCIENCES
        // ============================================
        case 'natural-sciences': return getNaturalSciencesBullets(levelKey, company);
        case 'physicist': return getPhysicistBullets(levelKey, company);
        case 'chemist': return getChemistBullets(levelKey, company);
        case 'biologist': return getBiologistBullets(levelKey, company);
        case 'microbiologist': return getMicrobiologistBullets(levelKey, company);
        case 'zoologist': return getZoologistBullets(levelKey, company);
        case 'botanist': return getBotanistBullets(levelKey, company);

        // ============================================
        // ARTS & HUMANITIES
        // ============================================
        case 'arts': return getArtsBullets(levelKey, company);
        case 'historian': return getHistorianBullets(levelKey, company);
        case 'philosopher': return getPhilosopherBullets(levelKey, company);
        case 'linguist': return getLinguistBullets(levelKey, company);
        case 'literature': return getLiteratureBullets(levelKey, company);
        case 'journalism': return getJournalismBullets(levelKey, company);

        // ============================================
        // AVIATION & DEFENSE
        // ============================================
        case 'pilot': return getPilotBullets(levelKey, company);
        case 'air-traffic-controller': return getAirTrafficControllerBullets(levelKey, company);
        case 'army-officer': return getArmyOfficerBullets(levelKey, company);
        case 'navy-officer': return getNavyOfficerBullets(levelKey, company);
        case 'air-force-officer': return getAirForceOfficerBullets(levelKey, company);
        case 'police-officer': return getPoliceOfficerBullets(levelKey, company);
        case 'firefighter': return getFirefighterBullets(levelKey, company);

        // ============================================
        // VOCATIONAL
        // ============================================
        case 'electrician': return getElectricianBullets(levelKey, company);
        case 'plumber': return getPlumberBullets(levelKey, company);
        case 'carpenter': return getCarpenterBullets(levelKey, company);
        case 'welder': return getWelderBullets(levelKey, company);
        case 'mason': return getMasonBullets(levelKey, company);
        case 'construction-worker': return getConstructionWorkerBullets(levelKey, company);
        case 'cnc-operator': return getCncOperatorBullets(levelKey, company);
        case 'machine-operator': return getMachineOperatorBullets(levelKey, company);
        case 'computer-operator': return getComputerOperatorBullets(levelKey, company);
        case 'electrical-technician': return getElectricalTechnicianBullets(levelKey, company);
        case 'stitching-machine-operator': return getStitchingMachineOperatorBullets(levelKey, company);
        case 'civil-technician': return getCivilTechnicianBullets(levelKey, company);
        case 'auto-mechanic': return getAutoMechanicBullets(levelKey, company);
        case 'hvac-technician': return getHvacTechnicianBullets(levelKey, company);
        case 'agricultural-technician': return getAgriculturalTechnicianBullets(levelKey, company);
        case 'packaging-operator': return getPackagingOperatorBullets(levelKey, company);
        case 'production-manager': return getProductionManagerBullets(levelKey, company);
        case 'production-supervisor': return getProductionSupervisorBullets(levelKey, company);
        case 'quality-control-inspector': return getQualityControlInspectorBullets(levelKey, company);
        case 'quality-control-engineer': return getQualityControlEngineerBullets(levelKey, company);
        case 'solar-technician': return getSolarTechnicianBullets(levelKey, company);
        case 'driver': return getDriverBullets(levelKey, company);
        case 'tailor': return getTailorBullets(levelKey, company);

        // ============================================
        // RENEWABLE ENERGY
        // ============================================
        case 'renewable': return getRenewableEnergyEngineerBullets(levelKey, company);
        case 'solar': return getSolarPVInstallerBullets(levelKey, company);
        case 'wind': return getWindTurbineTechnicianBullets(levelKey, company);
        case 'energy-engineer': return getEnergyEngineerBullets(levelKey, company);

        // ============================================
        // HOSPITALITY
        // ============================================
        case 'chef': return getChefBullets(levelKey, company);
        case 'hotel-manager': return getHotelManagerBullets(levelKey, company);
        case 'event-planner': return getEventPlannerBullets(levelKey, company);
        case 'hotel-receptionist': return getHotelReceptionistBullets(levelKey, company);
        case 'housekeeping-supervisor': return getHousekeepingSupervisorBullets(levelKey, company);
        case 'restaurant-manager': return getRestaurantManagerBullets(levelKey, company);
        case 'tourism-officer': return getTourismOfficerBullets(levelKey, company);
        case 'travel-consultant': return getTravelConsultantBullets(levelKey, company);
        case 'call-center-agent': return getCallCenterAgentBullets(levelKey, company);

        // ============================================
        // REAL ESTATE
        // ============================================
        case 'real-estate-agent': return getRealEstateAgentBullets(levelKey, company);
        case 'insurance-agent': return getInsuranceAgentBullets(levelKey, company);

        // ============================================
        // OFFICE & ADMIN
        // ============================================
        case 'office-assistant': return getOfficeAssistantBullets(levelKey, company);
        case 'data-entry-operator': return getDataEntryOperatorBullets(levelKey, company);
        case 'cashier': return getCashierBullets(levelKey, company);
        case 'storekeeper': return getStorekeeperBullets(levelKey, company);
        case 'warehouse-manager': return getWarehouseManagerBullets(levelKey, company);
        case 'warehouse-supervisor': return getWarehouseSupervisorBullets(levelKey, company);
        case 'logistics-coordinator': return getLogisticsCoordinatorBullets(levelKey, company);
        case 'freight-forwarder': return getFreightForwarderBullets(levelKey, company);

        // ============================================
        // SAFETY & SECURITY
        // ============================================
        case 'safety-officer': return getSafetyOfficerBullets(levelKey, company);
        case 'hse-officer': return getHseOfficerBullets(levelKey, company);
        case 'food-safety-officer': return getFoodSafetyOfficerBullets(levelKey, company);
        case 'security-guard': return getSecurityGuardBullets(levelKey, company);
        case 'security-officer': return getSecurityOfficerBullets(levelKey, company);

        // ============================================
        // HR
        // ============================================
        case 'hr': return getHrBullets(levelKey, company);

        // ============================================
        // FREELANCER
        // ============================================
        case 'freelancer': return getFreelancerBullets(levelKey, company);

        // ============================================
        // DEFAULT
        // ============================================
        default: return getGeneralBullets(levelKey, company);
    }
};