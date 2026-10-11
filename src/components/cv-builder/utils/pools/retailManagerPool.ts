// utils/pools/retailManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRetailManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed retail operations with $3M annual revenue at ${company}`,
            `• Supervised 25+ staff members across departments`,
            `• Increased store sales by 25% through merchandising improvements`,
            `• Maintained 99% inventory accuracy across 8,000+ SKUs`,
            `• Documented 300+ retail reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed retail operations with $15M annual revenue at ${company}`,
            `• Led team of 80+ staff across 3 shifts`,
            `• Improved store profitability by 40% through strategic initiatives`,
            `• Implemented retail systems reducing operational costs by 30%`,
            `• Mentored 5 junior retail managers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Managed retail chain of 15 stores with $75M annual revenue at ${company}`,
            `• Defined retail strategy adopted across all stores`,
            `• Drove revenue growth of 50% through strategic initiatives`,
            `• Built relationships with 30+ vendors and retail partners`,
            `• Published 10+ articles on retail management`
        ];
    }
    return [
        `• Served as Director of Retail Operations at ${company}, overseeing 100+ stores and $300M revenue`,
        `• Led retail transformation achieving 70% revenue growth`,
        `• Built retail organization from ground up, hiring 800+ staff`,
        `• Presented retail strategy to board and secured $75M for expansion`,
        `• Mentored 30 retail leaders who now run their own chains`
    ];
};