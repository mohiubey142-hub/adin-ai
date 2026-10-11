// utils/professionDetector/utils/validation.ts
// ============================================
// PROFESSION VALIDATION - 280+ Professions
// ============================================

import { Profession } from '../types';

// All valid profession values (must match Profession type)
export const VALID_PROFESSIONS: Profession[] = [
    // ===== MEDICAL & HEALTHCARE (24) =====
    'doctor', 'nurse', 'dentist', 'pharmacist', 'radiologist', 'cardiologist',
    'pediatrician', 'gynecologist', 'psychiatrist', 'medical-technologist', 'physical-therapist',
    'physiotherapist', 'nutritionist', 'medical-lab-technologist', 'radiology-technologist',
    'occupational-therapist', 'speech-therapist', 'optometrist', 'veterinary-doctor',
    'healthcare-administrator', 'paramedic', 'medical-technician', 'physician-assistant',
    'medical-sales-representative',
    
    // ===== HEALTHCARE - BATCH 2 (10) =====
    'dental-assistant', 'dental-technician', 'dietitian', 'emergency-medical-technician',
    'lab-assistant', 'medical-assistant', 'medical-coder', 'midwife',
    'public-health-officer', 'caregiver',
    
    // ===== EDUCATION & TEACHING (14) =====
    'teacher', 'professor', 'lecturer', 'principal', 'physics-teacher', 'chemistry-teacher',
    'math-teacher', 'biology-teacher', 'english-teacher', 'urdu-teacher', 'computer-teacher',
    'islamic-studies-teacher', 'pakistan-studies-teacher', 'history-teacher',
    
    // ===== EDUCATION - BATCH 2 (3) =====
    'special-education-teacher', 'school-counselor', 'research-assistant',
    
    // ===== IT & TECHNOLOGY (21) =====
    'software', 'frontend', 'backend', 'full-stack', 'web', 'developer', 'devops',
    'cloud', 'data-scientist', 'data-analyst', 'cybersecurity', 'game-developer',
    'mobile', 'ai-ml', 'blockchain', 'qa', 'salesforce', 'it-support',
    'system-administrator', 'network-engineer', 'software-architect',
    
    // ===== IT - NEW (6) =====
    'software-engineer', 'ai-research-engineer', 'embedded-systems-engineer',
    'database-administrator', 'mechatronics-engineer', 'data-engineer',
    
    // ===== IT - BATCH 2 (5) =====
    'computer-hardware-technician', 'computer-programmer', 'electronics-technician',
    'it-technician', 'software-tester',
    
    // ===== BUSINESS & MANAGEMENT (8) =====
    'business', 'project-manager', 'product-manager', 'operations-manager',
    'entrepreneur', 'business-analyst', 'supply-chain', 'consultant',
    
    // ===== BUSINESS - NEW (7) =====
    'finance-analyst', 'financial-advisor', 'supply-chain-manager', 'procurement-officer',
    'logistics-manager', 'business-development-executive', 'supply-chain-analyst',
    
    // ===== BUSINESS - BATCH 2 (5) =====
    'procurement-manager', 'sales-manager', 'sales-executive', 'store-manager', 'retail-manager',
    
    // ===== ENGINEERING (12) =====
    'engineering', 'civil-engineer', 'electrical-engineer', 'mechanical-engineer',
    'chemical-engineer', 'industrial-engineer', 'petroleum-engineer', 'architect',
    'structural-engineer', 'environmental-engineer', 'biomedical-engineer', 'robotics-engineer',
    
    // ===== ENGINEERING - NEW (4) =====
    'automobile-engineer', 'mining-engineer', 'telecommunications-engineer', 'quantity-surveyor',
    
    // ===== ENGINEERING - BATCH 2 (10) =====
    'construction-supervisor', 'foreman', 'industrial-electrician', 'instrumentation-technician',
    'maintenance-technician', 'site-engineer', 'site-supervisor', 'surveyor',
    'textile-engineer', 'textile-technician',
    
    // ===== COMMERCE & FINANCE (10) =====
    'accountant', 'banker', 'investment-banker', 'financial-analyst', 'auditor',
    'tax-consultant', 'credit-analyst', 'treasury-manager', 'fintech', 'risk-manager',
    
    // ===== SALES & MARKETING (9) =====
    'sales', 'marketing', 'digital-marketing', 'seo', 'performance-marketer',
    'content-creator', 'copywriter', 'journalist', 'pr-specialist',
    
    // ===== SALES & MARKETING - NEW (2) =====
    'customer-support-specialist', 'medical-sales-representative',
    
    // ===== CREATIVE & DESIGN (8) =====
    'graphic-designer', 'ui-ux', 'illustrator', 'animator', 'video-editor',
    'photographer', 'motion-designer', '3d-artist',
    
    // ===== LEGAL (7) =====
    'law', 'lawyer', 'advocate', 'attorney', 'barrister', 'legal-advisor', 'judge',
    
    // ===== SOCIAL SCIENCES (6) =====
    'social-sciences', 'psychologist', 'sociologist', 'economist',
    'social-worker', 'political-scientist',
    
    // ===== NATURAL SCIENCES (7) =====
    'natural-sciences', 'physicist', 'chemist', 'biologist',
    'microbiologist', 'zoologist', 'botanist',
    
    // ===== ARTS & HUMANITIES (6) =====
    'arts', 'historian', 'philosopher', 'linguist', 'literature', 'journalism',
    
    // ===== AVIATION & DEFENSE (7) =====
    'pilot', 'air-traffic-controller', 'army-officer', 'navy-officer',
    'air-force-officer', 'police-officer', 'firefighter',
    
    // ===== VOCATIONAL (8) =====
    'electrician', 'plumber', 'carpenter', 'welder', 'mason',
    'construction-worker', 'cnc-operator', 'machine-operator',
    
    // ===== VOCATIONAL - NEW (7) =====
    'computer-operator', 'electrical-technician', 'stitching-machine-operator',
    'civil-technician', 'auto-mechanic', 'hvac-technician', 'agricultural-technician',
    
    // ===== VOCATIONAL - BATCH 2 (8) =====
    'packaging-operator', 'production-manager', 'production-supervisor',
    'quality-control-inspector', 'quality-control-engineer', 'solar-technician',
    'driver', 'tailor',
    
    // ===== RENEWABLE ENERGY (4) =====
    'renewable', 'solar-installer', 'wind-turbine-technician', 'energy-engineer',
    
    // ===== HOSPITALITY (3) =====
    'chef', 'hotel-manager', 'event-planner',
    
    // ===== HOSPITALITY - BATCH 2 (6) =====
    'hotel-receptionist', 'housekeeping-supervisor', 'restaurant-manager',
    'tourism-officer', 'travel-consultant', 'call-center-agent',
    
    // ===== REAL ESTATE (2) =====
    'real-estate-agent', 'insurance-agent',
    
    // ===== OFFICE & ADMIN - BATCH 2 (8) =====
    'office-assistant', 'data-entry-operator', 'cashier', 'storekeeper',
    'warehouse-manager', 'warehouse-supervisor', 'logistics-coordinator', 'freight-forwarder',
    
    // ===== SAFETY & SECURITY - BATCH 2 (5) =====
    'safety-officer', 'hse-officer', 'food-safety-officer',
    'security-guard', 'security-officer',
    
    // ===== FREELANCER (1) =====
    'freelancer',
    
    // ===== HR (1) =====
    'hr',
    
    // ===== GENERAL (1) =====
    'general'
];

export const isValidProfession = (profession: string): profession is Profession => {
    return VALID_PROFESSIONS.includes(profession as Profession);
};