// utils/skills-suggester/index.ts
// ============================================
// SKILLS SUGGESTER - MAIN EXPORT (PRODUCTION)
// Normalization + Aliases + Fuzzy Matching
// ============================================

import { medicalSkills } from './medical';
import { itSkills } from './it';
import { businessSkills } from './business';
import { engineeringSkills } from './engineering';
import { educationSkills } from './education';
import { financeSkills } from './finance';
import { salesSkills } from './sales';
import { designSkills } from './design';
import { legalSkills } from './legal';
import { socialSciencesSkills } from './social-sciences';
import { naturalSciencesSkills } from './natural-sciences';
import { artsSkills } from './arts';
import { aviationSkills } from './aviation';
import { vocationalSkills } from './vocational';
import { renewableSkills } from './renewable';
import { hospitalitySkills } from './hospitality';
import { realEstateSkills } from './real-estate';
import { officeAdminSkills } from './office-admin';
import { safetySecuritySkills } from './safety-security';
import { hrSkills } from './hr';
import { freelancerSkills } from './freelancer';
import { generalSkills } from './general';

// ============================================
// COMBINE ALL SKILLS
// ============================================
export const allSkills: Record<string, string[]> = {
    ...medicalSkills,
    ...itSkills,
    ...businessSkills,
    ...engineeringSkills,
    ...educationSkills,
    ...financeSkills,
    ...salesSkills,
    ...designSkills,
    ...legalSkills,
    ...socialSciencesSkills,
    ...naturalSciencesSkills,
    ...artsSkills,
    ...aviationSkills,
    ...vocationalSkills,
    ...renewableSkills,
    ...hospitalitySkills,
    ...realEstateSkills,
    ...officeAdminSkills,
    ...safetySecuritySkills,
    ...hrSkills,
    ...freelancerSkills,
    ...generalSkills
};

