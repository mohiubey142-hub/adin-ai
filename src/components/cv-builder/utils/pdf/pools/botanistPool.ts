// utils/pools/botanistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBotanistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 100+ plant studies on taxonomy and physiology at ${company}`,
            `• Collected and analyzed 500+ plant specimens`,
            `• Prepared 80+ research reports on plant ecology`,
            `• Assisted in 25+ research projects on plant genetics`,
            `• Documented 200+ field observations with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ botany research projects in plant conservation at ${company}`,
            `• Developed cultivation methods improving yield by 40%`,
            `• Published 5+ research papers in botany journals`,
            `• Managed 5+ junior botanists on research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led botany research team of 12 scientists, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove innovation in plant biotechnology and conservation`,
            `• Built relationships with 25+ botanical gardens and research institutions`,
            `• Published 15+ research papers in leading botany journals`
        ];
    }
    return [
        `• Served as Director of Botany at ${company}, overseeing 30+ scientists and $5M budget`,
        `• Led botany transformation protecting 20+ endangered plant species`,
        `• Built botany research organization from ground up, hiring 25+ scientists`,
        `• Presented research strategy to board and secured $8M for conservation programs`,
        `• Mentored 15 botany leaders who now run their own departments`
    ];
};