// utils/pools/videoEditorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getVideoEditorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Edited 100+ videos for social media, advertising, and corporate at ${company}`,
            `• Produced 50+ short-form videos for TikTok and Instagram`,
            `• Applied 200+ visual effects and transitions`,
            `• Color graded 80+ videos ensuring visual consistency`,
            `• Collaborated with 10+ clients on video projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led video editing for 20+ major campaigns at ${company}`,
            `• Developed editing workflows reducing production time by 35%`,
            `• Edited 300+ videos including commercials and documentaries`,
            `• Managed 5+ junior editors on complex projects`,
            `• Won 3 awards for video editing excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led video editing team of 12 editors, producing 500+ videos annually at ${company}`,
            `• Defined editing standards adopted across 5 product lines`,
            `• Drove innovation in post-production workflows`,
            `• Built relationships with 15+ production houses and clients`,
            `• Published 10+ articles on video editing techniques`
        ];
    }
    return [
        `• Served as Director of Video at ${company}, overseeing 25+ editors and $4M budget`,
        `• Led video transformation delivering 5,000+ videos`,
        `• Built video editing studio from ground up, hiring 20+ editors`,
        `• Presented video strategy to clients and secured $6M in new projects`,
        `• Mentored 15 video leaders who now run their own studios`
    ];
};