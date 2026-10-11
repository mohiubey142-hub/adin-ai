// utils/pools/salesExecutivePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSalesExecutiveBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Generated $500K+ in sales revenue through 100+ client acquisitions at ${company}`,
            `• Built relationships with 200+ clients and prospects`,
            `• Achieved 120% of sales targets for 4 consecutive quarters`,
            `• Conducted 300+ sales calls and 100+ client meetings`,
            `• Documented 400+ sales activities with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Generated $2M+ in sales revenue through 50+ major client acquisitions at ${company}`,
            `• Managed sales team of 5 executives, delivering $5M in annual revenue`,
            `• Developed sales strategies increasing conversion by 40%`,
            `• Built relationships with 100+ corporate clients and decision-makers`,
            `• Mentored 8 junior sales executives in sales techniques`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led sales team of 15 executives, generating $20M in annual revenue at ${company}`,
            `• Defined sales strategy adopted across 5 regions`,
            `• Drove revenue growth of 60% through strategic initiatives`,
            `• Built relationships with 200+ enterprise clients and partners`,
            `• Published 10+ articles on sales best practices`
        ];
    }
    return [
        `• Served as Sales Director at ${company}, overseeing 50+ executives and $100M revenue`,
        `• Led sales transformation achieving 80% revenue growth`,
        `• Built sales organization from ground up, hiring 40+ executives`,
        `• Presented sales strategy to board and secured $20M for expansion`,
        `• Mentored 25 sales leaders who now run their own teams`
    ];
};