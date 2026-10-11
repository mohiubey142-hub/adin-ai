// utils/pools/treasuryManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTreasuryManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed daily cash positions of $10M+ ensuring liquidity at ${company}`,
            `• Executed 200+ wire transfers and payments with 100% accuracy`,
            `• Prepared 50+ cash flow forecasts for management`,
            `• Monitored 20+ bank accounts ensuring optimal cash utilization`,
            `• Documented 100+ treasury transactions and reports`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed treasury operations for $100M portfolio at ${company}`,
            `• Developed cash forecasting models improving accuracy by 35%`,
            `• Negotiated banking relationships saving $2M annually`,
            `• Implemented treasury management system reducing manual work by 60%`,
            `• Mentored 5 junior treasury analysts in cash management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led treasury team of 12 professionals managing $1B portfolio at ${company}`,
            `• Defined treasury strategy adopted across 5 business units`,
            `• Drove cost savings of $10M through banking optimization`,
            `• Built relationships with 20+ banking partners globally`,
            `• Published 10+ articles on treasury management best practices`
        ];
    }
    return [
        `• Served as Director of Treasury at ${company}, overseeing 30+ professionals and $5B portfolio`,
        `• Led treasury transformation improving returns by 40%`,
        `• Built treasury organization from ground up, hiring 25+ professionals`,
        `• Presented treasury strategy to board and secured $50M for investments`,
        `• Mentored 15 treasury leaders who now run their own departments`
    ];
};