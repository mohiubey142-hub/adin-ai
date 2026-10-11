// utils/pools/siteEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSiteEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 10+ construction sites ensuring quality and safety at ${company}`,
            `• Conducted 200+ site inspections with 100% compliance`,
            `• Coordinated with 20+ contractors and suppliers`,
            `• Managed 100+ construction activities ensuring on-time completion`,
            `• Documented 300+ site reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed construction projects worth $10M at ${company}`,
            `• Led team of 30+ workers across multiple sites`,
            `• Improved project efficiency by 40% through better coordination`,
            `• Implemented quality control reducing defects by 50%`,
            `• Mentored 5 junior site engineers in construction management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led site engineering team of 12 engineers, managing $50M projects at ${company}`,
            `• Defined site engineering standards adopted across 5 projects`,
            `• Drove project delivery improvement by 55%`,
            `• Built relationships with 30+ contractors and consultants`,
            `• Published 10+ articles on site engineering`
        ];
    }
    return [
        `• Served as Director of Site Engineering at ${company}, overseeing 40+ engineers and $100M projects`,
        `• Led site engineering transformation delivering 50+ major projects on time`,
        `• Built site engineering organization from ground up, hiring 35+ engineers`,
        `• Presented engineering strategy to board and secured $50M for new projects`,
        `• Mentored 20 site engineering leaders who now run their own projects`
    ];
};