// utils/pools/computerOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getComputerOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed daily data entry tasks for 500+ records with 99.5% accuracy at ${company}`,
            `• Maintained and updated databases using MS Excel and MS Access for 10+ departments`,
            `• Prepared 50+ daily, weekly, and monthly reports for management review`,
            `• Handled 100+ internal and external correspondence via email and phone`,
            `• Assisted in system backups and file management for 20+ critical systems`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led computer operations team of 5 operators, managing data processing for 20+ departments at ${company}`,
            `• Developed and implemented data entry standards reducing errors by 60%`,
            `• Created automated reporting templates saving 10+ hours weekly`,
            `• Managed document control system for 5,000+ files with 100% traceability`,
            `• Trained 8 new operators on systems, procedures, and quality standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed computer operations across 3 locations, managing 20+ operators and 50+ systems at ${company}`,
            `• Established data management policies adopted as organizational standard`,
            `• Implemented ERP system improving data accuracy by 80% and reducing processing time by 60%`,
            `• Designed disaster recovery procedures ensuring 99.9% data availability`,
            `• Built and mentored team of 15 operators, achieving 95% employee retention`
        ];
    }
    return [
        `• Served as Director of IT Operations, overseeing 50+ computer operators and $5M budget`,
        `• Led digital transformation reducing manual data entry by 70% through automation`,
        `• Built computer operations center from ground up, hiring 40+ professionals`,
        `• Presented IT strategy to board and secured $4M for infrastructure upgrade`,
        `• Mentored 12 operations leads who now manage their own teams`
    ];
};