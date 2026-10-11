// utils/pools/textileEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTextileEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in textile production of 10,000+ meters daily at ${company}`,
            `• Conducted 200+ quality tests on fabrics and yarns`,
            `• Monitored 20+ production processes ensuring quality standards`,
            `• Documented 300+ production reports with 100% accuracy`,
            `• Maintained 98% production efficiency across all lines`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led textile production team of 8 engineers at ${company}`,
            `• Managed production of 50,000+ meters daily`,
            `• Improved production efficiency by 40% through process optimization`,
            `• Implemented quality control reducing defects by 55%`,
            `• Trained 10 junior engineers in textile production`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led textile engineering department of 15 engineers, managing $50M in production at ${company}`,
            `• Defined textile production standards adopted across 5 mills`,
            `• Drove production efficiency improvement by 60%`,
            `• Built relationships with 30+ suppliers and buyers`,
            `• Published 10+ articles on textile engineering`
        ];
    }
    return [
        `• Served as Director of Textile Engineering at ${company}, overseeing 40+ engineers and $100M production`,
        `• Led textile transformation improving efficiency by 70%`,
        `• Built textile engineering organization from ground up, hiring 35+ engineers`,
        `• Presented textile strategy to board and secured $25M for modernization`,
        `• Mentored 20 textile leaders who now run their own mills`
    ];
};