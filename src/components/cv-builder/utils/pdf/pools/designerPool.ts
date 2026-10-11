// utils/pools/designerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDesignerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 100+ social media graphics and marketing materials at ${company}`,
            `• Prepared files for print production ensuring proper specifications for 50+ projects`,
            `• Assisted senior designers with photo editing and layout adjustments for 30+ projects`,
            `• Organized design assets and maintained file management system for 5+ brands`,
            `• Incorporated feedback from stakeholders to revise 50+ designs`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed comprehensive brand identity systems for 10+ clients at ${company}`,
            `• Created marketing collateral for digital and print campaigns across 20+ channels`,
            `• Collaborated with copywriters and marketers to develop 30+ compelling visual stories`,
            `• Managed multiple projects simultaneously while meeting tight deadlines for 15+ projects`,
            `• Presented design concepts to stakeholders and incorporated feedback for 20+ projects`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led creative team of 5 designers at ${company}, overseeing all visual communications`,
            `• Established design system and brand guidelines used across organization`,
            `• Art directed photoshoots and video production for 10+ major campaigns`,
            `• Increased engagement through visual design improvements by 60%`,
            `• Mentored junior designers and conducted portfolio reviews for 8+ team members`
        ];
    }
    return [
        `• Served as Creative Director at ${company}, leading global brand strategy`,
        `• Managed $2M+ creative budget and led team of 20+ designers and artists`,
        `• Redesigned brand identity resulting in 45% increase in brand recognition`,
        `• Won 5 industry awards for design excellence and innovation`,
        `• Established creative agency partnerships across 3 continents`
    ];
};