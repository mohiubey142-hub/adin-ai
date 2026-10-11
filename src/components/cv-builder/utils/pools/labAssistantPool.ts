// utils/pools/labAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLabAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 1,000+ laboratory samples for testing at ${company}`,
            `• Maintained 200+ laboratory instruments ensuring 99% uptime`,
            `• Performed 500+ routine laboratory tests with 98% accuracy`,
            `• Managed inventory of 300+ laboratory supplies and reagents`,
            `• Documented 400+ test results with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led laboratory assistant team of 5 professionals at ${company}`,
            `• Managed 2,000+ samples monthly with 99.5% accuracy`,
            `• Implemented quality control reducing errors by 50%`,
            `• Trained 8 junior lab assistants in laboratory procedures`,
            `• Improved lab efficiency by 35% through workflow optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led laboratory operations of 15 assistants, processing 10,000+ samples annually at ${company}`,
            `• Defined laboratory protocols adopted across 3 facilities`,
            `• Drove quality improvement reducing contamination by 70%`,
            `• Built relationships with 20+ research institutions and hospitals`,
            `• Published 5+ articles on laboratory management`
        ];
    }
    return [
        `• Served as Director of Laboratory Operations at ${company}, overseeing 30+ assistants and $2M budget`,
        `• Led laboratory transformation improving efficiency by 50%`,
        `• Built laboratory operations from ground up, hiring 25+ assistants`,
        `• Presented laboratory strategy to board and secured $1.5M for equipment`,
        `• Mentored 15 laboratory leaders who now run their own facilities`
    ];
};