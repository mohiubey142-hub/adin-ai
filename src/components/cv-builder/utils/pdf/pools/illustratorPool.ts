// utils/pools/illustratorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getIllustratorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 200+ illustrations for digital and print media at ${company}`,
            `• Designed 50+ characters and visual assets for various projects`,
            `• Produced 100+ vector graphics using Adobe Illustrator`,
            `• Collaborated with 10+ clients on custom illustration projects`,
            `• Built a portfolio of 30+ published illustrations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led illustration projects for 15+ major brands at ${company}`,
            `• Developed visual style guides adopted across multiple campaigns`,
            `• Created 500+ illustrations including editorial, advertising, and book art`,
            `• Managed 5+ junior illustrators on complex projects`,
            `• Won 3 illustration awards for creative excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led illustration team of 10 artists, producing 1,000+ illustrations annually at ${company}`,
            `• Defined visual identity adopted across 5 product lines`,
            `• Drove creative innovation winning 5+ industry awards`,
            `• Built relationships with 20+ major clients and publishers`,
            `• Published 10+ articles on illustration techniques`
        ];
    }
    return [
        `• Served as Creative Director at ${company}, overseeing 25+ illustrators and $3M budget`,
        `• Led illustration transformation delivering 10,000+ creative assets`,
        `• Built illustration studio from ground up, hiring 20+ artists`,
        `• Presented creative vision to clients and secured $5M in new projects`,
        `• Mentored 15 illustration leaders who now run their own studios`
    ];
};