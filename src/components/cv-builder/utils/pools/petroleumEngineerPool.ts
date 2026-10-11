// utils/pools/petroleumEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPetroleumEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in drilling operations for 5+ wells at ${company}`,
            `• Analyzed 100+ reservoir data points for production optimization`,
            `• Monitored 20+ well production rates ensuring targets`,
            `• Conducted 50+ safety inspections on drilling rigs`,
            `• Documented 200+ engineering calculations and reports`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led drilling projects for 10+ wells increasing production by 25% at ${company}`,
            `• Optimized reservoir management improving recovery by 30%`,
            `• Managed $10M in drilling operations delivering 40% ROI`,
            `• Implemented enhanced oil recovery techniques increasing output by 35%`,
            `• Mentored 5 junior petroleum engineers in drilling and production`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led petroleum engineering team of 15 engineers, managing $100M in projects at ${company}`,
            `• Defined reservoir management strategy adopted across 5 fields`,
            `• Drove innovation in enhanced oil recovery increasing reserves by 40%`,
            `• Implemented digital oilfield technologies improving efficiency by 45%`,
            `• Partnered with geologists to identify 10+ new drilling locations`
        ];
    }
    return [
        `• Served as Director of Petroleum Engineering at ${company}, overseeing 40+ engineers and $200M budget`,
        `• Led petroleum transformation increasing production by 60%`,
        `• Built petroleum engineering organization from ground up, hiring 35+ engineers`,
        `• Presented petroleum strategy to board and secured $50M for field development`,
        `• Mentored 20 petroleum engineering leaders who now run their own fields`
    ];
};