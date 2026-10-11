// utils/pools/biologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBiologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 150+ biological experiments in genetics and ecology at ${company}`,
            `• Collected and analyzed 500+ biological samples`,
            `• Prepared 80+ research reports and scientific papers`,
            `• Assisted in 25+ research projects in molecular biology`,
            `• Documented 200+ experimental results with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ biology research projects in genetics and biotechnology at ${company}`,
            `• Developed research protocols improving reproducibility by 45%`,
            `• Published 5+ research papers in peer-reviewed biology journals`,
            `• Managed 5+ junior biologists on complex research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led biology research team of 15 biologists, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove innovation in genomics and synthetic biology`,
            `• Built relationships with 25+ academic and biotech research institutions`,
            `• Published 15+ research papers in leading biology journals`
        ];
    }
    return [
        `• Served as Director of Biology at ${company}, overseeing 35+ biologists and $10M budget`,
        `• Led biology research transformation achieving 5+ breakthrough discoveries`,
        `• Built biology research organization from ground up, hiring 30+ biologists`,
        `• Presented research strategy to board and secured $15M for advanced research`,
        `• Mentored 15 biology leaders who now run their own departments`
    ];
};