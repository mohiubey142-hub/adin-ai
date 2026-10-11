// utils/pools/housekeepingSupervisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHousekeepingSupervisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised housekeeping team of 15 staff across 100+ rooms at ${company}`,
            `• Maintained 98% cleanliness standards across all areas`,
            `• Conducted 500+ room inspections ensuring quality`,
            `• Managed inventory of 50+ cleaning supplies with 100% availability`,
            `• Documented 300+ housekeeping reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led housekeeping team of 40+ staff across 300+ rooms at ${company}`,
            `• Improved cleanliness scores by 40% through quality initiatives`,
            `• Trained 15 junior housekeepers in cleaning procedures`,
            `• Implemented housekeeping systems reducing costs by 25%`,
            `• Achieved 95% guest satisfaction with room cleanliness`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led housekeeping department of 100+ staff, managing 1,000+ rooms at ${company}`,
            `• Defined housekeeping standards adopted across 5 properties`,
            `• Drove cleanliness improvement to 99%`,
            `• Built relationships with 25+ vendors and suppliers`,
            `• Published 10+ articles on housekeeping management`
        ];
    }
    return [
        `• Served as Director of Housekeeping at ${company}, overseeing 200+ staff and $5M budget`,
        `• Led housekeeping transformation improving efficiency by 60%`,
        `• Built housekeeping organization from ground up, hiring 150+ staff`,
        `• Presented housekeeping strategy to board and secured $3M for modernization`,
        `• Mentored 20 housekeeping leaders who now run their own departments`
    ];
};