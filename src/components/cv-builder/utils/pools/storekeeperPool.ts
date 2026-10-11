// utils/pools/storekeeperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getStorekeeperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed inventory of 5,000+ items worth $500K at ${company}`,
            `• Processed 1,000+ stock movements monthly with 99% accuracy`,
            `• Conducted 100+ inventory audits ensuring 100% stock accuracy`,
            `• Maintained 500+ SKU records with 100% accuracy`,
            `• Documented 800+ stock transactions with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led storekeeping team of 6 professionals at ${company}`,
            `• Managed inventory of $2M with 99.5% accuracy`,
            `• Implemented inventory management system reducing stockouts by 45%`,
            `• Trained 8 junior storekeepers in inventory procedures`,
            `• Improved stock turnover by 30% through efficient management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led storekeeping operations of 15 professionals, managing $10M inventory at ${company}`,
            `• Defined inventory standards adopted across 3 warehouses`,
            `• Drove inventory accuracy improvement to 99.9%`,
            `• Built relationships with 25+ suppliers and logistics partners`,
            `• Published 5+ articles on inventory management`
        ];
    }
    return [
        `• Served as Director of Stores at ${company}, overseeing 30+ storekeepers and $5M budget`,
        `• Led storekeeping transformation improving efficiency by 50%`,
        `• Built storekeeping organization from ground up, hiring 25+ professionals`,
        `• Presented inventory strategy to board and secured $3M for systems`,
        `• Mentored 15 storekeeping leaders who now run their own warehouses`
    ];
};