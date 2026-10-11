// utils/pools/storeManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getStoreManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed retail store with $2M annual revenue at ${company}`,
            `• Supervised 20+ staff members across shifts`,
            `• Increased store sales by 20% through customer service improvements`,
            `• Maintained 99% inventory accuracy across 5,000+ SKUs`,
            `• Documented 300+ store operations reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed retail store with $10M annual revenue at ${company}`,
            `• Led team of 50+ staff across 3 shifts`,
            `• Improved store profitability by 35% through strategic initiatives`,
            `• Implemented inventory management reducing stockouts by 50%`,
            `• Mentored 5 junior store managers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Managed retail chain of 10 stores with $50M annual revenue at ${company}`,
            `• Defined retail strategy adopted across all stores`,
            `• Drove revenue growth of 45% through strategic initiatives`,
            `• Built relationships with 30+ vendors and suppliers`,
            `• Published 10+ articles on retail management`
        ];
    }
    return [
        `• Served as Director of Retail at ${company}, overseeing 50+ stores and $200M revenue`,
        `• Led retail transformation achieving 60% revenue growth`,
        `• Built retail organization from ground up, hiring 500+ staff`,
        `• Presented retail strategy to board and secured $50M for expansion`,
        `• Mentored 25 retail leaders who now run their own chains`
    ];
};