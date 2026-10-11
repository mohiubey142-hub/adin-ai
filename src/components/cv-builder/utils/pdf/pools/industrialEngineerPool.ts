// utils/pools/industrialEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getIndustrialEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted time and motion studies for 10+ production lines at ${company}`,
            `• Analyzed 50+ processes identifying efficiency improvements`,
            `• Developed 20+ standard operating procedures for manufacturing`,
            `• Performed 100+ quality inspections ensuring compliance`,
            `• Documented 200+ process improvement recommendations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led process improvement projects improving productivity by 30% at ${company}`,
            `• Implemented lean manufacturing reducing waste by 40%`,
            `• Designed 5+ production systems increasing capacity by 50%`,
            `• Managed $3M in efficiency projects delivering 35% ROI`,
            `• Mentored 5 junior industrial engineers in lean and Six Sigma`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led industrial engineering team of 15 engineers, managing $30M in projects at ${company}`,
            `• Defined operational excellence strategy adopted across 5 plants`,
            `• Drove automation initiative improving productivity by 60%`,
            `• Implemented Six Sigma program achieving 99.9% quality`,
            `• Partnered with operations to optimize supply chain and logistics`
        ];
    }
    return [
        `• Served as Director of Industrial Engineering at ${company}, overseeing 40+ engineers and $50M budget`,
        `• Led operational transformation improving profitability by 50%`,
        `• Built industrial engineering organization from ground up, hiring 30+ engineers`,
        `• Presented operational strategy to board and secured $20M for automation`,
        `• Mentored 20 industrial engineering leaders who now run their own plants`
    ];
};