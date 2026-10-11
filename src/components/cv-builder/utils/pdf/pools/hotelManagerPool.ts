// utils/pools/hotelManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHotelManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed daily operations of 50+ room hotel at ${company}`,
            `• Supervised 20+ staff members across departments`,
            `• Achieved 90% guest satisfaction rating through quality service`,
            `• Managed $1M annual budget with 100% accountability`,
            `• Implemented 10+ operational improvements increasing efficiency by 20%`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed 200+ room hotel with $10M annual revenue at ${company}`,
            `• Led team of 80+ staff across 6 departments`,
            `• Improved occupancy rate from 65% to 85% through strategic initiatives`,
            `• Increased revenue by 25% through pricing and marketing strategies`,
            `• Mentored 5 junior managers in hospitality operations`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led hotel group of 5 properties with $50M annual revenue at ${company}`,
            `• Defined hospitality strategy adopted across all properties`,
            `• Drove guest satisfaction improvement to 95%`,
            `• Built relationships with 25+ corporate clients and travel partners`,
            `• Published 10+ articles on hospitality management`
        ];
    }
    return [
        `• Served as Director of Hospitality at ${company}, overseeing 20+ hotels and $200M revenue`,
        `• Led hospitality transformation achieving 40% revenue growth`,
        `• Built hotel group from ground up, hiring 500+ professionals across 20 properties`,
        `• Presented hospitality strategy to board and secured $100M for expansion`,
        `• Mentored 25 hospitality leaders who now run their own hotel groups`
    ];
};