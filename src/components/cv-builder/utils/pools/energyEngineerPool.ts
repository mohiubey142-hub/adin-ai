// utils/pools/energyEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEnergyEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in design of 5+ renewable energy systems at ${company}`,
            `• Conducted 100+ energy audits identifying savings of 20%`,
            `• Analyzed 200+ energy data points for optimization`,
            `• Prepared 50+ technical reports on energy efficiency`,
            `• Supported senior engineers in 10+ renewable projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led design and implementation of 10+ renewable energy projects at ${company}`,
            `• Optimized energy systems improving efficiency by 35%`,
            `• Managed $5M in energy projects delivering 40% ROI`,
            `• Implemented smart grid solutions reducing losses by 25%`,
            `• Mentored 5 junior engineers in renewable energy technologies`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led energy engineering team of 15 engineers, managing $50M in projects at ${company}`,
            `• Defined renewable energy strategy adopted across 5 business units`,
            `• Drove sustainability improvements reducing carbon by 45%`,
            `• Built relationships with 20+ energy companies and regulators`,
            `• Published 10+ research papers in energy engineering journals`
        ];
    }
    return [
        `• Served as Director of Energy Engineering at ${company}, overseeing 40+ engineers and $100M budget`,
        `• Led energy transformation achieving 60% renewable energy mix`,
        `• Built energy engineering organization from ground up, hiring 35+ engineers`,
        `• Presented energy strategy to board and secured $50M for renewable projects`,
        `• Mentored 20 energy leaders who now run their own departments`
    ];
};