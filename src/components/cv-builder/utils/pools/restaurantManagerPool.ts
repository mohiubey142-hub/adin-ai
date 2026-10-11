// utils/pools/restaurantManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRestaurantManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed restaurant operations with $1M annual revenue at ${company}`,
            `• Supervised 30+ staff members across kitchen and service`,
            `• Increased restaurant revenue by 20% through menu optimization`,
            `• Maintained 95% customer satisfaction rating`,
            `• Documented 300+ restaurant operations reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed restaurant operations with $5M annual revenue at ${company}`,
            `• Led team of 80+ staff across 3 shifts`,
            `• Improved restaurant profitability by 35% through strategic initiatives`,
            `• Implemented food safety programs reducing incidents by 60%`,
            `• Mentored 5 junior restaurant managers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Managed restaurant chain of 10 locations with $25M annual revenue at ${company}`,
            `• Defined restaurant strategy adopted across all locations`,
            `• Drove revenue growth of 45% through strategic initiatives`,
            `• Built relationships with 30+ suppliers and food vendors`,
            `• Published 10+ articles on restaurant management`
        ];
    }
    return [
        `• Served as Director of Restaurant Operations at ${company}, overseeing 50+ restaurants and $100M revenue`,
        `• Led restaurant transformation achieving 60% revenue growth`,
        `• Built restaurant organization from ground up, hiring 500+ staff`,
        `• Presented restaurant strategy to board and secured $30M for expansion`,
        `• Mentored 25 restaurant leaders who now run their own chains`
    ];
};