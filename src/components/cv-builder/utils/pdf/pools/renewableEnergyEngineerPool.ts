// utils/pools/renewableEnergyEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRenewableEnergyEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed 10+ solar and wind energy systems at ${company}`,
            `• Conducted site assessments and feasibility studies for 15+ projects`,
            `• Analyzed energy data and optimized system performance for 10+ projects`,
            `• Prepared technical reports and project documentation for 20+ projects`,
            `• Collaborated with installation teams to ensure design accuracy for 10+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led design of 50+ renewable energy projects worth $20M at ${company}`,
            `• Developed feasibility studies that secured $5M in funding`,
            `• Optimized energy systems, improving efficiency by 20%`,
            `• Created engineering standards adopted across the department`,
            `• Mentored 5 junior engineers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led engineering team of 25, delivering $100M in renewable projects at ${company}`,
            `• Defined renewable energy strategy that became company standard`,
            `• Drove innovation that reduced project costs by 30%`,
            `• Presented energy strategy to government and secured policy support`,
            `• Built partnerships with 5+ international energy firms`
        ];
    }
    return [
        `• Served as Director of Renewable Energy, overseeing 100+ engineers and $500M portfolio`,
        `• Led renewable transformation that increased capacity by 200%`,
        `• Built engineering organization from ground up, hiring 80+ professionals across 4 countries`,
        `• Presented renewable strategy to board and secured $200M for innovation`,
        `• Mentored 25 engineering leads who now run their own teams`
    ];
};