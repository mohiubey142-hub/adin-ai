// utils/pools/securityOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSecurityOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed security operations for 300+ shifts ensuring 100% safety at ${company}`,
            `• Conducted 500+ security assessments and risk analyses`,
            `• Implemented 50+ security protocols reducing incidents by 40%`,
            `• Monitored 100+ surveillance systems and reported 30+ incidents`,
            `• Documented 350+ security reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led security team of 6 officers at ${company}`,
            `• Developed security programs reducing incidents by 60%`,
            `• Managed 800+ security operations with 99% compliance`,
            `• Trained 500+ employees in security awareness`,
            `• Improved facility security by 50% through strategic initiatives`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led security department of 15 officers, ensuring 2,000+ employees' safety at ${company}`,
            `• Defined security standards adopted across 5 facilities`,
            `• Drove security improvement reducing incidents by 75%`,
            `• Built relationships with 25+ law enforcement and intelligence agencies`,
            `• Published 10+ articles on security management`
        ];
    }
    return [
        `• Served as Chief Security Officer at ${company}, overseeing 40+ officers and $10M budget`,
        `• Led security transformation achieving 90% incident reduction`,
        `• Built security organization from ground up, hiring 35+ officers`,
        `• Presented security strategy to board and secured $8M for security technology`,
        `• Mentored 20 security leaders who now run their own departments`
    ];
};