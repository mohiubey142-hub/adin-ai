// utils/skills-suggester/skillsResolver.ts
// ============================================
// SKILLS RESOLVER — CENTRAL BRIDGE
// ============================================
// Yeh file 22 skills files ko merge karti hai
// aur user ke job title se skills dhoondti hai.
//
// NAYA PROFESSION ADD KARNE KE LIYE:
//   1. Neeche ALIASES object mein 1 line add karo
//   YA
//   2. 22 files mein se kisi ek mein naya key add karo
//      (aur ALIASES mein uska natural name map karo)
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
// STEP 1: MERGE ALL 22 FILES
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
// STEP 2: NORMALIZATION HELPERS
// ============================================

/**
 * "Front-End Developer!" → "frontenddeveloper"
 */
const normalize = (s: string): string =>
    s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

/**
 * "civilEngineerPool" → "civilengineer"
 */
const stripSuffixes = (s: string): string =>
    s.replace(/pool$/i, '')
     .replace(/job$/i, '')
     .replace(/profession$/i, '')
     .replace(/role$/i, '')
     .replace(/position$/i, '')
     .replace(/work$/i, '');

// ============================================
// STEP 3: BUILD NORMALIZED MAP
// ============================================
const normalizedMap = new Map<string, string>();

for (const key of Object.keys(allSkills)) {
    const normKey = normalize(key);
    if (!normalizedMap.has(normKey)) {
        normalizedMap.set(normKey, key);
    }
}

