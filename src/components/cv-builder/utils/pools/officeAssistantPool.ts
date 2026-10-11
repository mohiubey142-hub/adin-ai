// utils/pools/officeAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getOfficeAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed 500+ office tasks including filing, scheduling, and correspondence at ${company}`,
            `• Coordinated 100+ meetings and appointments for 10+ executives`,
            `• Processed 1,000+ documents with 100% accuracy`,
            `• Maintained 200+ office supplies inventory with 100% availability`,
            `• Provided excellent administrative support achieving 95% satisfaction`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led office administration team of 5 assistants at ${company}`,
            `• Managed daily office operations for 50+ staff members`,
            `• Implemented office systems reducing administrative time by 35%`,
            `• Trained 8 junior assistants in office procedures`,
            `• Improved office efficiency by 40% through process improvements`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led office administration of 15 assistants, supporting 200+ staff at ${company}`,
            `• Defined office procedures adopted across 3 locations`,
            `• Drove administrative efficiency improvement by 50%`,
            `• Built relationships with 25+ vendors and service providers`,
            `• Published 5+ articles on office management`
        ];
    }
    return [
        `• Served as Director of Administration at ${company}, overseeing 30+ assistants and $2M budget`,
        `• Led administration transformation improving efficiency by 60%`,
        `• Built administration team from ground up, hiring 25+ assistants`,
        `• Presented administration strategy to board and secured $1.5M for office upgrades`,
        `• Mentored 15 administration leaders who now run their own departments`
    ];
};