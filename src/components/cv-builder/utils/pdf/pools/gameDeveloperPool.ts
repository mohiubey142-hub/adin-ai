// utils/pools/gameDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getGameDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 5+ game prototypes with Unity and Unreal at ${company}`,
            `• Created game assets and animations that brought worlds to life for 3+ games`,
            `• Wrote clean, efficient code for game mechanics for 5+ projects`,
            `• Fixed 100+ bugs and optimized performance for 3+ games`,
            `• Collaborated with designers and artists to build amazing experiences`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 3 games with 1M+ downloads at ${company}`,
            `• Designed game mechanics that kept players engaged for 100+ hours`,
            `• Architected game engine that reduced development time by 40%`,
            `• Implemented CI/CD pipeline that reduced bug rate by 60%`,
            `• Mentored 5 junior game developers through pair programming`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led game development team of 20, building games with 10M+ players at ${company}`,
            `• Defined game development strategy that became studio standard`,
            `• Drove innovation that won 5 industry awards`,
            `• Created game development framework that improved quality by 50%`,
            `• Partnered with publishing partners to bring games to market`
        ];
    }
    return [
        `• Served as Studio Director, overseeing 100+ developers and $50M budget`,
        `• Led studio transformation that increased revenue by 200%`,
        `• Built game studio from ground up, hiring 80+ developers across 3 studios`,
        `• Presented game strategy to investors and secured $100M for expansion`,
        `• Mentored 15 game dev leads who now run their own studios`
    ];
};