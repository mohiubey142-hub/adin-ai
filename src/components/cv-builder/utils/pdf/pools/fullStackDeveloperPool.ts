// utils/pools/fullStackDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFullStackDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built full-stack applications from database to UI for 5+ projects at ${company}`,
            `• Wrote React components and Node.js APIs for 15+ projects`,
            `• Designed database schemas and optimized queries for 10+ projects`,
            `• Deployed applications to cloud and managed infrastructure for 5+ projects`,
            `• Collaborated with both frontend and backend teams for 10+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Built 10+ full-stack applications from scratch at ${company}`,
            `• Architected end-to-end systems that handled 50K+ users`,
            `• Designed data pipeline that improved performance by 50%`,
            `• Deployed and managed 20+ applications on AWS`,
            `• Mentored 6 junior full stack engineers through pair programming`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led full stack team of 20, building products used by 5M+ users at ${company}`,
            `• Defined full stack architecture that became company standard`,
            `• Drove technical strategy that improved developer velocity by 50%`,
            `• Designed data platform that reduced time-to-insight from days to hours`,
            `• Partnered with product, design, and DevOps teams to build world-class products`
        ];
    }
    return [
        `• Served as Director of Engineering, overseeing 40+ engineers across frontend, backend, and DevOps`,
        `• Led engineering transformation that improved delivery speed by 60%`,
        `• Built engineering organization from ground up, hiring 35+ engineers across 6 countries`,
        `• Presented engineering strategy to CTO and secured $15M for platform investment`,
        `• Mentored 12 engineering leads who now run their own teams`
    ];
};