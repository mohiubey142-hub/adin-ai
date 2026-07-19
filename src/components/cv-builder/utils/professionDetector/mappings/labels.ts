// utils/professionDetector/mappings/labels.ts
// ============================================
// PROFESSION LABELS - Human Readable
// ============================================

import { Profession } from '../types';

export const PROFESSION_LABELS: Record<Profession, string> = {
    // Medical
    'doctor': 'Doctor',
    'nurse': 'Nurse',
    'dentist': 'Dentist',
    'pharmacist': 'Pharmacist',
    'radiologist': 'Radiologist',
    'cardiologist': 'Cardiologist',
    'pediatrician': 'Pediatrician',
    'gynecologist': 'Gynecologist',
    'psychiatrist': 'Psychiatrist',
    'medical-technologist': 'Medical Technologist',
    'physical-therapist': 'Physical Therapist',
    
    // Education
    'teacher': 'Teacher',
    'professor': 'Professor',
    'lecturer': 'Lecturer',
    'principal': 'Principal',
    'physics-teacher': 'Physics Teacher',
    'chemistry-teacher': 'Chemistry Teacher',
    'math-teacher': 'Math Teacher',
    'biology-teacher': 'Biology Teacher',
    'english-teacher': 'English Teacher',
    'urdu-teacher': 'Urdu Teacher',
    'computer-teacher': 'Computer Teacher',
    'islamic-studies-teacher': 'Islamic Studies Teacher',
    'pakistan-studies-teacher': 'Pakistan Studies Teacher',
    'history-teacher': 'History Teacher',
    
    // IT
    'software': 'Software Engineer',
    'frontend': 'Frontend Developer',
    'backend': 'Backend Developer',
    'full-stack': 'Full Stack Developer',
    'web': 'Web Developer',
    'developer': 'Developer',
    'devops': 'DevOps Engineer',
    'cloud': 'Cloud Engineer',
    'data-scientist': 'Data Scientist',
    'data-analyst': 'Data Analyst',
    'cybersecurity': 'Cybersecurity Engineer',
    'game-developer': 'Game Developer',
    'mobile': 'Mobile Developer',
    'ai-ml': 'AI/ML Engineer',
    'blockchain': 'Blockchain Developer',
    'qa': 'QA Engineer',
    'salesforce': 'Salesforce Developer',
    'it-support': 'IT Support',
    'system-administrator': 'System Administrator',
    'network-engineer': 'Network Engineer',
    'software-architect': 'Software Architect',
    
    // Business
    'business': 'Business Professional',
    'project-manager': 'Project Manager',
    'product-manager': 'Product Manager',
    'operations-manager': 'Operations Manager',
    'entrepreneur': 'Entrepreneur',
    'business-analyst': 'Business Analyst',
    'supply-chain': 'Supply Chain Manager',
    'consultant': 'Consultant',
    
    // Engineering
    'engineering': 'Engineer',
    'civil-engineer': 'Civil Engineer',
    'electrical-engineer': 'Electrical Engineer',
    'mechanical-engineer': 'Mechanical Engineer',
    'chemical-engineer': 'Chemical Engineer',
    'industrial-engineer': 'Industrial Engineer',
    'petroleum-engineer': 'Petroleum Engineer',
    'architect': 'Architect',
    'structural-engineer': 'Structural Engineer',
    'environmental-engineer': 'Environmental Engineer',
    'biomedical-engineer': 'Biomedical Engineer',
    'robotics-engineer': 'Robotics Engineer',
    
    // Commerce
    'accountant': 'Accountant',
    'banker': 'Banker',
    'investment-banker': 'Investment Banker',
    'financial-analyst': 'Financial Analyst',
    'auditor': 'Auditor',
    'tax-consultant': 'Tax Consultant',
    'credit-analyst': 'Credit Analyst',
    'treasury-manager': 'Treasury Manager',
    'fintech': 'FinTech Specialist',
    'risk-manager': 'Risk Manager',
    
    // Sales & Marketing
    'sales': 'Sales Professional',
    'marketing': 'Marketing Specialist',
    'digital-marketing': 'Digital Marketer',
    'seo': 'SEO Specialist',
    'performance-marketer': 'Performance Marketer',
    'content-creator': 'Content Creator',
    'copywriter': 'Copywriter',
    'journalist': 'Journalist',
    'pr-specialist': 'PR Specialist',
    
    // Creative
    'graphic-designer': 'Graphic Designer',
    'ui-ux': 'UI/UX Designer',
    'illustrator': 'Illustrator',
    'animator': 'Animator',
    'video-editor': 'Video Editor',
    'photographer': 'Photographer',
    'motion-designer': 'Motion Designer',
    '3d-artist': '3D Artist',
    
    // Legal
    'law': 'Legal Professional',
    'lawyer': 'Lawyer',
    'advocate': 'Advocate',
    'attorney': 'Attorney',
    'barrister': 'Barrister',
    'legal-advisor': 'Legal Advisor',
    'judge': 'Judge',
    
    // Social Sciences
    'social-sciences': 'Social Sciences',
    'psychologist': 'Psychologist',
    'sociologist': 'Sociologist',
    'economist': 'Economist',
    'social-worker': 'Social Worker',
    'political-scientist': 'Political Scientist',
    
    // Natural Sciences
    'natural-sciences': 'Natural Sciences',
    'physicist': 'Physicist',
    'chemist': 'Chemist',
    'biologist': 'Biologist',
    'microbiologist': 'Microbiologist',
    'zoologist': 'Zoologist',
    'botanist': 'Botanist',
    
    // Arts
    'arts': 'Arts & Humanities',
    'historian': 'Historian',
    'philosopher': 'Philosopher',
    'linguist': 'Linguist',
    'literature': 'Literature',
    'journalism': 'Journalism',
    
    // Aviation
    'pilot': 'Pilot',
    'air-traffic-controller': 'Air Traffic Controller',
    'army-officer': 'Army Officer',
    'navy-officer': 'Navy Officer',
    'air-force-officer': 'Air Force Officer',
    'police-officer': 'Police Officer',
    'firefighter': 'Firefighter',
    
    // Vocational
    'electrician': 'Electrician',
    'plumber': 'Plumber',
    'carpenter': 'Carpenter',
    'welder': 'Welder',
    'mason': 'Mason',
    'construction-worker': 'Construction Worker',
    'cnc-operator': 'CNC Operator',
    'machine-operator': 'Machine Operator',
    
    // Renewable
    'renewable': 'Renewable Energy',
    'solar-installer': 'Solar Installer',
    'wind-turbine-technician': 'Wind Turbine Technician',
    'energy-engineer': 'Energy Engineer',
    
    // Hospitality
    'chef': 'Chef',
    'hotel-manager': 'Hotel Manager',
    'event-planner': 'Event Planner',
    
    // Real Estate
    'real-estate-agent': 'Real Estate Agent',
    'insurance-agent': 'Insurance Agent',
    
    // Freelancer
    'freelancer': 'Freelancer',
    
    // HR
    'hr': 'HR Professional',
    
    // General
    'general': 'General Professional'
};

export const getProfessionLabel = (profession: Profession): string => {
    return PROFESSION_LABELS[profession] || profession;
};