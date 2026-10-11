// utils/pools/riskManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRiskManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 50+ risk assessments across operational and financial areas at ${company}`,
            `• Documented 100+ risk registers and mitigation plans`,
            `• Monitored 30+ key risk indicators ensuring compliance`,
            `• Assisted in 20+ incident investigations and root cause analyses`,
            `• Prepared 40+ risk reports for management review`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led risk management for $100M business unit at ${company}`,
            `• Developed risk framework reducing incidents by 45%`,
            `• Managed 5+ risk analysts on enterprise risk assessments`,
            `• Implemented risk mitigation strategies saving $5M annually`,
            `• Presented risk reports to executive committee and board`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led risk management team of 15 professionals, managing enterprise risk at ${company}`,
            `• Defined risk strategy adopted across 5 business units`,
            `• Drove risk culture improvement reducing incidents by 60%`,
            `• Built relationships with regulators and insurance partners`,
            `• Published 10+ articles on enterprise risk management`
        ];
    }
    return [
        `• Served as Chief Risk Officer at ${company}, overseeing 40+ professionals and $10M budget`,
        `• Led risk transformation reducing enterprise risk by 70%`,
        `• Built risk organization from ground up, hiring 35+ professionals`,
        `• Presented risk strategy to board and secured $15M for risk technology`,
        `• Mentored 20 risk leaders who now run their own departments`
    ];
};