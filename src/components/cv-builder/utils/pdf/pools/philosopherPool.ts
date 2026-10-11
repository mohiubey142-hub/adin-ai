// utils/pools/philosopherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhilosopherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Researched 100+ philosophical texts and theories at ${company}`,
            `• Wrote 50+ philosophical essays and papers`,
            `• Analyzed 200+ philosophical arguments and concepts`,
            `• Assisted in 20+ philosophy research projects`,
            `• Documented 300+ research findings with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ philosophy research projects on ethics and metaphysics at ${company}`,
            `• Developed analytical frameworks improving philosophical analysis by 40%`,
            `• Published 5+ books and 20+ articles on philosophy`,
            `• Managed 5+ junior philosophers on complex research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led philosophy research team of 12 philosophers, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove ethical and philosophical education improvements`,
            `• Built relationships with 25+ universities and research institutions`,
            `• Published 15+ books and 50+ articles on philosophy`
        ];
    }
    return [
        `• Served as Director of Philosophy at ${company}, overseeing 30+ philosophers and $3M budget`,
        `• Led philosophy transformation influencing 10+ academic disciplines`,
        `• Built philosophy research organization from ground up, hiring 25+ philosophers`,
        `• Presented research strategy to board and secured $5M for research initiatives`,
        `• Mentored 15 philosophy leaders who now run their own departments`
    ];
};