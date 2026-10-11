// utils/pools/creditAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCreditAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed 100+ credit applications for individuals and businesses at ${company}`,
            `• Assessed creditworthiness using financial statements and credit reports`,
            `• Prepared 50+ credit memos with recommendations`,
            `• Monitored 200+ loan portfolios for credit risk`,
            `• Documented 150+ credit analyses with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led credit analysis for $50M loan portfolio at ${company}`,
            `• Developed credit risk models improving accuracy by 40%`,
            `• Reduced default rates by 30% through improved underwriting`,
            `• Managed 5+ credit analysts on complex lending decisions`,
            `• Presented credit recommendations to loan committee`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led credit analysis team of 15 analysts, managing $500M portfolio at ${company}`,
            `• Defined credit policy adopted across the organization`,
            `• Drove risk reduction improving portfolio quality by 45%`,
            `• Built relationships with regulators and rating agencies`,
            `• Published 10+ reports on credit risk management`
        ];
    }
    return [
        `• Served as Director of Credit at ${company}, overseeing 40+ analysts and $2B portfolio`,
        `• Led credit transformation reducing defaults by 60%`,
        `• Built credit organization from ground up, hiring 35+ analysts`,
        `• Presented credit strategy to board and secured $100M for lending`,
        `• Mentored 20 credit leaders who now run their own departments`
    ];
};