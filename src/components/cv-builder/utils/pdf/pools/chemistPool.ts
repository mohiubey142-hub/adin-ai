// utils/pools/chemistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getChemistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 200+ chemical analyses and experiments at ${company}`,
            `• Prepared 100+ chemical solutions and compounds with 99% purity`,
            `• Operated 20+ analytical instruments including HPLC and GC-MS`,
            `• Documented 300+ experimental procedures and results`,
            `• Assisted in 30+ research projects in organic and analytical chemistry`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ chemistry research projects in pharmaceuticals and materials at ${company}`,
            `• Developed analytical methods improving detection limits by 50%`,
            `• Published 5+ research papers in peer-reviewed chemistry journals`,
            `• Managed 5+ junior chemists on complex research projects`,
            `• Synthesized 50+ novel compounds for drug discovery`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led chemistry research team of 15 chemists, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove innovation in green chemistry and sustainable materials`,
            `• Built relationships with 25+ academic and industrial research institutions`,
            `• Published 15+ research papers in leading chemistry journals`
        ];
    }
    return [
        `• Served as Director of Chemistry at ${company}, overseeing 35+ chemists and $12M budget`,
        `• Led chemistry research transformation achieving 10+ patentable discoveries`,
        `• Built chemistry research organization from ground up, hiring 30+ chemists`,
        `• Presented research strategy to board and secured $20M for R&D`,
        `• Mentored 15 chemistry leaders who now run their own departments`
    ];
};