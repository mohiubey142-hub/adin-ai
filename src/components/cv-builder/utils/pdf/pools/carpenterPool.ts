// utils/pools/carpenterPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCarpenterBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 50+ wooden structures and furniture with precision at ${company}`,
            `• Operated power tools and hand tools with 100% safety`,
            `• Read and interpreted 100+ blueprints and technical drawings`,
            `• Installed 200+ fixtures and fittings in residential and commercial buildings`,
            `• Maintained 98% client satisfaction through quality craftsmanship`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led carpentry team of 6 carpenters on 20+ construction projects at ${company}`,
            `• Built custom furniture and cabinetry for 50+ clients`,
            `• Trained 8 junior carpenters in advanced woodworking techniques`,
            `• Implemented quality control reducing defects by 50%`,
            `• Completed projects 15% under budget through efficient material use`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed carpentry operations across 3 workshops, managing 25+ carpenters at ${company}`,
            `• Established quality standards and procedures adopted across all projects`,
            `• Led technical training program producing 15+ master carpenters`,
            `• Implemented workshop management system improving efficiency by 45%`,
            `• Partnered with architects and builders to optimize project delivery`
        ];
    }
    return [
        `• Served as Director of Carpentry at ${company}, overseeing 60+ carpenters and $5M revenue`,
        `• Led carpentry transformation improving efficiency by 50% and quality to 99%`,
        `• Built carpentry business from ground up, hiring 50+ carpenters across 5 locations`,
        `• Presented business strategy to board and secured $3M for workshop modernization`,
        `• Mentored 30 carpentry leads who now run their own workshops`
    ];
};