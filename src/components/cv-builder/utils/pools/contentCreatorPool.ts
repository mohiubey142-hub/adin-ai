// utils/pools/contentCreatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getContentCreatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Wrote 50+ content pieces that connected with readers at ${company}`,
            `• Edited 200+ content pieces for accuracy and clarity`,
            `• Collaborated with designers to create content for 10+ campaigns`,
            `• Analyzed content performance and optimized for 5+ platforms`,
            `• Published on 3 platforms and built first 1,000 followers`
        ];
    }
    if (level === 'mid') {
        return [
            `• Created content strategy generating 500K+ views monthly at ${company}`,
            `• Led editorial calendar for 5 channels, ensuring consistent quality`,
            `• Managed 3 freelance writers, delivering exceptional content`,
            `• Optimized content for SEO, increasing organic traffic by 120%`,
            `• Built personal brand with 50K+ followers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led content team of 12, driving $10M in revenue through content at ${company}`,
            `• Defined content strategy that became company standard`,
            `• Built content operations producing 100+ pieces monthly without burnout`,
            `• Partnered with product, marketing, and sales to align content with business goals`,
            `• Created content measurement framework proving ROI of every piece`
        ];
    }
    return [
        `• Served as Director of Content, overseeing $20M content budget and 50+ content creators`,
        `• Led content transformation increasing brand awareness by 200%`,
        `• Built content organization from ground up, hiring 40+ creators across 6 countries`,
        `• Presented content strategy to CEO and secured $10M for content innovation`,
        `• Mentored 8 content leads who now run their own content teams`
    ];
};