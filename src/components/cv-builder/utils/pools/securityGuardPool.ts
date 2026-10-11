// utils/pools/securityGuardPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSecurityGuardBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided security coverage for 500+ shifts ensuring 100% safety at ${company}`,
            `• Monitored 200+ CCTV cameras and reported 50+ incidents`,
            `• Conducted 1,000+ security patrols across facilities`,
            `• Managed access control for 500+ employees and visitors`,
            `• Documented 400+ security reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led security team of 8 guards at ${company}`,
            `• Managed 1,000+ shifts with 99% coverage`,
            `• Trained 10 junior guards in security procedures`,
            `• Implemented security protocols reducing incidents by 50%`,
            `• Improved facility safety by 45% through proactive patrolling`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led security operations of 25 guards, ensuring 24/7 coverage at ${company}`,
            `• Defined security standards adopted across 5 facilities`,
            `• Drove security improvement reducing incidents by 70%`,
            `• Built relationships with 25+ law enforcement and security agencies`,
            `• Published 5+ articles on security management`
        ];
    }
    return [
        `• Served as Director of Security at ${company}, overseeing 50+ guards and $5M budget`,
        `• Led security transformation achieving 85% incident reduction`,
        `• Built security organization from ground up, hiring 40+ guards`,
        `• Presented security strategy to board and secured $3M for technology`,
        `• Mentored 20 security leaders who now run their own departments`
    ];
};