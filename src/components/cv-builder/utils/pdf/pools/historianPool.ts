// utils/pools/historianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHistorianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Researched 100+ historical documents and archives at ${company}`,
            `• Wrote 50+ historical articles and research papers`,
            `• Analyzed 200+ primary and secondary sources`,
            `• Assisted in 20+ historical research projects`,
            `• Documented 300+ research findings with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ historical research projects on various periods at ${company}`,
            `• Developed research methodologies improving accuracy by 40%`,
            `• Published 5+ books and 20+ articles on history`,
            `• Managed 5+ junior historians on complex research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led history research team of 12 historians, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove historical preservation and education improvements`,
            `• Built relationships with 25+ museums, archives, and universities`,
            `• Published 15+ books and 50+ articles on history`
        ];
    }
    return [
        `• Served as Director of Historical Research at ${company}, overseeing 30+ historians and $4M budget`,
        `• Led historical transformation preserving 100+ important archives`,
        `• Built history research organization from ground up, hiring 25+ historians`,
        `• Presented research strategy to board and secured $6M for preservation programs`,
        `• Mentored 15 history leaders who now run their own departments`
    ];
};