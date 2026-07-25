// utils/professionDetector/mappings/categories.ts
// ============================================
// PROFESSION CATEGORIES - 80+ Professions
// ============================================

import { Profession } from '../types';

export const PROFESSION_CATEGORIES: Record<Profession, string> = {
    // Medical
    'doctor': 'Medical',
    'nurse': 'Medical',
    'dentist': 'Medical',
    'pharmacist': 'Medical',
    'radiologist': 'Medical',
    'cardiologist': 'Medical',
    'pediatrician': 'Medical',
    'gynecologist': 'Medical',
    'psychiatrist': 'Medical',
    'medical-technologist': 'Medical',
    'physical-therapist': 'Medical',
    
    // ===== NEW HEALTHCARE (9) =====
    'physiotherapist': 'Medical',
    'nutritionist': 'Medical',
    'medical-lab-technologist': 'Medical',
    'radiology-technologist': 'Medical',
    'occupational-therapist': 'Medical',
    'speech-therapist': 'Medical',
    'optometrist': 'Medical',
    'veterinary-doctor': 'Medical',
    'healthcare-administrator': 'Medical',
    
    // Education
    'teacher': 'Education',
    'professor': 'Education',
    'lecturer': 'Education',
    'principal': 'Education',
    'physics-teacher': 'Education',
    'chemistry-teacher': 'Education',
    'math-teacher': 'Education',
    'biology-teacher': 'Education',
    'english-teacher': 'Education',
    'urdu-teacher': 'Education',
    'computer-teacher': 'Education',
    'islamic-studies-teacher': 'Education',
    'pakistan-studies-teacher': 'Education',
    'history-teacher': 'Education',
    
    // IT
    'software': 'IT',
    'frontend': 'IT',
    'backend': 'IT',
    'full-stack': 'IT',
    'web': 'IT',
    'developer': 'IT',
    'devops': 'IT',
    'cloud': 'IT',
    'data-scientist': 'IT',
    'data-analyst': 'IT',
    'cybersecurity': 'IT',
    'game-developer': 'IT',
    'mobile': 'IT',
    'ai-ml': 'IT',
    'blockchain': 'IT',
    'qa': 'IT',
    'salesforce': 'IT',
    'it-support': 'IT',
    'system-administrator': 'IT',
    'network-engineer': 'IT',
    'software-architect': 'IT',
    
    // ===== NEW IT (5) =====
    'software-engineer': 'IT',
    'ai-research-engineer': 'IT',
    'embedded-systems-engineer': 'IT',
    'database-administrator': 'IT',
    'mechatronics-engineer': 'Engineering',  // Mechatronics is Engineering
    
    // Business
    'business': 'Business',
    'project-manager': 'Business',
    'product-manager': 'Business',
    'operations-manager': 'Business',
    'entrepreneur': 'Business',
    'business-analyst': 'Business',
    'supply-chain': 'Business',
    'consultant': 'Business',
    
    // ===== NEW BUSINESS (6) =====
    'finance-analyst': 'Finance',
    'financial-advisor': 'Finance',
    'supply-chain-manager': 'Business',
    'procurement-officer': 'Business',
    'logistics-manager': 'Business',
    'business-development-executive': 'Business',
    
    // Engineering
    'engineering': 'Engineering',
    'civil-engineer': 'Engineering',
    'electrical-engineer': 'Engineering',
    'mechanical-engineer': 'Engineering',
    'chemical-engineer': 'Engineering',
    'industrial-engineer': 'Engineering',
    'petroleum-engineer': 'Engineering',
    'architect': 'Engineering',
    'structural-engineer': 'Engineering',
    'environmental-engineer': 'Engineering',
    'biomedical-engineer': 'Engineering',
    'robotics-engineer': 'Engineering',
    
    // ===== NEW ENGINEERING (2) =====
    'automobile-engineer': 'Engineering',
    'mining-engineer': 'Engineering',
    
    // Commerce
    'accountant': 'Finance',
    'banker': 'Finance',
    'investment-banker': 'Finance',
    'financial-analyst': 'Finance',
    'auditor': 'Finance',
    'tax-consultant': 'Finance',
    'credit-analyst': 'Finance',
    'treasury-manager': 'Finance',
    'fintech': 'Finance',
    'risk-manager': 'Finance',
    
    // Sales & Marketing
    'sales': 'Sales',
    'marketing': 'Marketing',
    'digital-marketing': 'Marketing',
    'seo': 'Marketing',
    'performance-marketer': 'Marketing',
    'content-creator': 'Marketing',
    'copywriter': 'Marketing',
    'journalist': 'Media',
    'pr-specialist': 'Media',
    
    // ===== NEW SALES & MARKETING (1) =====
    'customer-support-specialist': 'Sales',
    
    // Creative
    'graphic-designer': 'Design',
    'ui-ux': 'Design',
    'illustrator': 'Design',
    'animator': 'Design',
    'video-editor': 'Design',
    'photographer': 'Design',
    'motion-designer': 'Design',
    '3d-artist': 'Design',
    
    // Legal
    'law': 'Legal',
    'lawyer': 'Legal',
    'advocate': 'Legal',
    'attorney': 'Legal',
    'barrister': 'Legal',
    'legal-advisor': 'Legal',
    'judge': 'Legal',
    
    // Social Sciences
    'social-sciences': 'Social Sciences',
    'psychologist': 'Social Sciences',
    'sociologist': 'Social Sciences',
    'economist': 'Social Sciences',
    'social-worker': 'Social Sciences',
    'political-scientist': 'Social Sciences',
    
    // Natural Sciences
    'natural-sciences': 'Science',
    'physicist': 'Science',
    'chemist': 'Science',
    'biologist': 'Science',
    'microbiologist': 'Science',
    'zoologist': 'Science',
    'botanist': 'Science',
    
    // Arts
    'arts': 'Arts',
    'historian': 'Arts',
    'philosopher': 'Arts',
    'linguist': 'Arts',
    'literature': 'Arts',
    'journalism': 'Arts',
    
    // Aviation
    'pilot': 'Aviation',
    'air-traffic-controller': 'Aviation',
    'army-officer': 'Defense',
    'navy-officer': 'Defense',
    'air-force-officer': 'Defense',
    'police-officer': 'Defense',
    'firefighter': 'Emergency',
    
    // Vocational
    'electrician': 'Vocational',
    'plumber': 'Vocational',
    'carpenter': 'Vocational',
    'welder': 'Vocational',
    'mason': 'Vocational',
    'construction-worker': 'Vocational',
    'cnc-operator': 'Vocational',
    'machine-operator': 'Vocational',
    
    // Renewable
    'renewable': 'Renewable Energy',
    'solar-installer': 'Renewable Energy',
    'wind-turbine-technician': 'Renewable Energy',
    'energy-engineer': 'Renewable Energy',
    
    // Hospitality
    'chef': 'Hospitality',
    'hotel-manager': 'Hospitality',
    'event-planner': 'Hospitality',
    
    // Real Estate
    'real-estate-agent': 'Real Estate',
    'insurance-agent': 'Insurance',
    
    // Freelancer
    'freelancer': 'Freelance',
    
    // HR
    'hr': 'HR',
    
    // General
    'general': 'General'
};

export const getProfessionCategory = (profession: Profession): string => {
    return PROFESSION_CATEGORIES[profession] || 'General';
};