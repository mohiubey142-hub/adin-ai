// utils/pools/tourismOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTourismOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Promoted tourism destinations to 10,000+ potential visitors at ${company}`,
            `• Organized 30+ tourism events and promotional campaigns`,
            `• Developed 20+ tourism packages and itineraries`,
            `• Managed social media campaigns reaching 500K+ people`,
            `• Documented 200+ tourism reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led tourism promotion team of 5 officers at ${company}`,
            `• Developed tourism strategies increasing visitors by 40%`,
            `• Organized 50+ major tourism events and festivals`,
            `• Managed $1M tourism marketing budget with 30% ROI`,
            `• Trained 8 junior officers in tourism promotion`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led tourism department of 15 officers, managing $10M tourism budget at ${company}`,
            `• Defined tourism strategy adopted across 5 regions`,
            `• Drove tourism growth of 60% through strategic initiatives`,
            `• Built relationships with 30+ tourism boards and travel agencies`,
            `• Published 10+ articles on tourism development`
        ];
    }
    return [
        `• Served as Director of Tourism at ${company}, overseeing 40+ officers and $50M budget`,
        `• Led tourism transformation achieving 80% growth in visitors`,
        `• Built tourism organization from ground up, hiring 35+ officers`,
        `• Presented tourism strategy to government and secured $30M for development`,
        `• Mentored 20 tourism leaders who now run their own departments`
    ];
};