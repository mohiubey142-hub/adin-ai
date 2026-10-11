// utils/pools/chemicalEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getChemicalEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in design and optimization of 5+ chemical processes at ${company}`,
            `• Conducted 100+ laboratory experiments analyzing chemical properties`,
            `• Monitored 20+ production processes ensuring quality standards`,
            `• Performed 50+ safety audits identifying and resolving hazards`,
            `• Documented 200+ process parameters and test results`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led process optimization projects improving yield by 25% at ${company}`,
            `• Designed 3+ chemical production units increasing capacity by 40%`,
            `• Implemented safety protocols reducing incidents by 60%`,
            `• Managed $5M in process improvement projects delivering 30% ROI`,
            `• Mentored 5 junior chemical engineers in process design and safety`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led chemical engineering team of 15 engineers, managing $50M in projects at ${company}`,
            `• Defined process safety standards adopted across 3 plants`,
            `• Drove innovation in sustainable chemistry reducing waste by 50%`,
            `• Implemented advanced process control improving efficiency by 35%`,
            `• Partnered with R&D to commercialize 5+ new chemical products`
        ];
    }
    return [
        `• Served as Director of Chemical Engineering at ${company}, overseeing 40+ engineers and $100M budget`,
        `• Led chemical transformation improving profitability by 45%`,
        `• Built chemical engineering organization from ground up, hiring 35+ engineers`,
        `• Presented chemical strategy to board and secured $30M for plant modernization`,
        `• Mentored 20 chemical engineering leaders who now run their own plants`
    ];
};