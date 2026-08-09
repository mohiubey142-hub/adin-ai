// utils/profession/summaries/categories.ts
// ============================================
// CATEGORIES - Industry, Display Name, Profession Category
// ============================================

// ============================================
// HELPER: Industry Detection (100+ Professions)
// ============================================
export const getIndustry = (profession: string): string => {
    const industries: Record<string, string> = {
        // Medical/Healthcare (13)
        'doctor': 'healthcare',
        'physiotherapist': 'healthcare',
        'nutritionist': 'healthcare',
        'medicalLabTechnologist': 'healthcare',
        'radiologyTechnologist': 'healthcare',
        'occupationalTherapist': 'healthcare',
        'speechTherapist': 'healthcare',
        'optometrist': 'healthcare',
        'veterinaryDoctor': 'healthcare',
        'healthcareAdministrator': 'healthcare',
        'nurse': 'healthcare',
        'dentist': 'healthcare',
        'pharmacist': 'healthcare',
        
        // ===== MEDICAL - NEW (3) =====
        'paramedic': 'healthcare',
        'medicalTechnician': 'healthcare',
        'physicianAssistant': 'healthcare',
        
        // Technology/IT (17)
        'developer': 'technology',
        'softwareEngineer': 'technology',
        'aiResearchEngineer': 'technology',
        'embeddedSystemsEngineer': 'technology',
        'databaseAdministrator': 'technology',
        'mechatronicsEngineer': 'technology',
        'dataScientist': 'technology',
        'cybersecurity': 'technology',
        'cloud': 'technology',
        'devops': 'technology',
        'frontend': 'technology',
        'backend': 'technology',
        'fullStack': 'technology',
        'aiMl': 'technology',
        'gameDeveloper': 'technology',
        'itSupport': 'technology',
        'productManager': 'technology',
        
        // ===== TECHNOLOGY - NEW (3) =====
        'qaEngineer': 'technology',
        'dataEngineer': 'technology',
        'computerOperator': 'technology',
        
        // Education (12)
        'teacher': 'education',
        'professor': 'education',
        'physicsTeacher': 'education',
        'chemistryTeacher': 'education',
        'mathTeacher': 'education',
        'biologyTeacher': 'education',
        'englishTeacher': 'education',
        'urduTeacher': 'education',
        'computerTeacher': 'education',
        'islamicStudiesTeacher': 'education',
        'pakistanStudiesTeacher': 'education',
        'historyTeacher': 'education',
        
        // ===== EDUCATION - NEW (1) =====
        'lecturer': 'education',
        
        // Business (6)
        'business': 'business',
        'businessAnalyst': 'business',
        'businessDevelopmentExecutive': 'business',
        'projectManager': 'business',
        'operationsManager': 'business',
        'entrepreneur': 'business',
        
        // ===== BUSINESS - NEW (1) =====
        'supplyChainAnalyst': 'business',
        
        // Engineering (3)
        'engineering': 'engineering',
        'automobileEngineer': 'engineering',
        'miningEngineer': 'engineering',
        
        // ===== ENGINEERING - NEW (5) =====
        'civilEngineer': 'engineering',
        'mechanicalEngineer': 'engineering',
        'electricalEngineer': 'engineering',
        'telecommunicationsEngineer': 'engineering',
        'quantitySurveyor': 'engineering',
        
        // Finance (4)
        'financeAnalyst': 'finance',
        'financialAdvisor': 'finance',
        'accountant': 'finance',
        'banker': 'finance',
        
        // Design (4)
        'designer': 'design',
        'graphicDesigner': 'design',
        'uiux': 'design',
        'contentCreator': 'media',
        
        // Sales/Marketing (6)
        'sales': 'sales',
        'marketing': 'marketing',
        'digitalMarketing': 'marketing',
        'seo': 'marketing',
        'performanceMarketer': 'marketing',
        'customerSupportSpecialist': 'customer service',
        
        // ===== SALES - NEW (1) =====
        'medicalSalesRepresentative': 'sales',
        
        // Legal (1)
        'law': 'legal',
        
        // Social (2)
        'socialSciences': 'social',
        'hr': 'human resources',
        
        // Science (1)
        'naturalSciences': 'science',
        
        // Arts (1)
        'arts': 'arts',
        
        // Hospitality (5)
        'renewable': 'energy',
        'solar': 'energy',
        'wind': 'energy',
        'electrician': 'construction',
        'plumber': 'construction',
        
        // ===== HOSPITALITY - NEW (1) =====
        'chef': 'hospitality',
        
        // ===== VOCATIONAL - NEW (10) =====
        'electricalTechnician': 'construction',
        'cncOperator': 'manufacturing',
        'welder': 'manufacturing',
        'machineOperator': 'manufacturing',
        'stitchingMachineOperator': 'manufacturing',
        'mason': 'construction',
        'civilTechnician': 'construction',
        'autoMechanic': 'automotive',
        'hvacTechnician': 'construction',
        'agriculturalTechnician': 'agriculture',
        
        // Aviation (1)
        'pilot': 'aviation',
        
        // Defense (1)
        'army': 'defense',
        
        // Freelance (1)
        'freelancer': 'freelance'
    };
    return industries[profession] || 'professional';
};