// ============================================
// STEP 4: ALIASES
// ============================================
// YAHAN naye professions ke natural names map karo.
// All keys MUST be normalized (lowercase, no spaces/dashes).
//
// Example: agar user "Frontend Developer" type kare,
// toh ye "frontend" key se map ho jayega.
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

    'qaengineer': 'qa',
    'qatester': 'qa',
    'qualityassurance': 'qa',
    'softwaretester': 'software-tester',

    'webdeveloper': 'web',
    'webdev': 'web',
    'webengineer': 'web',

    'mobiledeveloper': 'mobile',
    'mobiledev': 'mobile',
    'androiddeveloper': 'mobile',
    'iosdeveloper': 'mobile',
    'reactnativedeveloper': 'mobile',

    'blockchaindeveloper': 'blockchain-developer',
    'smartcontractdeveloper': 'blockchain-developer',
    'web3developer': 'blockchain-developer',

    'salesforcedeveloper': 'salesforce-developer',
    'salesforceadmin': 'salesforce-developer',

    'aimlengineer': 'ai-ml',
    'machinelearningengineer': 'ai-ml',
    'mlengineer': 'ai-ml',

    'itsupport': 'it-support',
    'helpdesk': 'it-support',
    'technicalsupport': 'it-support',

    'datascientist': 'data-scientist',
    'dataanalyst': 'data-analyst',
    'dataengineer': 'data-engineer',
    'databaseadministrator': 'database-administrator',
    'dba': 'database-administrator',

    'cybersecurityengineer': 'cybersecurity',
    'securityengineer': 'cybersecurity',
    'infosec': 'cybersecurity',

    'devopsengineer': 'devops',
    'sre': 'devops',

    'gamedeveloper': 'game-developer',
    'gamedev': 'game-developer',

    'embeddedsystemsengineer': 'embedded-systems-engineer',
    'firmwareengineer': 'embedded-systems-engineer',

    'systemadministrator': 'system-administrator',
    'sysadmin': 'system-administrator',

    'networkengineer': 'network-engineer',
    'networkadmin': 'network-engineer',

    'softwarearchitect': 'software-architect',
    'softwareengineer': 'software-engineer',
    'softwaredeveloper': 'developer',
    'programmer': 'computer-programmer',

    // ---------- EDUCATION ----------
    'schoolteacher': 'teacher',
    'educator': 'teacher',
    'instructor': 'teacher',
    'universityprofessor': 'professor',
    'collegelecturer': 'lecturer',
    'schoolprincipal': 'principal',
    'headmaster': 'principal',

    'physicsteacher': 'physics-teacher',
    'chemistryteacher': 'chemistry-teacher',
    'mathteacher': 'math-teacher',
    'mathsteacher': 'math-teacher',
    'biologyteacher': 'biology-teacher',
    'englishteacher': 'english-teacher',
    'urduteacher': 'urdu-teacher',
    'computerteacher': 'computer-teacher',
    'islamicstudiesteacher': 'islamic-studies-teacher',
    'pakistanstudiesteacher': 'pakistan-studies-teacher',
    'historyteacher': 'history-teacher',
    'specialeducationteacher': 'special-education-teacher',
    'schoolcounselor': 'school-counselor',

    // ---------- ENGINEERING ----------
    'civilengineer': 'civil-engineer',
    'civil': 'civil-engineer',
    'structuralengineer': 'structural-engineer',
    'electricalengineer': 'electrical-engineer',
    'mechanicalengineer': 'mechanical-engineer',
    'chemicalengineer': 'chemical-engineer',
    'industrialengineer': 'industrial-engineer',
    'petroleumengineer': 'petroleum-engineer',
    'architect': 'architect',
    'environmentalengineer': 'environmental-engineer',
    'biomedicalengineer': 'biomedical-engineer',
    'roboticsengineer': 'robotics-engineer',
    'automobileengineer': 'automobile-engineer',
    'miningengineer': 'mining-engineer',
    'telecommunicationsengineer': 'telecommunications-engineer',
    'quantitysurveyor': 'quantity-surveyor',
    'mechatronicsengineer': 'mechatronics-engineer',

    // ---------- MEDICAL ----------
    'physician': 'doctor',
    'md': 'doctor',
    'nurse': 'nurse',
    'rn': 'nurse',
    'dentist': 'dentist',
    'pharmacist': 'pharmacist',
    'radiologist': 'radiologist',
    'cardiologist': 'cardiologist',
    'pediatrician': 'pediatrician',
    'gynecologist': 'gynecologist',
    'psychiatrist': 'psychiatrist',
    'psychologist': 'psychologist',
    'physiotherapist': 'physiotherapist',
    'physicaltherapist': 'physical-therapist',
    'nutritionist': 'nutritionist',
    'veterinarian': 'veterinary-doctor',
    'vet': 'veterinary-doctor',

    // ---------- BUSINESS ----------
    'projectmanager': 'project-manager',
    'pm': 'project-manager',
    'productmanager': 'product-manager',
    'productowner': 'product-manager',
    'operationsmanager': 'operations-manager',
    'entrepreneur': 'entrepreneur',
    'founder': 'entrepreneur',
    'businessanalyst': 'business-analyst',
    'consultant': 'consultant',
    'supplychain': 'supply-chain',
    'supplychainmanager': 'supply-chain-manager',
    'supplychainanalyst': 'supply-chain-analyst',
    'procurementofficer': 'procurement-officer',
    'logisticsmanager': 'logistics-manager',
    'businessdevelopmentexecutive': 'business-development-executive',
    'bde': 'business-development-executive',

    // ---------- FINANCE ----------
    'accountant': 'accountant',
    'cpa': 'accountant',
    'banker': 'banker',
    'investmentbanker': 'investment-banker',
    'financialanalyst': 'financial-analyst',
    'financeanalyst': 'finance-analyst',
    'financialadvisor': 'financial-advisor',
    'auditor': 'auditor',
    'taxconsultant': 'tax-consultant',
    'creditanalyst': 'credit-analyst',
    'treasurymanager': 'treasury-manager',
    'riskmanager': 'risk-manager',
    'fintech': 'fintech',

    // ---------- SALES & MARKETING ----------
    'sales': 'sales',
    'salesman': 'sales',
    'salesrepresentative': 'sales',
    'marketing': 'marketing',
    'marketer': 'marketing',
    'digitalmarketing': 'digital-marketing',
    'digitalmarketer': 'digital-marketing',
    'seospecialist': 'seo',
    'seoexpert': 'seo',
    'performancemarketer': 'performance-marketer',
    'contentcreator': 'content-creator',
    'contentwriter': 'content-creator',
    'copywriter': 'copywriter',
    'journalist': 'journalist',
    'reporter': 'journalist',
    'prspecialist': 'pr-specialist',
    'publicrelations': 'pr-specialist',
    'customersupportspecialist': 'customer-support-specialist',
    'customersupport': 'customer-support-specialist',
    'customerservice': 'customer-support-specialist',

    // ---------- DESIGN ----------
    'designer': 'designer',
    'graphicdesigner': 'graphic-designer',
    'uiuxdesigner': 'ui-ux',
    'uiux': 'ui-ux',
    'uidesigner': 'ui-ux',
    'uxdesigner': 'ui-ux',
    'illustrator': 'illustrator',
    'animator': 'animator',
    'videoeditor': 'video-editor',
    'photographer': 'photographer',
    'motiondesigner': 'motion-designer',
    '3dartist': '3d-artist',

    // ---------- LEGAL ----------
    'lawyer': 'lawyer',
    'attorney': 'attorney',
    'advocate': 'advocate',
    'barrister': 'barrister',
    'legaladvisor': 'legal-advisor',
    'judge': 'judge',
    'law': 'law',

    // ---------- AVIATION ----------
    'pilot': 'pilot',
    'airlinepilot': 'pilot',
    'airtrafficcontroller': 'air-traffic-controller',
    'atc': 'air-traffic-controller',
    'armyofficer': 'army-officer',
    'navyofficer': 'navy-officer',
    'airforceofficer': 'air-force-officer',
    'policeofficer': 'police-officer',
    'firefighter': 'firefighter',
    'fireman': 'firefighter',

    // ---------- HOSPITALITY ----------
    'chef': 'chef',
    'cook': 'chef',
    'hotelmanager': 'hotel-manager',
    'eventplanner': 'event-planner',
    'hotelreceptionist': 'hotel-receptionist',
    'receptionist': 'hotel-receptionist',
    'housekeepingsupervisor': 'housekeeping-supervisor',
    'restaurantmanager': 'restaurant-manager',
    'tourism': 'tourism-officer',
    'travelagent': 'travel-consultant',
    'travelconsultant': 'travel-consultant',
    'callcenteragent': 'call-center-agent',

    // ---------- REAL ESTATE ----------
    'realestateagent': 'real-estate-agent',
    'realtor': 'real-estate-agent',
    'propertydealer': 'real-estate-agent',
    'insuranceagent': 'insurance-agent',

    // ---------- VOCATIONAL ----------
    'electrician': 'electrician',
    'plumber': 'plumber',
    'carpenter': 'carpenter',
    'welder': 'welder',
    'mason': 'mason',
    'constructionworker': 'construction-worker',
    'cncoperator': 'cnc-operator',
    'machineoperator': 'machine-operator',
    'computeroperator': 'computer-operator',
    'electricaltechnician': 'electrical-technician',
    'stitchingmachineoperator': 'stitching-machine-operator',
    'tailor': 'tailor',
    'civiltechnician': 'civil-technician',
    'automechanic': 'auto-mechanic',
    'mechanic': 'auto-mechanic',
    'hvactechnician': 'hvac-technician',
    'agriculturaltechnician': 'agricultural-technician',
    'driver': 'driver',
    'productionmanager': 'production-manager',
    'productionsupervisor': 'production-supervisor',
    'qualitycontrolinspector': 'quality-control-inspector',
    'qualitycontrolengineer': 'quality-control-engineer',
    'solartechnician': 'solar-technician',
    'packagingoperator': 'packaging-operator',

    // ---------- RENEWABLE ----------
    'renewableenergyengineer': 'energy-engineer',
    'renewableenergy': 'renewable',
    'solarinstaller': 'solar-installer',
    'solarpvinstaller': 'solar-installer',
    'windturbinetechnician': 'wind-turbine-technician',
    'energyengineer': 'energy-engineer',

    // ---------- SAFETY & SECURITY ----------
    'safetyofficer': 'safety-officer',
    'hseofficer': 'hse-officer',
    'hse': 'hse-officer',
    'foodsafetyofficer': 'food-safety-officer',
    'securityguard': 'security-guard',
    'securityofficer': 'security-officer',

    // ---------- HR ----------
    'hr': 'hr',
    'humanresources': 'hr',
    'hrmanager': 'hr',
    'recruiter': 'hr',

    // ---------- FREELANCER ----------
    'freelancer': 'freelancer',
    'freelance': 'freelancer',

    // ---------- OFFICE ADMIN ----------
    'officeassistant': 'office-assistant',
    'adminassistant': 'office-assistant',
    'dataentryoperator': 'data-entry-operator',
    'dataentry': 'data-entry-operator',
    'cashier': 'cashier',
    'storekeeper': 'storekeeper',
    'warehousemanager': 'warehouse-manager',
    'warehousesupervisor': 'warehouse-supervisor',
    'logisticscoordinator': 'logistics-coordinator',
    'freightforwarder': 'freight-forwarder',

    // ---------- SOCIAL SCIENCES ----------
    'socialsciences': 'social-sciences',
    'sociologist': 'sociologist',
    'economist': 'economist',
    'socialworker': 'social-worker',
    'politicalscientist': 'political-scientist',

    // ---------- NATURAL SCIENCES ----------
    'naturalsciences': 'natural-sciences',
    'physicist': 'physicist',
    'chemist': 'chemist',
    'biologist': 'biologist',
    'microbiologist': 'microbiologist',
    'zoologist': 'zoologist',
    'botanist': 'botanist',

    // ---------- ARTS ----------
    'arts': 'arts',
    'historian': 'historian',
    'philosopher': 'philosopher',
    'linguist': 'linguist',
    'literature': 'literature',
    'journalism': 'journalism',

    // ---------- GENERAL ----------
    'other': 'general',
    'any': 'general',
    'none': 'general'
};

