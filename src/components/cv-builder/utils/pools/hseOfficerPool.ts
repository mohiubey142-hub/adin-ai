// utils/pools/hseOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHseOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 400+ HSE inspections across industrial facilities at ${company}`,
            `• Implemented 80+ HSE protocols reducing incidents by 45%`,
            `• Delivered 150+ HSE training sessions to 800+ employees`,
            `• Investigated 40+ HSE incidents and recommended corrective actions`,
            `• Documented 350+ HSE reports with 100% compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led HSE team of 5 officers at ${company}`,
            `• Developed HSE programs reducing accidents by 65%`,
            `• Managed 800+ HSE inspections with 99% compliance`,
            `• Trained 400+ employees in HSE procedures`,
            `• Achieved ISO 14001 and ISO 45001 certifications`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led HSE department of 15 officers, ensuring 3,000+ employees' safety at ${company}`,
            `• Defined HSE standards adopted across 5 facilities`,
            `• Drove HSE improvement reducing incidents by 80%`,
            `• Built relationships with 25+ regulatory bodies and HSE organizations`,
            `• Published 10+ articles on HSE management`
        ];
    }
    return [
        `• Served as Director of HSE at ${company}, overseeing 40+ officers and $6M budget`,
        `• Led HSE transformation achieving 95% incident reduction`,
        `• Built HSE organization from ground up, hiring 35+ officers`,
        `• Presented HSE strategy to board and secured $4M for HSE programs`,
        `• Mentored 20 HSE leaders who now run their own departments`
    ];
};