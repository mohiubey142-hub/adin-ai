// utils/pools/procurementManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProcurementManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed procurement of $5M in goods and services at ${company}`,
            `• Negotiated contracts with 100+ suppliers saving 15% on costs`,
            `• Processed 1,000+ purchase orders with 100% accuracy`,
            `• Maintained supplier relationships with 200+ vendors`,
            `• Documented 400+ procurement reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed procurement of $50M in goods and services at ${company}`,
            `• Led procurement team of 8 professionals`,
            `• Negotiated contracts saving $5M annually (20% cost reduction)`,
            `• Implemented procurement systems reducing processing time by 40%`,
            `• Trained 10 junior procurement officers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led procurement department of 20 professionals, managing $200M in spend at ${company}`,
            `• Defined procurement strategy adopted across 5 business units`,
            `• Drove cost savings of $30M through strategic sourcing`,
            `• Built relationships with 50+ strategic suppliers`,
            `• Published 10+ articles on procurement management`
        ];
    }
    return [
        `• Served as Chief Procurement Officer at ${company}, overseeing 50+ professionals and $500M spend`,
        `• Led procurement transformation saving $100M annually`,
        `• Built procurement organization from ground up, hiring 40+ professionals`,
        `• Presented procurement strategy to board and secured $30M for technology`,
        `• Mentored 25 procurement leaders who now run their own departments`
    ];
};