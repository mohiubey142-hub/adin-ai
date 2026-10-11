// utils/pools/safetyOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSafetyOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 500+ safety inspections across facilities at ${company}`,
            `• Implemented 100+ safety protocols reducing incidents by 40%`,
            `• Delivered 200+ safety training sessions to 1,000+ employees`,
            `• Investigated 50+ workplace incidents and recommended corrective actions`,
            `• Documented 400+ safety reports with 100% compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led safety team of 5 officers at ${company}`,
            `• Developed safety programs reducing accidents by 60%`,
            `• Managed 1,000+ safety inspections with 99% compliance`,
            `• Trained 500+ employees in workplace safety procedures`,
            `• Achieved ISO 45001 certification for 3 facilities`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led safety department of 15 officers, ensuring 5,000+ employees' safety at ${company}`,
            `• Defined safety standards adopted across 5 facilities`,
            `• Drove safety improvement reducing incidents by 75%`,
            `• Built relationships with 25+ regulatory bodies and safety organizations`,
            `• Published 10+ articles on workplace safety`
        ];
    }
    return [
        `• Served as Director of Safety at ${company}, overseeing 40+ officers and $5M budget`,
        `• Led safety transformation achieving 90% incident reduction`,
        `• Built safety organization from ground up, hiring 35+ officers`,
        `• Presented safety strategy to board and secured $3M for safety programs`,
        `• Mentored 20 safety leaders who now run their own departments`
    ];
};