// utils/pools/literaturePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLiteratureBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed 100+ literary works across various genres and periods at ${company}`,
            `• Wrote 50+ literary critiques and essays`,
            `• Researched 200+ literary sources and references`,
            `• Assisted in 20+ literature research projects`,
            `• Documented 300+ literary analyses with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ literature research projects on various themes at ${company}`,
            `• Developed analytical frameworks improving literary analysis by 40%`,
            `• Published 5+ books and 20+ articles on literature`,
            `• Managed 5+ junior literature researchers on complex projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led literature research team of 12 researchers, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove literary education and cultural preservation improvements`,
            `• Built relationships with 25+ universities and literary institutions`,
            `• Published 15+ books and 50+ articles on literature`
        ];
    }
    return [
        `• Served as Director of Literature at ${company}, overseeing 30+ researchers and $3M budget`,
        `• Led literature transformation influencing 10+ academic disciplines`,
        `• Built literature research organization from ground up, hiring 25+ researchers`,
        `• Presented research strategy to board and secured $5M for literary programs`,
        `• Mentored 15 literature leaders who now run their own departments`
    ];
};