// ============================================
// HELPER: Get Profession Display Name (100+ Professions)
// ============================================
export const getProfessionDisplayName = (profession: string): string => {
    const map: Record<string, string> = {
        // Medical/Healthcare (13)
        'doctor': 'Medical',
        'physiotherapist': 'Physiotherapy',
        'nutritionist': 'Nutrition',
        'medicalLabTechnologist': 'Medical Laboratory',
        'radiologyTechnologist': 'Radiology',
        'occupationalTherapist': 'Occupational Therapy',
        'speechTherapist': 'Speech Therapy',
        'optometrist': 'Optometry',
        'veterinaryDoctor': 'Veterinary Medicine',
        'healthcareAdministrator': 'Healthcare Administration',
        'nurse': 'Nursing',
        'dentist': 'Dentistry',
        'pharmacist': 'Pharmacy',
        
        // ===== MEDICAL - NEW (3) =====
        'paramedic': 'Paramedicine',
        'medicalTechnician': 'Medical Technology',
        'physicianAssistant': 'Physician Assistance',
        
        // Technology/IT (17)
        'developer': 'Software Development',
        'softwareEngineer': 'Software Engineering',
        'aiResearchEngineer': 'AI Research',
        'embeddedSystemsEngineer': 'Embedded Systems',
        'databaseAdministrator': 'Database Administration',
        'mechatronicsEngineer': 'Mechatronics Engineering',
        'dataScientist': 'Data Science',
        'cybersecurity': 'Cybersecurity',
        'cloud': 'Cloud Engineering',
        'devops': 'DevOps',
        'frontend': 'Frontend Development',
        'backend': 'Backend Development',
        'fullStack': 'Full Stack Development',
        'aiMl': 'AI/ML Engineering',
        'gameDeveloper': 'Game Development',
        'itSupport': 'IT Support',
        'productManager': 'Product Management',
        
        // ===== TECHNOLOGY - NEW (3) =====
        'qaEngineer': 'Quality Assurance',
        'dataEngineer': 'Data Engineering',
        'computerOperator': 'Computer Operations',
        
        // Education (12)
        'teacher': 'Teaching',
        'professor': 'Academics',
        'physicsTeacher': 'Physics Teaching',
        'chemistryTeacher': 'Chemistry Teaching',
        'mathTeacher': 'Mathematics Teaching',
        'biologyTeacher': 'Biology Teaching',
        'englishTeacher': 'English Teaching',
        'urduTeacher': 'Urdu Teaching',
        'computerTeacher': 'Computer Teaching',
        'islamicStudiesTeacher': 'Islamic Studies',
        'pakistanStudiesTeacher': 'Pakistan Studies',
        'historyTeacher': 'History Teaching',
        
        // ===== EDUCATION - NEW (1) =====
        'lecturer': 'Lecturing',
        
        // Business (6)
        'business': 'Business',
        'businessAnalyst': 'Business Analysis',
        'businessDevelopmentExecutive': 'Business Development',
        'projectManager': 'Project Management',
        'operationsManager': 'Operations Management',
        'entrepreneur': 'Entrepreneurship',
        
        // ===== BUSINESS - NEW (1) =====
        'supplyChainAnalyst': 'Supply Chain Analytics',
        
        // Engineering (3)
        'engineering': 'Engineering',
        'automobileEngineer': 'Automobile Engineering',
        'miningEngineer': 'Mining Engineering',
        
        // ===== ENGINEERING - NEW (5) =====
        'civilEngineer': 'Civil Engineering',
        'mechanicalEngineer': 'Mechanical Engineering',
        'electricalEngineer': 'Electrical Engineering',
        'telecommunicationsEngineer': 'Telecommunications Engineering',
        'quantitySurveyor': 'Quantity Surveying',
        
        // Finance (4)
        'financeAnalyst': 'Finance',
        'financialAdvisor': 'Financial Advisory',
        'accountant': 'Accounting',
        'banker': 'Banking',
        
        // Design (4)
        'designer': 'Design',
        'graphicDesigner': 'Graphic Design',
        'uiux': 'UI/UX Design',
        'contentCreator': 'Content Creation',
        
        // Sales/Marketing (6)
        'sales': 'Sales',
        'marketing': 'Marketing',
        'digitalMarketing': 'Digital Marketing',
        'seo': 'SEO',
        'performanceMarketer': 'Performance Marketing',
        'customerSupportSpecialist': 'Customer Support',
        
        // ===== SALES - NEW (1) =====
        'medicalSalesRepresentative': 'Medical Sales',
        
        // Legal (1)
        'law': 'Law',
        
        // Social (2)
        'socialSciences': 'Social Sciences',
        'hr': 'Human Resources',
        
        // Science (1)
        'naturalSciences': 'Natural Sciences',
        
        // Arts (1)
        'arts': 'Arts',
        
        // Hospitality (5)
        'renewable': 'Renewable Energy',
        'solar': 'Solar Energy',
        'wind': 'Wind Energy',
        'electrician': 'Electrical',
        'plumber': 'Plumbing',
        
        // ===== HOSPITALITY - NEW (1) =====
        'chef': 'Culinary Arts',
        
        // ===== VOCATIONAL - NEW (10) =====
        'electricalTechnician': 'Electrical Technology',
        'cncOperator': 'CNC Machining',
        'welder': 'Welding',
        'machineOperator': 'Machine Operations',
        'stitchingMachineOperator': 'Garment Manufacturing',
        'mason': 'Masonry',
        'civilTechnician': 'Civil Technology',
        'autoMechanic': 'Automotive Mechanics',
        'hvacTechnician': 'HVAC Technology',
        'agriculturalTechnician': 'Agricultural Technology',
        
        // Aviation (1)
        'pilot': 'Aviation',
        
        // Defense (1)
        'army': 'Defense',
        
        // Freelance (1)
        'freelancer': 'Freelancing'
    };
    return map[profession] || profession;
};

