// utils/pools/realEstateAgentPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRealEstateAgentBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Closed 30+ real estate transactions worth $10M at ${company}`,
            `• Managed 100+ property listings with 90% satisfaction rate`,
            `• Conducted 200+ property showings to potential buyers`,
            `• Built relationships with 200+ clients and prospects`,
            `• Achieved 120% of sales targets for 4 consecutive quarters`
        ];
    }
    if (level === 'mid') {
        return [
            `• Closed 50+ real estate transactions worth $50M at ${company}`,
            `• Led team of 5 agents, generating $20M in sales`,
            `• Developed marketing strategies increasing leads by 60%`,
            `• Built network of 500+ clients and referral partners`,
            `• Achieved 150% of sales targets for 3 consecutive years`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led real estate team of 15 agents, closing $100M in annual sales at ${company}`,
            `• Defined sales strategy adopted across the brokerage`,
            `• Drove revenue growth of 40% through strategic initiatives`,
            `• Built relationships with 100+ developers and investors`,
            `• Published 10+ articles on real estate investment`
        ];
    }
    return [
        `• Served as Managing Broker at ${company}, overseeing 50+ agents and $500M in sales`,
        `• Led brokerage transformation achieving 60% revenue growth`,
        `• Built real estate brokerage from ground up, hiring 40+ agents`,
        `• Presented growth strategy to board and secured $50M for expansion`,
        `• Mentored 25 real estate leaders who now run their own brokerages`
    ];
};