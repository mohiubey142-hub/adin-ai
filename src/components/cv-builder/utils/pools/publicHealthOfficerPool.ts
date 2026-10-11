// utils/pools/publicHealthOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPublicHealthOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 100+ public health assessments in communities at ${company}`,
            `• Implemented 50+ health education programs reaching 10,000+ people`,
            `• Monitored 30+ disease outbreaks and implemented control measures`,
            `• Collected and analyzed 500+ health data points`,
            `• Documented 200+ public health reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led public health programs for 50,000+ residents at ${company}`,
            `• Developed disease prevention strategies reducing outbreaks by 45%`,
            `• Managed 5+ public health officers on community initiatives`,
            `• Implemented vaccination campaigns achieving 95% coverage`,
            `• Improved community health outcomes by 35% through education`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led public health department of 15 officers, serving 500,000+ residents at ${company}`,
            `• Defined public health strategy adopted across 5 districts`,
            `• Drove disease prevention improvements reducing mortality by 50%`,
            `• Built relationships with 25+ government and health organizations`,
            `• Published 10+ research papers in public health journals`
        ];
    }
    return [
        `• Served as Director of Public Health at ${company}, overseeing 40+ officers and $10M budget`,
        `• Led public health transformation improving population health by 60%`,
        `• Built public health organization from ground up, hiring 35+ officers`,
        `• Presented public health strategy to government and secured $8M for programs`,
        `• Mentored 20 public health leaders who now run their own departments`
    ];
};