// ============================================
// HELPER: Get Profession Category (for fresher templates)
// ============================================
export const getProfessionCategory = (profession: string): string => {
    // ===== MEDICAL (16) =====
    const medical = [
        'doctor', 'physiotherapist', 'nutritionist', 'medicalLabTechnologist',
        'radiologyTechnologist', 'occupationalTherapist', 'speechTherapist',
        'optometrist', 'veterinaryDoctor', 'healthcareAdministrator',
        'nurse', 'dentist', 'pharmacist',
        'paramedic', 'medicalTechnician', 'physicianAssistant'
    ];
    
    // ===== TECHNOLOGY (20) =====
    const technology = [
        'developer', 'softwareEngineer', 'aiResearchEngineer',
        'embeddedSystemsEngineer', 'databaseAdministrator', 'mechatronicsEngineer',
        'dataScientist', 'cybersecurity', 'cloud', 'devops', 'frontend',
        'backend', 'fullStack', 'aiMl', 'gameDeveloper', 'itSupport',
        'productManager', 'qaEngineer', 'dataEngineer', 'computerOperator'
    ];
    
    // ===== EDUCATION (13) =====
    const education = [
        'teacher', 'professor', 'lecturer',
        'physicsTeacher', 'chemistryTeacher',
        'mathTeacher', 'biologyTeacher', 'englishTeacher',
        'urduTeacher', 'computerTeacher',
        'islamicStudiesTeacher', 'pakistanStudiesTeacher',
        'historyTeacher'
    ];
    
    // ===== BUSINESS (7) =====
    const business = [
        'business', 'businessAnalyst', 'businessDevelopmentExecutive',
        'projectManager', 'operationsManager', 'entrepreneur',
        'supplyChainAnalyst'
    ];
    
    // ===== ENGINEERING (8) =====
    const engineering = [
        'engineering', 'automobileEngineer', 'miningEngineer',
        'civilEngineer', 'mechanicalEngineer', 'electricalEngineer',
        'telecommunicationsEngineer', 'quantitySurveyor'
    ];
    
    // ===== FINANCE (4) =====
    const finance = ['financeAnalyst', 'financialAdvisor', 'accountant', 'banker'];
    
    // ===== DESIGN (4) =====
    const design = ['designer', 'graphicDesigner', 'uiux', 'contentCreator'];
    
    // ===== SALES (6) =====
    const sales = ['sales', 'marketing', 'digitalMarketing', 'seo', 'performanceMarketer', 'medicalSalesRepresentative'];
    
    // ===== SUPPORT (1) =====
    const customerSupport = ['customerSupportSpecialist'];
    
    // ===== LEGAL (1) =====
    const legal = ['law'];
    
    // ===== SOCIAL (2) =====
    const social = ['socialSciences', 'hr'];
    
    // ===== SCIENCE (1) =====
    const science = ['naturalSciences'];
    
    // ===== ARTS (1) =====
    const arts = ['arts'];
    
    // ===== HOSPITALITY (6) =====
    const hospitality = ['renewable', 'solar', 'wind', 'electrician', 'plumber', 'chef'];
    
    // ===== VOCATIONAL (10) =====
    const vocational = [
        'electricalTechnician', 'cncOperator', 'welder', 'machineOperator',
        'stitchingMachineOperator', 'mason', 'civilTechnician', 'autoMechanic',
        'hvacTechnician', 'agriculturalTechnician'
    ];
    
    // ===== AVIATION (1) =====
    const aviation = ['pilot'];
    
    // ===== DEFENSE (1) =====
    const defense = ['army'];
    
    // ===== FREELANCE (1) =====
    const freelance = ['freelancer'];
    
    // ============================================
    // CHECK CATEGORIES - ORDER MATTERS!
    // ============================================
    if (medical.includes(profession)) return 'medical';
    if (technology.includes(profession)) return 'technology';
    if (education.includes(profession)) return 'education';
    if (business.includes(profession)) return 'business';
    if (engineering.includes(profession)) return 'engineering';
    if (finance.includes(profession)) return 'finance';
    if (design.includes(profession)) return 'design';
    if (sales.includes(profession)) return 'sales';
    if (customerSupport.includes(profession)) return 'customerSupport';
    if (legal.includes(profession)) return 'legal';
    if (social.includes(profession)) return 'social';
    if (science.includes(profession)) return 'science';
    if (arts.includes(profession)) return 'arts';
    if (hospitality.includes(profession)) return 'hospitality';
    if (vocational.includes(profession)) return 'vocational';
    if (aviation.includes(profession)) return 'aviation';
    if (defense.includes(profession)) return 'defense';
    if (freelance.includes(profession)) return 'general';
    
    return 'general';
};