// ============================================
// LAYER 1: NORMALIZATION
// ============================================
const normalize = (str: string): string => {
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

const stripSuffixes = (str: string): string => {
    return str
        .replace(/pool$/i, '')
        .replace(/job$/i, '')
        .replace(/profession$/i, '')
        .replace(/role$/i, '')
        .replace(/position$/i, '')
        .replace(/work$/i, '');
};

// ============================================
// LAYER 2: BUILD NORMALIZED LOOKUP MAP
// ============================================
const normalizedMap: Map<string, string> = new Map();

for (const key of Object.keys(allSkills)) {
    const normKey = normalize(key);
    if (!normalizedMap.has(normKey)) {
        normalizedMap.set(normKey, key);
    }
}

// ============================================
// LAYER 3: ALIASES
// ============================================
const aliases: Record<string, string> = {
    // ---------- IT ----------
    'frontenddeveloper': 'frontend',
    'frontenddev': 'frontend',
    'frontendengineer': 'frontend',
    'reactdeveloper': 'frontend',
    'reactjsdeveloper': 'frontend',
    'backenddeveloper': 'backend',
    'backenddev': 'backend',
    'backendengineer': 'backend',
    'nodejsdeveloper': 'backend',
    'fullstackdeveloper': 'full-stack',
    'fullstackdev': 'full-stack',
    'fullstackengineer': 'full-stack',
    'mernstack': 'full-stack',
    'meanstack': 'full-stack',
    'cloudengineer': 'cloud',
    'cloudarchitect': 'cloud',
    'awsengineer': 'cloud',
    'azureengineer': 'cloud',
    'gcpengineer': 'cloud',
    'qaengineer': 'qa',
    'qatester': 'qa',
    'qualityassurance': 'qa',
    'testengineer': 'qa',
    'softwaretester': 'software-tester',
    'webdeveloper': 'web',
    'webdev': 'web',
    'webengineer': 'web',
    'mobiledeveloper': 'mobile',
    'mobiledev': 'mobile',
    'androiddeveloper': 'mobile',
    'iosdeveloper': 'mobile',
    'reactnativedeveloper': 'mobile',
    'flutterdeveloper': 'mobile',
    'blockchaindeveloper': 'blockchain-developer',
    'blockchainengineer': 'blockchain-developer',
    'smartcontractdeveloper': 'blockchain-developer',
    'web3developer': 'blockchain-developer',
    'soliditydeveloper': 'blockchain-developer',
    'salesforcedeveloper': 'salesforce-developer',
    'salesforceadmin': 'salesforce-developer',
    'salesforceengineer': 'salesforce-developer',
    'aimlengineer': 'ai-ml',
    'aiml': 'ai-ml',
    'machinelearningengineer': 'ai-ml',
    'mlengineer': 'ai-ml',
    'deeplearningengineer': 'ai-ml',
    'datascientistml': 'ai-ml',
    'airesearchengineer': 'ai-research-engineer',
    'airesearcher': 'ai-research-engineer',
    'itsupport': 'it-support',
    'itsupportengineer': 'it-support',
    'helpdesk': 'it-support',
    'technicalsupport': 'it-support',
    'itsupportspecialist': 'it-support',
    'datascientist': 'data-scientist',
    'datascience': 'data-scientist',
    'dataanalyst': 'data-analyst',
    'dataanalysis': 'data-analyst',
    'dataengineer': 'data-engineer',
    'dataengineering': 'data-engineer',
    'databaseadministrator': 'database-administrator',
    'dba': 'database-administrator',
    'databaseadmin': 'database-administrator',
    'cybersecurityengineer': 'cybersecurity',
    'securityengineer': 'cybersecurity',
    'infosec': 'cybersecurity',
    'cybersecurityanalyst': 'cybersecurity',
    'securityanalyst': 'cybersecurity',
    'devopsengineer': 'devops',
    'devops': 'devops',
    'sre': 'devops',
    'gamedeveloper': 'game-developer',
    'gamedev': 'game-developer',
    'unitydeveloper': 'game-developer',
    'unrealdeveloper': 'game-developer',
    'embeddedsystemsengineer': 'embedded-systems-engineer',
    'embeddedengineer': 'embedded-systems-engineer',
    'embeddeddeveloper': 'embedded-systems-engineer',
    'firmwareengineer': 'embedded-systems-engineer',
    'systemadministrator': 'system-administrator',
    'sysadmin': 'system-administrator',
    'networkengineer': 'network-engineer',
    'networkadmin': 'network-engineer',
    'networkadministrator': 'network-engineer',
    'softwarearchitect': 'software-architect',
    'solutionsarchitect': 'software-architect',
    'systemarchitect': 'software-architect',
    'softwareengineer': 'software-engineer',
    'swe': 'software-engineer',
    'softwaredeveloper': 'developer',
    'programmer': 'computer-programmer',
    'coder': 'developer',
    'developer': 'developer',
    
    // ---------- EDUCATION ----------
    'schoolteacher': 'teacher',
    'educator': 'teacher',
    'instructor': 'teacher',
    'universityprofessor': 'professor',
    'collegelecturer': 'lecturer',
    'schoolprincipal': 'principal',
    'headmaster': 'principal',
    'headmistress': 'principal',
    'physicsprofessor': 'physics-teacher',
    'chemistryprofessor': 'chemistry-teacher',
    'mathprofessor': 'math-teacher',
    'mathsteacher': 'math-teacher',
    'englishteacher': 'english-teacher',
    'islamicstudiesteacher': 'islamic-studies-teacher',
    'pakistanstudiesteacher': 'pakistan-studies-teacher',
    'specialeducationteacher': 'special-education-teacher',
    'specialedteacher': 'special-education-teacher',
    'schoolcounselor': 'school-counselor',
    'guidancecounselor': 'school-counselor',
    
    // ---------- ENGINEERING ----------
    'civilengineer': 'civil-engineer',
    'civil': 'civil-engineer',
    'structuralengineer': 'structural-engineer',
    'structural': 'structural-engineer',
    'electricalengineer': 'electrical-engineer',
    'electrical': 'electrical-engineer',
    'ee': 'electrical-engineer',
    'mechanicalengineer': 'mechanical-engineer',
    'mechanical': 'mechanical-engineer',
    'me': 'mechanical-engineer',
    'chemicalengineer': 'chemical-engineer',
    'chemical': 'chemical-engineer',
    'industrialengineer': 'industrial-engineer',
    'industrial': 'industrial-engineer',
    'petroleumengineer': 'petroleum-engineer',
    'petroleum': 'petroleum-engineer',
    'oilgasengineer': 'petroleum-engineer',
    'architect': 'architect',
    'architecture': 'architect',
    'architecturalengineer': 'architect',
    'environmentalengineer': 'environmental-engineer',
    'environmental': 'environmental-engineer',
    'biomedicalengineer': 'biomedical-engineer',
    'biomedical': 'biomedical-engineer',
    'bme': 'biomedical-engineer',
    'roboticsengineer': 'robotics-engineer',
    'robotics': 'robotics-engineer',
    'automobileengineer': 'automobile-engineer',
    'automotiveengineer': 'automobile-engineer',
    'autoengineer': 'automobile-engineer',
    'miningengineer': 'mining-engineer',
    'mining': 'mining-engineer',
    'telecommunicationsengineer': 'telecommunications-engineer',
    'telecomengineer': 'telecommunications-engineer',
    'telecom': 'telecommunications-engineer',
    'quantitysurveyor': 'quantity-surveyor',
    'qs': 'quantity-surveyor',
    'mechatronicsengineer': 'mechatronics-engineer',
    'mechatronics': 'mechatronics-engineer',
    'engineer': 'engineering',
    'engineering': 'engineering',
    
    // ---------- MEDICAL ----------
    'physician': 'doctor',
    'md': 'doctor',
    'generalphysician': 'doctor',
    'medicaldoctor': 'doctor',
    'nursing': 'nurse',
    'registerednurse': 'nurse',
    'rn': 'nurse',
    'dental': 'dentist',
    'dentaldoctor': 'dentist',
    'pharmacy': 'pharmacist',
    'radiology': 'radiologist',
    'cardiology': 'cardiologist',
    'heartdoctor': 'cardiologist',
    'pediatrics': 'pediatrician',
    'childdoctor': 'pediatrician',
    'gynecology': 'gynecologist',
    'obgyn': 'gynecologist',
    'psychiatry': 'psychiatrist',
    'psychology': 'psychologist',
    'physio': 'physiotherapist',
    'physicaltherapist': 'physical-therapist',
    'pt': 'physical-therapist',
    'nutrition': 'nutritionist',
    'emt': 'emergency-medical-technician',
    'veterinarian': 'veterinary-doctor',
    'vet': 'veterinary-doctor',
    'veterinary': 'veterinary-doctor',
    'medicaltechnologist': 'medical-technologist',
    'medicallabtechnologist': 'medical-lab-technologist',
    'radiologytechnologist': 'radiology-technologist',
    'occupationaltherapist': 'occupational-therapist',
    'speechtherapist': 'speech-therapist',
    'healthcareadministrator': 'healthcare-administrator',
    'medicaltechnician': 'medical-technician',
    'physicianassistant': 'physician-assistant',
    'medicalsalesrepresentative': 'medical-sales-representative',
    'dentalassistant': 'dental-assistant',
    'dentaltechnician': 'dental-technician',
    'labassistant': 'lab-assistant',
    'medicalassistant': 'medical-assistant',
    'medicalcoder': 'medical-coder',
    'midwife': 'midwife',
    'publichealthofficer': 'public-health-officer',
    
    // ---------- BUSINESS ----------
    'businessman': 'business',
    'projectmanager': 'project-manager',
    'pm': 'project-manager',
    'productmanager': 'product-manager',
    'productowner': 'product-manager',
    'operationsmanager': 'operations-manager',
    'opsmanager': 'operations-manager',
    'entrepreneur': 'entrepreneur',
    'founder': 'entrepreneur',
    'startupfounder': 'entrepreneur',
    'businessanalyst': 'business-analyst',
    'ba': 'business-analyst',
    'businessconsultant': 'consultant',
    'supplychain': 'supply-chain',
    'supplychainmanager': 'supply-chain-manager',
    'supplychainanalyst': 'supply-chain-analyst',
    'procurementofficer': 'procurement-officer',
    'procurement': 'procurement-officer',
    'logisticsmanager': 'logistics-manager',
    'logistics': 'logistics-manager',
    'businessdevelopmentexecutive': 'business-development-executive',
    'bde': 'business-development-executive',
    'bdr': 'business-development-executive',
    'sdr': 'business-development-executive',
    
    // ---------- FINANCE ----------
    'accounting': 'accountant',
    'cpa': 'accountant',
    'banking': 'banker',
    'bankmanager': 'banker',
    'investmentbanker': 'investment-banker',
    'ib': 'investment-banker',
    'financeanalyst': 'finance-analyst',
    'financialanalyst': 'financial-analyst',
    'financialadvisor': 'financial-advisor',
    'financialplanner': 'financial-advisor',
    'fa': 'financial-analyst',
    'audit': 'auditor',
    'taxconsultant': 'tax-consultant',
    'taxadvisor': 'tax-consultant',
    'tax': 'tax-consultant',
    'creditanalyst': 'credit-analyst',
    'credit': 'credit-analyst',
    'treasurymanager': 'treasury-manager',
    'treasury': 'treasury-manager',
    'financialtechnology': 'fintech',
    'riskmanager': 'risk-manager',
    'risk': 'risk-manager',
    'riskanalyst': 'risk-manager',
    
    // ---------- SALES & MARKETING ----------
    'salesman': 'sales',
    'salesperson': 'sales',
    'salesrep': 'sales',
    'salesrepresentative': 'sales',
    'marketer': 'marketing',
    'marketingmanager': 'marketing',
    'digitalmarketing': 'digital-marketing',
    'digitalmarketer': 'digital-marketing',
    'digitalmarketingspecialist': 'digital-marketing',
    'seospecialist': 'seo',
    'seoexpert': 'seo',
    'seoanalyst': 'seo',
    'performancemarketer': 'performance-marketer',
    'performancemarketing': 'performance-marketer',
    'ppcspecialist': 'performance-marketer',
    'contentcreator': 'content-creator',
    'contentwriter': 'content-creator',
    'youtuber': 'content-creator',
    'blogger': 'content-creator',
    'copywriting': 'copywriter',
    'reporter': 'journalist',
    'newsreporter': 'journalist',
    'prspecialist': 'pr-specialist',
    'publicrelations': 'pr-specialist',
    'pr': 'pr-specialist',
    'customersupportspecialist': 'customer-support-specialist',
    'customersupport': 'customer-support-specialist',
    'customerservice': 'customer-support-specialist',
    'csr': 'customer-support-specialist',
    
    // ---------- DESIGN ----------
    'graphicdesigner': 'graphic-designer',
    'graphicdesign': 'graphic-designer',
    'uiuxdesigner': 'ui-ux',
    'uiux': 'ui-ux',
    'uidesigner': 'ui-ux',
    'uxdesigner': 'ui-ux',
    'productdesigner': 'ui-ux',
    'illustration': 'illustrator',
    'animation': 'animator',
    'videoeditor': 'video-editor',
    'videoediting': 'video-editor',
    'photography': 'photographer',
    'motiondesigner': 'motion-designer',
    'motiongraphics': 'motion-designer',
    '3dartist': '3d-artist',
    '3ddesigner': '3d-artist',
    '3dmodeler': '3d-artist',
    
    // ---------- LEGAL ----------
    'attorney': 'attorney',
    'advocate': 'advocate',
    'barrister': 'barrister',
    'legaladvisor': 'legal-advisor',
    'judge': 'judge',
    
    // ---------- AVIATION ----------
    'airlinepilot': 'pilot',
    'captain': 'pilot',
    'airtrafficcontroller': 'air-traffic-controller',
    'atc': 'air-traffic-controller',
    'armyofficer': 'army-officer',
    'army': 'army-officer',
    'soldier': 'army-officer',
    'navyofficer': 'navy-officer',
    'navy': 'navy-officer',
    'airforceofficer': 'air-force-officer',
    'airforce': 'air-force-officer',
    'policeofficer': 'police-officer',
    'police': 'police-officer',
    'cop': 'police-officer',
    'fireman': 'firefighter',
    
    // ---------- HOSPITALITY ----------
    'cook': 'chef',
    'headchef': 'chef',
    'hotelmanagement': 'hotel-manager',
    'eventmanager': 'event-planner',
    'receptionist': 'hotel-receptionist',
    'housekeeping': 'housekeeping-supervisor',
    'touroperator': 'tourism-officer',
    'tourism': 'tourism-officer',
    'travelagent': 'travel-consultant',
    'callcenter': 'call-center-agent',
    
    // ---------- REAL ESTATE ----------
    'realestateagent': 'real-estate-agent',
    'realtor': 'real-estate-agent',
    'realestate': 'real-estate-agent',
    'propertydealer': 'real-estate-agent',
    'insuranceagent': 'insurance-agent',
    'insurance': 'insurance-agent',
    
    // ---------- VOCATIONAL ----------
    'constructionworker': 'construction-worker',
    'construction': 'construction-worker',
    'cncoperator': 'cnc-operator',
    'machineoperator': 'machine-operator',
    'computeroperator': 'computer-operator',
    'electricaltechnician': 'electrical-technician',
    'stitchingmachineoperator': 'stitching-machine-operator',
    'civiltechnician': 'civil-technician',
    'automechanic': 'auto-mechanic',
    'mechanic': 'auto-mechanic',
    'hvactechnician': 'hvac-technician',
    'hvac': 'hvac-technician',
    'agriculturaltechnician': 'agricultural-technician',
    
    // ---------- RENEWABLE ----------
    'renewableenergyengineer': 'energy-engineer',
    'renewableenergy': 'renewable',
    'solarenergy': 'renewable',
    'windenergy': 'renewable',
    'solarpvinstaller': 'solar-installer',
    'solarinstaller': 'solar-installer',
    'solartechnician': 'solar-technician',
    'windturbinetechnician': 'wind-turbine-technician',
    'windtechnician': 'wind-turbine-technician',
    'energyengineer': 'energy-engineer',
    
    // ---------- SAFETY & SECURITY ----------
    'safetyofficer': 'safety-officer',
    'safety': 'safety-officer',
    'hseofficer': 'hse-officer',
    'hse': 'hse-officer',
    'foodsafetyofficer': 'food-safety-officer',
    'foodsafety': 'food-safety-officer',
    'securityguard': 'security-guard',
    'guard': 'security-guard',
    'securityofficer': 'security-officer',
    'security': 'security-officer',
    
    // ---------- HR ----------
    'humanresources': 'hr',
    'hrmanager': 'hr',
    'recruiter': 'hr',
    
    // ---------- FREELANCER ----------
    'freelance': 'freelancer',
    'selfemployed': 'freelancer',
    
    // ---------- OFFICE ADMIN ----------
    'officeassistant': 'office-assistant',
    'adminassistant': 'office-assistant',
    'administrativeassistant': 'office-assistant',
    'dataentryoperator': 'data-entry-operator',
    'dataentry': 'data-entry-operator',
    'warehousemanager': 'warehouse-manager',
    'warehousesupervisor': 'warehouse-supervisor',
    'logisticscoordinator': 'logistics-coordinator',
    'freightforwarder': 'freight-forwarder',
    
    // ---------- SOCIAL SCIENCES ----------
    'socialsciences': 'social-sciences',
    'socialworker': 'social-worker',
    'politicalscientist': 'political-scientist',
    
    // ---------- NATURAL SCIENCES ----------
    'naturalsciences': 'natural-sciences',
    
    // ---------- ARTS ----------
    'journalism': 'journalism',
    
    // ---------- GENERAL ----------
    'other': 'general',
    'any': 'general',
    'none': 'general',
};

// ============================================
// LAYER 4: LEVENSHTEIN DISTANCE (FUZZY)
// ============================================
const levenshtein = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const similarity = (a: string, b: string): number => {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    return 1 - levenshtein(a, b) / maxLen;
};

const fuzzyMatch = (input: string, threshold = 0.75): string | null => {
    if (input.length < 4) return null;

    let bestKey: string | null = null;
    let bestScore = 0;

    for (const key of normalizedMap.keys()) {
        if (Math.abs(key.length - input.length) > 4) continue;
        const score = similarity(input, key);
        if (score > bestScore) {
            bestScore = score;
            bestKey = key;
        }
    }

    return bestScore >= threshold ? bestKey : null;
};

// ============================================
// MAIN LOOKUP FUNCTION
// ============================================

export interface SkillMatchResult {
    skills: string[];
    matchedKey: string | null;
    matchType: 'exact' | 'normalized' | 'alias' | 'fuzzy' | 'fallback';
    confidence: number;
}

export const matchProfession = (profession: string): SkillMatchResult => {
    const fallback: SkillMatchResult = {
        skills: allSkills['general'] || [],
        matchedKey: null,
        matchType: 'fallback',
        confidence: 0
    };

    if (!profession || typeof profession !== 'string') return fallback;

    const trimmed = profession.trim();
    if (!trimmed) return fallback;

    // 1. EXACT
    if (allSkills[trimmed]) {
        return {
            skills: allSkills[trimmed],
            matchedKey: trimmed,
            matchType: 'exact',
            confidence: 1
        };
    }

    // 2. EXACT without "Pool"
    const withoutPool = trimmed.replace(/pool$/i, '');
    if (allSkills[withoutPool]) {
        return {
            skills: allSkills[withoutPool],
            matchedKey: withoutPool,
            matchType: 'exact',
            confidence: 1
        };
    }

    // 3. NORMALIZED
    const norm = normalize(trimmed);
    if (normalizedMap.has(norm)) {
        const key = normalizedMap.get(norm)!;
        return {
            skills: allSkills[key],
            matchedKey: key,
            matchType: 'normalized',
            confidence: 1
        };
    }

    // 4. NORMALIZED without suffix
    const normNoSuffix = normalize(stripSuffixes(trimmed));
    if (normalizedMap.has(normNoSuffix)) {
        const key = normalizedMap.get(normNoSuffix)!;
        return {
            skills: allSkills[key],
            matchedKey: key,
            matchType: 'normalized',
            confidence: 1
        };
    }

    // 5. ALIAS (exact trimmed)
    if (aliases[trimmed]) {
        const key = aliases[trimmed];
        return {
            skills: allSkills[key] || allSkills['general'],
            matchedKey: key,
            matchType: 'alias',
            confidence: 0.95
        };
    }

    // 6. ALIAS (normalized)
    if (aliases[norm]) {
        const key = aliases[norm];
        return {
            skills: allSkills[key] || allSkills['general'],
            matchedKey: key,
            matchType: 'alias',
            confidence: 0.95
        };
    }

    // 7. ALIAS (normalized no suffix)
    if (aliases[normNoSuffix]) {
        const key = aliases[normNoSuffix];
        return {
            skills: allSkills[key] || allSkills['general'],
            matchedKey: key,
            matchType: 'alias',
            confidence: 0.95
        };
    }

    // 8. FUZZY
    const fuzzyKey = fuzzyMatch(norm, 0.75);
    if (fuzzyKey && normalizedMap.has(fuzzyKey)) {
        const key = normalizedMap.get(fuzzyKey)!;
        const score = similarity(norm, fuzzyKey);
        return {
            skills: allSkills[key],
            matchedKey: key,
            matchType: 'fuzzy',
            confidence: score
        };
    }

    // 9. FALLBACK
    return fallback;
};

export const getSkillsForProfession = (profession: string): string[] => {
    return matchProfession(profession).skills;
};

// ============================================
// CATEGORY EXPORTS
// ============================================
export {
    medicalSkills,
    itSkills,
    businessSkills,
    engineeringSkills,
    educationSkills,
    financeSkills,
    salesSkills,
    designSkills,
    legalSkills,
    socialSciencesSkills,
    naturalSciencesSkills,
    artsSkills,
    aviationSkills,
    vocationalSkills,
    renewableSkills,
    hospitalitySkills,
    realEstateSkills,
    officeAdminSkills,
    safetySecuritySkills,
    hrSkills,
    freelancerSkills,
    generalSkills
};