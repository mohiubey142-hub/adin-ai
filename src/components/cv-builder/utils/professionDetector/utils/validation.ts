// utils/professionDetector/utils/validation.ts
// ============================================
// PROFESSION VALIDATION
// ============================================

import { Profession } from '../types';

// All valid profession values (must match Profession type)
export const VALID_PROFESSIONS: Profession[] = [
    'doctor', 'nurse', 'dentist', 'pharmacist', 'radiologist', 'cardiologist',
    'pediatrician', 'gynecologist', 'psychiatrist', 'medical-technologist', 'physical-therapist',
    'teacher', 'professor', 'lecturer', 'principal', 'physics-teacher', 'chemistry-teacher',
    'math-teacher', 'biology-teacher', 'english-teacher', 'urdu-teacher', 'computer-teacher',
    'islamic-studies-teacher', 'pakistan-studies-teacher', 'history-teacher',
    'software', 'frontend', 'backend', 'full-stack', 'web', 'developer', 'devops',
    'cloud', 'data-scientist', 'data-analyst', 'cybersecurity', 'game-developer',
    'mobile', 'ai-ml', 'blockchain', 'qa', 'salesforce', 'it-support',
    'system-administrator', 'network-engineer', 'software-architect',
    'business', 'project-manager', 'product-manager', 'operations-manager',
    'entrepreneur', 'business-analyst', 'supply-chain', 'consultant',
    'engineering', 'civil-engineer', 'electrical-engineer', 'mechanical-engineer',
    'chemical-engineer', 'industrial-engineer', 'petroleum-engineer', 'architect',
    'structural-engineer', 'environmental-engineer', 'biomedical-engineer', 'robotics-engineer',
    'accountant', 'banker', 'investment-banker', 'financial-analyst', 'auditor',
    'tax-consultant', 'credit-analyst', 'treasury-manager', 'fintech', 'risk-manager',
    'sales', 'marketing', 'digital-marketing', 'seo', 'performance-marketer',
    'content-creator', 'copywriter', 'journalist', 'pr-specialist',
    'graphic-designer', 'ui-ux', 'illustrator', 'animator', 'video-editor',
    'photographer', 'motion-designer', '3d-artist',
    'law', 'lawyer', 'advocate', 'attorney', 'barrister', 'legal-advisor', 'judge',
    'social-sciences', 'psychologist', 'sociologist', 'economist', 'social-worker', 'political-scientist',
    'natural-sciences', 'physicist', 'chemist', 'biologist', 'microbiologist', 'zoologist', 'botanist',
    'arts', 'historian', 'philosopher', 'linguist', 'literature', 'journalism',
    'pilot', 'air-traffic-controller', 'army-officer', 'navy-officer', 'air-force-officer',
    'police-officer', 'firefighter',
    'electrician', 'plumber', 'carpenter', 'welder', 'mason', 'construction-worker',
    'cnc-operator', 'machine-operator',
    'renewable', 'solar-installer', 'wind-turbine-technician', 'energy-engineer',
    'chef', 'hotel-manager', 'event-planner',
    'real-estate-agent', 'insurance-agent',
    'freelancer', 'hr', 'general'
];

export const isValidProfession = (profession: string): profession is Profession => {
    return VALID_PROFESSIONS.includes(profession as Profession);
};