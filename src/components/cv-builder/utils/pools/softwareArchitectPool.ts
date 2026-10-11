// utils/pools/softwareArchitectPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSoftwareArchitectBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed architecture for 5+ software systems handling 10K+ users at ${company}`,
            `• Created technical documentation for 10+ system designs`,
            `• Participated in 20+ architecture reviews providing technical guidance`,
            `• Implemented design patterns improving code maintainability by 40%`,
            `• Collaborated with development teams to ensure architectural compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected 10+ enterprise systems handling 1M+ users at ${company}`,
            `• Defined microservices architecture adopted across 3 product lines`,
            `• Improved system scalability by 300% through architectural improvements`,
            `• Led technical design reviews for 20+ major projects`,
            `• Mentored 8 developers in software architecture and design patterns`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led architecture team of 10 architects, designing systems for 10M+ users at ${company}`,
            `• Defined enterprise architecture strategy adopted across the organization`,
            `• Improved system performance by 70% through architectural optimization`,
            `• Established architecture review process reducing technical debt by 50%`,
            `• Partnered with CTO to align technology strategy with business goals`
        ];
    }
    return [
        `• Served as Chief Architect at ${company}, overseeing 25+ architects and $10M budget`,
        `• Led architecture transformation supporting 100M+ users`,
        `• Built architecture organization from ground up, hiring 20+ architects`,
        `• Presented architecture strategy to board and secured $15M for platform development`,
        `• Mentored 15 architecture leaders who now run their own teams`
    ];
};