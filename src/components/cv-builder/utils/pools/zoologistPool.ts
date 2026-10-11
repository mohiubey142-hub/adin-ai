// utils/pools/zoologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getZoologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 100+ field studies observing animal behavior and ecology at ${company}`,
            `• Collected and analyzed 500+ biological samples from various species`,
            `• Prepared 80+ research reports on wildlife conservation`,
            `• Assisted in 25+ research projects on animal physiology`,
            `• Documented 200+ field observations with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ zoology research projects in wildlife conservation at ${company}`,
            `• Developed conservation strategies protecting 10+ endangered species`,
            `• Published 5+ research papers in zoology journals`,
            `• Managed 5+ junior zoologists on field research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led zoology research team of 12 scientists, managing 30+ projects at ${company}`,
            `• Defined conservation strategy adopted across the organization`,
            `• Drove wildlife protection improvements by 50%`,
            `• Built relationships with 25+ conservation organizations and governments`,
            `• Published 15+ research papers in leading zoology journals`
        ];
    }
    return [
        `• Served as Director of Zoology at ${company}, overseeing 30+ scientists and $6M budget`,
        `• Led zoology transformation protecting 20+ endangered species`,
        `• Built zoology research organization from ground up, hiring 25+ scientists`,
        `• Presented conservation strategy to board and secured $10M for wildlife programs`,
        `• Mentored 15 zoology leaders who now run their own departments`
    ];
};