// utils/pools/environmentalEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEnvironmentalEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 100+ environmental assessments for 20+ projects at ${company}`,
            `• Monitored air, water, and soil quality across 15+ sites`,
            `• Prepared 50+ environmental impact reports for regulatory compliance`,
            `• Implemented 20+ pollution control measures reducing emissions by 30%`,
            `• Documented 200+ environmental data points and analysis reports`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led environmental compliance for 10+ major projects worth $50M at ${company}`,
            `• Developed sustainability programs reducing carbon footprint by 40%`,
            `• Managed 5+ environmental remediation projects`,
            `• Achieved ISO 14001 certification for 3 facilities`,
            `• Mentored 5 junior environmental engineers in compliance and sustainability`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led environmental engineering team of 15 engineers, managing $75M in projects at ${company}`,
            `• Defined environmental strategy adopted across 5 business units`,
            `• Drove innovation in renewable energy and waste reduction`,
            `• Achieved carbon neutrality for 3 major facilities`,
            `• Partnered with regulators to develop environmental policies`
        ];
    }
    return [
        `• Served as Director of Environmental Engineering at ${company}, overseeing 40+ engineers and $100M budget`,
        `• Led environmental transformation achieving 60% carbon reduction`,
        `• Built environmental engineering organization from ground up, hiring 35+ engineers`,
        `• Presented environmental strategy to board and secured $30M for sustainability initiatives`,
        `• Mentored 20 environmental engineering leaders who now run their own departments`
    ];
};