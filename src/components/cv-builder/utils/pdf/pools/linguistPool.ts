// utils/pools/linguistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLinguistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed 100+ language samples for phonetic and syntactic patterns at ${company}`,
            `• Translated 200+ documents between 3+ languages with 95% accuracy`,
            `• Conducted 50+ linguistic research studies on language structure`,
            `• Documented 300+ linguistic data points with 100% accuracy`,
            `• Assisted in 20+ language documentation and preservation projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ linguistic research projects on language evolution at ${company}`,
            `• Developed language learning programs improving proficiency by 40%`,
            `• Published 5+ research papers in linguistics journals`,
            `• Managed 5+ junior linguists on complex research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led linguistics research team of 12 linguists, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove language preservation and education improvements`,
            `• Built relationships with 25+ universities and cultural institutions`,
            `• Published 15+ research papers in leading linguistics journals`
        ];
    }
    return [
        `• Served as Director of Linguistics at ${company}, overseeing 30+ linguists and $4M budget`,
        `• Led linguistics transformation preserving 20+ endangered languages`,
        `• Built linguistics research organization from ground up, hiring 25+ linguists`,
        `• Presented research strategy to board and secured $6M for language programs`,
        `• Mentored 15 linguistics leaders who now run their own departments`
    ];
};