// ============================================
// STEP 5: LEVENSHTEIN (FUZZY)
// ============================================
const levenshtein = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const m: number[][] = [];
    for (let i = 0; i <= b.length; i++) m[i] = [i];
    for (let j = 0; j <= a.length; j++) m[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            m[i][j] = b[i - 1] === a[j - 1]
                ? m[i - 1][j - 1]
                : Math.min(m[i - 1][j - 1], m[i][j - 1], m[i - 1][j]) + 1;
        }
    }
    return m[b.length][a.length];
};

const similarity = (a: string, b: string): number => {
    const maxLen = Math.max(a.length, b.length);
    return maxLen === 0 ? 1 : 1 - levenshtein(a, b) / maxLen;
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
// MAIN FUNCTION — SIRF YEH USE KARO
// ============================================

export interface SkillMatchResult {
    skills: string[];
    matchedKey: string | null;
    matchType: 'exact' | 'normalized' | 'alias' | 'fuzzy' | 'fallback';
    confidence: number;
}

/**
 * Job title do, skills lo.
 * Har tarah ka input handle karta hai.
 */
export const matchProfession = (jobTitle: string): SkillMatchResult => {
    const fallback: SkillMatchResult = {
        skills: allSkills['general'] || [],
        matchedKey: null,
        matchType: 'fallback',
        confidence: 0
    };

    if (!jobTitle || typeof jobTitle !== 'string') return fallback;

    const trimmed = jobTitle.trim();
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

    // 2. EXACT without Pool
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

    // 5. ALIAS exact
    if (aliases[trimmed]) {
        const key = aliases[trimmed];
        return {
            skills: allSkills[key] || allSkills['general'],
            matchedKey: key,
            matchType: 'alias',
            confidence: 0.95
        };
    }

    // 6. ALIAS normalized
    if (aliases[norm]) {
        const key = aliases[norm];
        return {
            skills: allSkills[key] || allSkills['general'],
            matchedKey: key,
            matchType: 'alias',
            confidence: 0.95
        };
    }

    // 7. ALIAS normalized no suffix
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
        return {
            skills: allSkills[key],
            matchedKey: key,
            matchType: 'fuzzy',
            confidence: similarity(norm, fuzzyKey)
        };
    }

    // 9. FALLBACK
    return fallback;
};

/**
 * Simple version — sirf skills array.
 */
export const getSkillsForProfession = (jobTitle: string): string[] => {
    return matchProfession(jobTitle).skills;
};