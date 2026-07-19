// utils/professionDetector/utils/tester.ts
// ============================================
// PROFESSION DETECTOR TESTER
// ============================================

import { detectProfession } from './professionDetector';
import { getProfessionLabel, getProfessionCategory } from '../mappings';

export const testProfessionDetector = (): void => {
    console.log('🧪 TESTING PROFESSION DETECTOR');
    
    const testCases = [
        'Senior Software Engineer',
        'React Frontend Developer',
        'Backend Node.js Developer',
        'Full Stack Developer',
        'DevOps Engineer',
        'Cloud Architect',
        'Data Scientist',
        'Data Analyst',
        'Cybersecurity Engineer',
        'Game Developer',
        'Mobile Developer (React Native)',
        'AI/ML Engineer',
        'Blockchain Developer',
        'QA Engineer',
        'IT Support Specialist',
        'System Administrator',
        'Network Engineer',
        'Doctor',
        'Cardiologist',
        'Pediatrician',
        'Nurse',
        'Dentist',
        'Pharmacist',
        'Physics Teacher',
        'Chemistry Teacher',
        'Math Teacher',
        'Biology Teacher',
        'English Teacher',
        'Urdu Teacher',
        'Computer Teacher',
        'Professor',
        'Accountant',
        'Banker',
        'Investment Banker',
        'Financial Analyst',
        'Auditor',
        'Tax Consultant',
        'Product Manager',
        'Project Manager',
        'Operations Manager',
        'Entrepreneur',
        'Business Analyst',
        'Sales Manager',
        'Marketing Specialist',
        'Digital Marketer',
        'SEO Specialist',
        'Performance Marketer',
        'Content Creator',
        'Copywriter',
        'Graphic Designer',
        'UI/UX Designer',
        'Animator',
        'Video Editor',
        'Lawyer',
        'Legal Advisor',
        'Psychologist',
        'Social Worker',
        'Pilot',
        'Army Officer',
        'Police Officer',
        'Electrician',
        'Plumber',
        'Solar Installer',
        'Chef',
        'Real Estate Agent',
        'Freelancer'
    ];
    
    for (const test of testCases) {
        const result = detectProfession(test);
        console.log(`📌 ${test} → ${getProfessionLabel(result)} (${getProfessionCategory(result)})`);
    }
};