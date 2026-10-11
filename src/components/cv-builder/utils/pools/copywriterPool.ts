// utils/pools/copywriterPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCopywriterBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Wrote 200+ copy pieces for websites, ads, and email campaigns at ${company}`,
            `• Created 50+ blog posts and articles generating 500K+ views`,
            `• Developed 100+ social media captions and posts`,
            `• Conducted 20+ A/B tests improving conversion by 25%`,
            `• Edited 150+ pieces ensuring brand voice consistency`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led copywriting for 10+ major campaigns generating $3M in revenue at ${company}`,
            `• Developed brand voice guidelines adopted across the organization`,
            `• Increased email conversion by 40% through optimized copy`,
            `• Managed 5+ copywriters on complex content projects`,
            `• Mentored 4 junior copywriters in persuasive writing`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led copywriting team of 12 writers, producing 1,000+ pieces annually at ${company}`,
            `• Defined content strategy adopted across 5 product lines`,
            `• Drove conversion improvement of 60% through strategic copy`,
            `• Built relationships with 15+ clients and agencies`,
            `• Published 10+ articles on copywriting best practices`
        ];
    }
    return [
        `• Served as Director of Content at ${company}, overseeing 30+ writers and $5M budget`,
        `• Led content transformation generating $50M+ in revenue`,
        `• Built copywriting organization from ground up, hiring 25+ writers`,
        `• Presented content strategy to board and secured $8M for content marketing`,
        `• Mentored 15 content leaders who now run their own teams`
    ];
};