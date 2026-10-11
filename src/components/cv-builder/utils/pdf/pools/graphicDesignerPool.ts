// utils/pools/graphicDesignerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getGraphicDesignerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 200+ social media graphics and marketing materials at ${company}`,
            `• Designed logos and branding that clients loved for 10+ clients`,
            `• Created 50+ designs for digital and print with 95% approval rate`,
            `• Learned Adobe Creative Suite inside out and applied to 100+ projects`,
            `• Collaborated with marketers to bring 20+ campaigns to life`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed brand identity for 20+ companies at ${company}`,
            `• Created marketing campaigns that increased engagement by 80%`,
            `• Led redesign of 5+ websites and applications`,
            `• Built brand guidelines ensuring consistency across 100+ assets`,
            `• Mentored 5 junior designers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led creative team of 12, driving design strategy for $10M brand portfolio at ${company}`,
            `• Defined design vision that became company standard`,
            `• Drove brand transformation that increased brand awareness by 60%`,
            `• Built design operations that improved delivery speed by 40%`,
            `• Partnered with marketing and product teams to build world-class brands`
        ];
    }
    return [
        `• Served as Creative Director, overseeing 25+ designers and $5M budget`,
        `• Led design transformation that won 5 industry awards`,
        `• Built design organization from ground up, hiring 20+ designers across 3 countries`,
        `• Presented design vision to CEO and secured $3M for creative innovation`,
        `• Mentored 8 design leads who now run their own creative teams`
    ];
};