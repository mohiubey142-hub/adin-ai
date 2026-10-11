// utils/profession/detection.ts
// ============================================
// PROFESSION DETECTION - 280+ Professions (UPDATED)
// ============================================
// 
// ✅ FIXED: "officer" generic match removed
// ✅ FIXED: "ai" match now uses word boundary (Sustain-ai-bility bug)
// ✅ FIXED: "hr" match now uses word boundary (Sharma bug)
// ✅ FIXED: "ml" match now uses word boundary
// ✅ NEW: investmentBanker detection added (before banker)
// ============================================

// ============================================
// HELPER: Word boundary match
// ============================================
const hasWord = (text: string, word: string): boolean => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    return regex.test(text);
};

export const detectProfession = (title: string): string => {
    const t = title.toLowerCase();
    
    // ============================================
    // LEVEL 1: MOST SPECIFIC PROFESSIONS
    // ============================================
    
    // --- MEDICAL SPECIFIC ---
    if (t.includes('cardiologist')) return 'cardiologist';
    if (t.includes('pediatrician')) return 'pediatrician';
    if (t.includes('gynecologist')) return 'gynecologist';
    if (t.includes('psychiatrist')) return 'psychiatrist';
    if (t.includes('radiologist')) return 'radiologist';
    if (t.includes('dentist')) return 'dentist';
    if (t.includes('pharmacist')) return 'pharmacist';
    if (t.includes('physiotherapist') || t.includes('physical therapist')) return 'physiotherapist';
    if (t.includes('nutritionist')) return 'nutritionist';
    if (t.includes('dietitian')) return 'dietitian';
    if (t.includes('medical lab') || t.includes('laboratory technologist') || 
        t.includes('lab technologist') || t.includes('medical laboratory')) return 'medicalLabTechnologist';
    if (t.includes('radiology technologist') || t.includes('radiologic technologist') || 
        t.includes('imaging technologist') || t.includes('x-ray technologist')) return 'radiologyTechnologist';
    if (t.includes('occupational therapist') || t.includes('occupational therapy')) return 'occupationalTherapist';
    if (t.includes('speech therapist') || t.includes('speech-language') || 
        t.includes('speech pathologist')) return 'speechTherapist';
    if (t.includes('optometrist') || t.includes('eye doctor')) return 'optometrist';
    if (t.includes('veterinary') || t.includes('veterinarian') || t.includes('vet doctor')) return 'veterinaryDoctor';
    if (t.includes('nurse')) return 'nurse';
    if (t.includes('physician assistant') || t.includes('clinical assistant') || t.includes('pa ')) return 'physicianAssistant';
    if (t.includes('paramedic') || t.includes('emergency medical')) return 'paramedic';
    if (t.includes('medical technician') || t.includes('lab technician')) return 'medicalTechnician';
    if (t.includes('medical sales representative') || t.includes('pharma sales') || 
        t.includes('medical representative')) return 'medicalSalesRepresentative';
    
    // --- NEW MEDICAL (BATCH 2) ---
    if (t.includes('dental assistant')) return 'dentalAssistant';
    if (t.includes('dental technician') || t.includes('dental lab')) return 'dentalTechnician';
    if (t.includes('emergency medical technician') || t.includes('emt')) return 'emergencyMedicalTechnician';
    if (t.includes('lab assistant') || t.includes('laboratory assistant')) return 'labAssistant';
    if (t.includes('medical assistant')) return 'medicalAssistant';
    if (t.includes('medical coder') || t.includes('medical coding')) return 'medicalCoder';
    if (t.includes('midwife') || t.includes('midwifery')) return 'midwife';
    if (t.includes('public health officer') || t.includes('public health')) return 'publicHealthOfficer';
    if (t.includes('caregiver') || t.includes('care giver') || t.includes('care taker')) return 'caregiver';
    
    // --- IT SPECIFIC ---
    if (t.includes('software engineer') && !t.includes('embedded')) return 'softwareEngineer';
    if (t.includes('full stack') || t.includes('fullstack')) return 'fullStack';
    if (t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('angular')) {
        if (t.includes('developer')) return 'frontend';
        return 'frontend';
    }
    if (t.includes('backend')) return 'backend';
    if (t.includes('ai research') || (t.includes('research engineer') && t.includes('ai')) || 
        t.includes('machine learning researcher')) return 'aiResearchEngineer';
    if (t.includes('embedded') || t.includes('firmware') || t.includes('embedded systems')) return 'embeddedSystemsEngineer';
    if (t.includes('database administrator') || t.includes('dba') || 
        t.includes('database admin')) return 'databaseAdministrator';
    if (t.includes('mechatronics') || t.includes('mechatronic')) return 'mechatronicsEngineer';
    if (t.includes('data scientist') || t.includes('machine learning')) return 'dataScientist';
    if (t.includes('data engineer') || t.includes('etl') || t.includes('data pipeline')) return 'dataEngineer';
    if (t.includes('cybersecurity') || t.includes('security engineer')) return 'cybersecurity';
    if (t.includes('cloud') || t.includes('aws') || t.includes('azure')) return 'cloud';
    if (t.includes('devops') || t.includes('ci/cd') || t.includes('kubernetes')) return 'devops';
    if (t.includes('game developer')) return 'gameDeveloper';
    if (t.includes('it support') || t.includes('system administrator')) return 'itSupport';
    if (t.includes('qa') || t.includes('quality assurance') || t.includes('testing')) return 'qa';
    
    // --- NEW IT (BATCH 2) ---
    if (t.includes('computer hardware') || t.includes('hardware technician')) return 'computerHardwareTechnician';
    if (t.includes('computer programmer') || t.includes('programmer')) return 'computerProgrammer';
    if (t.includes('electronics technician') || t.includes('electronic technician')) return 'electronicsTechnician';
    if (t.includes('it technician') || t.includes('it tech')) return 'itTechnician';
    if (t.includes('software tester') || t.includes('software testing')) return 'softwareTester';
    
    // --- ENGINEERING SPECIFIC ---
    if (t.includes('civil engineer')) return 'civilEngineer';
    if (t.includes('electrical engineer')) return 'electricalEngineer';
    if (t.includes('mechanical engineer')) return 'mechanicalEngineer';
    if (t.includes('automobile engineer') || t.includes('automotive engineer') || 
        t.includes('vehicle engineer')) return 'automobileEngineer';
    if (t.includes('mining engineer') || t.includes('mine engineer')) return 'miningEngineer';
    if (t.includes('telecommunications engineer') || t.includes('telecom engineer')) return 'telecommunicationsEngineer';
    if (t.includes('quantity surveyor') || t.includes('qs ') || t.includes('cost estimator')) return 'quantitySurveyor';
    
    // --- NEW ENGINEERING (BATCH 2) ---
    if (t.includes('construction supervisor')) return 'constructionSupervisor';
    if (t.includes('foreman') || t.includes('site foreman')) return 'foreman';
    if (t.includes('industrial electrician')) return 'industrialElectrician';
    if (t.includes('instrumentation technician') || t.includes('instrument technician')) return 'instrumentationTechnician';
    if (t.includes('maintenance technician') || t.includes('maintenance tech')) return 'maintenanceTechnician';
    if (t.includes('site engineer')) return 'siteEngineer';
    if (t.includes('site supervisor')) return 'siteSupervisor';
    if (t.includes('surveyor') || t.includes('land surveyor')) return 'surveyor';
    if (t.includes('textile engineer')) return 'textileEngineer';
    if (t.includes('textile technician')) return 'textileTechnician';
    
    // --- BUSINESS SPECIFIC ---
    if (t.includes('finance analyst') || t.includes('financial analyst')) return 'financeAnalyst';
    if (t.includes('financial advisor') || t.includes('wealth advisor') || 
        t.includes('financial planner')) return 'financialAdvisor';
    if (t.includes('supply chain manager') || t.includes('supply chain management')) return 'supplyChainManager';
    if (t.includes('supply chain analyst')) return 'supplyChainAnalyst';
    if (t.includes('procurement') || t.includes('procurement officer') || 
        t.includes('purchasing officer') || t.includes('purchasing manager')) return 'procurementOfficer';
    if (t.includes('logistics manager') || t.includes('logistics')) return 'logisticsManager';
    if (t.includes('business development executive') || t.includes('business development manager') ||
        t.includes('bdm') || t.includes('bde')) return 'businessDevelopmentExecutive';
    if (t.includes('product manager')) return 'productManager';
    if (t.includes('project manager')) return 'projectManager';
    if (t.includes('business analyst')) return 'businessAnalyst';
    if (t.includes('operations manager')) return 'operationsManager';
    
    // ✅ NEW: Investment Banker (banker se PEHLE check karo)
    if (t.includes('investment banker') || t.includes('investment banking')) return 'investmentBanker';
    if (t.includes('banker')) return 'banker';
    
    // --- NEW BUSINESS (BATCH 2) ---
    if (t.includes('procurement manager')) return 'procurementManager';
    if (t.includes('sales manager') || t.includes('sales lead')) return 'salesManager';
    if (t.includes('sales executive') || t.includes('sales representative')) return 'salesExecutive';
    if (t.includes('store manager')) return 'storeManager';
    if (t.includes('retail manager')) return 'retailManager';
    
    // --- EDUCATION SPECIFIC (SUBJECT TEACHERS) ---
    if (t.includes('lecturer') || t.includes('lectureship')) return 'lecturer';
    if (t.includes('physics teacher') || (t.includes('physics') && t.includes('teacher'))) return 'physicsTeacher';
    if (t.includes('chemistry teacher') || (t.includes('chemistry') && t.includes('teacher'))) return 'chemistryTeacher';
    if (t.includes('math teacher') || t.includes('mathematics') || (t.includes('maths') && t.includes('teacher'))) return 'mathTeacher';
    if (t.includes('biology teacher') || (t.includes('biology') && t.includes('teacher'))) return 'biologyTeacher';
    if (t.includes('english teacher') || (t.includes('english literature') && t.includes('teacher'))) return 'englishTeacher';
    if (t.includes('urdu teacher') || (t.includes('urdu') && t.includes('teacher'))) return 'urduTeacher';
    if (t.includes('computer teacher') || (t.includes('computer science') && t.includes('teacher'))) return 'computerTeacher';
    if (t.includes('islamic studies') || t.includes('islamiat')) return 'islamicStudiesTeacher';
    if (t.includes('pakistan studies') || t.includes('pak studies')) return 'pakistanStudiesTeacher';
    if (t.includes('history teacher') || (t.includes('history') && t.includes('teacher'))) return 'historyTeacher';
    
    // --- NEW EDUCATION (BATCH 2) ---
    if (t.includes('special education') || t.includes('special needs teacher')) return 'specialEducationTeacher';
    if (t.includes('school counselor') || t.includes('guidance counselor')) return 'schoolCounselor';
    if (t.includes('research assistant') || t.includes('research associate')) return 'researchAssistant';
    
    // --- VOCATIONAL SPECIFIC ---
    if (t.includes('computer operator')) return 'computerOperator';
    if (t.includes('electrical technician')) return 'electricalTechnician';
    if (t.includes('stitching machine operator') || t.includes('sewing machine operator')) return 'stitchingMachineOperator';
    if (t.includes('civil technician')) return 'civilTechnician';
    if (t.includes('auto mechanic') || t.includes('automotive mechanic')) return 'autoMechanic';
    if (t.includes('hvac technician') || t.includes('ac technician') || t.includes('air conditioning')) return 'hvacTechnician';
    if (t.includes('agricultural technician') || t.includes('agriculture technician')) return 'agriculturalTechnician';
    if (t.includes('machine operator')) return 'machineOperator';
    if (t.includes('cnc operator') || t.includes('cnc machinist')) return 'cncOperator';
    if (t.includes('welder') || t.includes('welding')) return 'welder';
    if (t.includes('mason') || t.includes('brick')) return 'mason';
    if (t.includes('electrician')) return 'electrician';
    if (t.includes('plumber')) return 'plumber';
    if (t.includes('carpenter') || t.includes('carpentry')) return 'carpenter';
    
    // --- NEW VOCATIONAL (BATCH 2) ---
    if (t.includes('packaging operator') || t.includes('packaging machine')) return 'packagingOperator';
    if (t.includes('production manager')) return 'productionManager';
    if (t.includes('production supervisor')) return 'productionSupervisor';
    if (t.includes('quality control inspector') || t.includes('qc inspector')) return 'qualityControlInspector';
    if (t.includes('quality control engineer') || t.includes('qc engineer')) return 'qualityControlEngineer';
    if (t.includes('solar technician') || t.includes('solar tech')) return 'solarTechnician';
    if (t.includes('driver') || t.includes('delivery driver')) return 'driver';
    if (t.includes('tailor') || t.includes('tailoring')) return 'tailor';
    
    // --- NEW OFFICE & ADMIN (BATCH 2) ---
    if (t.includes('office assistant') || t.includes('admin assistant')) return 'officeAssistant';
    if (t.includes('data entry operator') || t.includes('data entry')) return 'dataEntryOperator';
    if (t.includes('cashier') || t.includes('cash counter')) return 'cashier';
    if (t.includes('storekeeper') || t.includes('store keeper')) return 'storekeeper';
    if (t.includes('warehouse manager') || t.includes('warehouse')) return 'warehouseManager';
    if (t.includes('warehouse supervisor')) return 'warehouseSupervisor';
    if (t.includes('logistics coordinator') || t.includes('logistics')) return 'logisticsCoordinator';
    if (t.includes('freight forwarder') || t.includes('freight')) return 'freightForwarder';
    
    // --- NEW SAFETY & SECURITY (BATCH 2) ---
    if (t.includes('safety officer') || t.includes('safety')) return 'safetyOfficer';
    if (t.includes('hse officer') || t.includes('hse')) return 'hseOfficer';
    if (t.includes('food safety officer') || t.includes('food safety')) return 'foodSafetyOfficer';
    if (t.includes('security guard') || t.includes('security guard')) return 'securityGuard';
    if (t.includes('security officer') || t.includes('security')) return 'securityOfficer';
    
    // --- NEW HOSPITALITY (BATCH 2) ---
    if (t.includes('hotel receptionist') || t.includes('front desk')) return 'hotelReceptionist';
    if (t.includes('housekeeping supervisor') || t.includes('housekeeping')) return 'housekeepingSupervisor';
    if (t.includes('restaurant manager') || t.includes('restaurant')) return 'restaurantManager';
    if (t.includes('tourism officer') || t.includes('tourism')) return 'tourismOfficer';
    if (t.includes('travel consultant') || t.includes('travel agent')) return 'travelConsultant';
    if (t.includes('call center agent') || t.includes('call center') || t.includes('customer service representative')) return 'callCenterAgent';
    
    // --- OTHER SPECIFIC ---
    if (t.includes('graphic designer')) return 'graphicDesigner';
    if (t.includes('ui/ux') || t.includes('ux designer')) return 'uiux';
    if (t.includes('data analyst')) return 'dataAnalyst';
    if (t.includes('content creator') || t.includes('writer')) return 'contentCreator';
    if (t.includes('marketing') || t.includes('digital marketing')) return 'marketing';
    if (t.includes('pilot')) return 'pilot';
    if (t.includes('army') || t.includes('military')) return 'army';
    if (t.includes('professor') || t.includes('academic')) return 'professor';
    if (t.includes('solar')) return 'solar';
    if (t.includes('renewable')) return 'renewable';
    if (t.includes('wind')) return 'wind';
    if (t.includes('entrepreneur') || t.includes('founder')) return 'entrepreneur';
    if (t.includes('freelancer') || t.includes('freelance')) return 'freelancer';
    if (hasWord(t, 'ai') || hasWord(t, 'ml') || t.includes('artificial intelligence')) return 'aiMl';
    if (t.includes('customer support') || t.includes('customer service') || 
        t.includes('support specialist') || t.includes('customer care')) return 'customerSupportSpecialist';
    if (t.includes('healthcare admin') || t.includes('hospital admin') || 
        t.includes('medical admin') || t.includes('healthcare administrator')) return 'healthcareAdministrator';
    if (t.includes('chef') || t.includes('cook')) return 'chef';
    
    // ============================================
    // LEVEL 2: CATEGORY-LEVEL PROFESSIONS
    // ============================================
    
    if (t.includes('doctor') || t.includes('mbbs') || t.includes('physician') || 
        t.includes('medical') || t.includes('surgeon') || t.includes('pharma') ||
        t.includes('dpt') || t.includes('physical therapy')) {
        return 'doctor';
    }
    
    if (t.includes('developer') || t.includes('engineer') || t.includes('software') || 
        t.includes('web') || (t.includes('react') && !t.includes('teacher')) || 
        (t.includes('angular') && !t.includes('teacher')) || 
        (t.includes('vue') && !t.includes('teacher'))) {
        return 'developer';
    }
    
    if (t.includes('engineering') || t.includes('civil') || t.includes('electrical') || 
        t.includes('mechanical') || t.includes('chemical') || t.includes('industrial') ||
        t.includes('petroleum') || t.includes('telecommunication')) {
        return 'engineering';
    }
    
    if (t.includes('bba') || t.includes('mba') || t.includes('business administration') || 
        t.includes('business management') || (t.includes('marketing') && !t.includes('digital marketing')) || 
        t.includes('supply chain') || t.includes('procurement') || 
        t.includes('logistics') || t.includes('operations manager')) {
        return 'business';
    }
    
    if (t.includes('teacher') || t.includes('professor') || t.includes('lecturer') || 
        t.includes('educator') || t.includes('school') || t.includes('b.ed') || t.includes('bed')) {
        return 'teacher';
    }
    
    if (t.includes('accountant') || t.includes('accounting') || t.includes('finance') || 
        t.includes('commerce') || t.includes('auditor') || t.includes('quickbooks') ||
        t.includes('tax')) {
        return 'accountant';
    }
    
    if (t.includes('law') || t.includes('llb') || t.includes('legal') || t.includes('advocate') ||
        t.includes('attorney') || t.includes('barrister') || t.includes('legal advisor')) {
        return 'law';
    }
    
    if (t.includes('sales') || t.includes('business development') || t.includes('account executive')) {
        return 'sales';
    }
    
    if (hasWord(t, 'hr') || t.includes('human resources') || t.includes('recruiter')) {
        return 'hr';
    }
    
    if (t.includes('designer') || t.includes('graphic') || t.includes('visual')) {
        return 'designer';
    }
    
    // ============================================
    // LEVEL 3: SOCIAL & NATURAL SCIENCES
    // ============================================
    
    if (t.includes('social sciences') || t.includes('sociology') || t.includes('political science') || 
        t.includes('anthropology') || t.includes('psychology') || t.includes('economics') ||
        t.includes('social work') || t.includes('international relations')) {
        return 'socialSciences';
    }
    
    if (t.includes('physics') || t.includes('chemistry') || t.includes('biology') || 
        t.includes('natural sciences') || t.includes('biochemistry') || t.includes('microbiology') ||
        t.includes('zoology') || t.includes('botany')) {
        return 'naturalSciences';
    }
    
    if (t.includes('english') || t.includes('urdu') || t.includes('islamic studies') || 
        t.includes('arts') || t.includes('history') || t.includes('philosophy') ||
        t.includes('literature') || t.includes('journalism')) {
        return 'arts';
    }
    
    // ============================================
    // LEVEL 4: DEFAULT
    // ============================================
    return 'general';
};

// ============================================
// NEW HELPER: isUnknownProfession
// ============================================
export const isUnknownProfession = (title: string): boolean => {
    if (!title || !title.trim()) return true;
    return detectProfession(title) === 'general';
};