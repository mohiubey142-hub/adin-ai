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
    
    // Healthcare - NEW (13)
    'physiotherapist': 'Physiotherapist',
    'nutritionist': 'Nutritionist',
    'medical-lab-technologist': 'Medical Lab Technologist',
    'radiology-technologist': 'Radiology Technologist',
    'occupational-therapist': 'Occupational Therapist',
    'speech-therapist': 'Speech Therapist',
    'optometrist': 'Optometrist',
    'veterinary-doctor': 'Veterinary Doctor',
    'healthcare-administrator': 'Healthcare Administrator',
    'paramedic': 'Paramedic',
    'medical-technician': 'Medical Technician',
    'physician-assistant': 'Physician Assistant',
    'medical-sales-representative': 'Medical Sales Representative',
    
    // Healthcare - BATCH 2 (10)
    'dental-assistant': 'Dental Assistant',
    'dental-technician': 'Dental Technician',
    'dietitian': 'Dietitian',
    'emergency-medical-technician': 'Emergency Medical Technician',
    'lab-assistant': 'Lab Assistant',
    'medical-assistant': 'Medical Assistant',
    'medical-coder': 'Medical Coder',
    'midwife': 'Midwife',
    'public-health-officer': 'Public Health Officer',
    'caregiver': 'Caregiver',
    
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
    
    // Education - BATCH 2 (3)
    'special-education-teacher': 'Special Education Teacher',
    'school-counselor': 'School Counselor',
    'research-assistant': 'Research Assistant',
    
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
    
    // IT - NEW (6)
    'software-engineer': 'Software Engineer',
    'ai-research-engineer': 'AI Research Engineer',
    'embedded-systems-engineer': 'Embedded Systems Engineer',
    'database-administrator': 'Database Administrator',
    'mechatronics-engineer': 'Mechatronics Engineer',
    'data-engineer': 'Data Engineer',
    
    // IT - BATCH 2 (5)
    'computer-hardware-technician': 'Computer Hardware Technician',
    'computer-programmer': 'Computer Programmer',
    'electronics-technician': 'Electronics Technician',
    'it-technician': 'IT Technician',
    'software-tester': 'Software Tester',
    
    // Business
    'business': 'Business Professional',
    'project-manager': 'Project Manager',
    'product-manager': 'Product Manager',
    'operations-manager': 'Operations Manager',
    'entrepreneur': 'Entrepreneur',
    'business-analyst': 'Business Analyst',
    'supply-chain': 'Supply Chain Manager',
    'consultant': 'Consultant',
    
    // Business - NEW (7)
    'finance-analyst': 'Finance Analyst',
    'financial-advisor': 'Financial Advisor',
    'supply-chain-manager': 'Supply Chain Manager',
    'procurement-officer': 'Procurement Officer',
    'logistics-manager': 'Logistics Manager',
    'business-development-executive': 'Business Development Executive',
    'supply-chain-analyst': 'Supply Chain Analyst',
    
    // Business - BATCH 2 (5)
    'procurement-manager': 'Procurement Manager',
    'sales-manager': 'Sales Manager',
    'sales-executive': 'Sales Executive',
    'store-manager': 'Store Manager',
    'retail-manager': 'Retail Manager',
    
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
    
    // Engineering - NEW (4)
    'automobile-engineer': 'Automobile Engineer',
    'mining-engineer': 'Mining Engineer',
    'telecommunications-engineer': 'Telecommunications Engineer',
    'quantity-surveyor': 'Quantity Surveyor',
    
    // Engineering - BATCH 2 (10)
    'construction-supervisor': 'Construction Supervisor',
    'foreman': 'Foreman',
    'industrial-electrician': 'Industrial Electrician',
    'instrumentation-technician': 'Instrumentation Technician',
    'maintenance-technician': 'Maintenance Technician',
    'site-engineer': 'Site Engineer',
    'site-supervisor': 'Site Supervisor',
    'surveyor': 'Surveyor',
    'textile-engineer': 'Textile Engineer',
    'textile-technician': 'Textile Technician',
    
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
    
    // Sales & Marketing - NEW (1)
    'customer-support-specialist': 'Customer Support Specialist',
    
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
    
    // Vocational - NEW (7)
    'computer-operator': 'Computer Operator',
    'electrical-technician': 'Electrical Technician',
    'stitching-machine-operator': 'Stitching Machine Operator',
    'civil-technician': 'Civil Technician',
    'auto-mechanic': 'Auto Mechanic',
    'hvac-technician': 'HVAC Technician',
    'agricultural-technician': 'Agricultural Technician',
    
    // Vocational - BATCH 2 (8)
    'packaging-operator': 'Packaging Operator',
    'production-manager': 'Production Manager',
    'production-supervisor': 'Production Supervisor',
    'quality-control-inspector': 'Quality Control Inspector',
    'quality-control-engineer': 'Quality Control Engineer',
    'solar-technician': 'Solar Technician',
    'driver': 'Driver',
    'tailor': 'Tailor',
    
    // Renewable
    'renewable': 'Renewable Energy',
    'solar-installer': 'Solar Installer',
    'wind-turbine-technician': 'Wind Turbine Technician',
    'energy-engineer': 'Energy Engineer',
    
    // Hospitality
    'chef': 'Chef',
    'hotel-manager': 'Hotel Manager',
    'event-planner': 'Event Planner',
    
    // Hospitality - BATCH 2 (6)
    'hotel-receptionist': 'Hotel Receptionist',
    'housekeeping-supervisor': 'Housekeeping Supervisor',
    'restaurant-manager': 'Restaurant Manager',
    'tourism-officer': 'Tourism Officer',
    'travel-consultant': 'Travel Consultant',
    'call-center-agent': 'Call Center Agent',
    
    // Real Estate
    'real-estate-agent': 'Real Estate Agent',
    'insurance-agent': 'Insurance Agent',
    
    // Office & Admin - BATCH 2 (8)
    'office-assistant': 'Office Assistant',
    'data-entry-operator': 'Data Entry Operator',
    'cashier': 'Cashier',
    'storekeeper': 'Storekeeper',
    'warehouse-manager': 'Warehouse Manager',
    'warehouse-supervisor': 'Warehouse Supervisor',
    'logistics-coordinator': 'Logistics Coordinator',
    'freight-forwarder': 'Freight Forwarder',
    
    // Safety & Security - BATCH 2 (5)
    'safety-officer': 'Safety Officer',
    'hse-officer': 'HSE Officer',
    'food-safety-officer': 'Food Safety Officer',
    'security-guard': 'Security Guard',
    'security-officer': 'Security Officer',
    
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