// utils/pools/cashierPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCashierBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Processed 500+ customer transactions daily with 99.9% accuracy at ${company}`,
            `• Handled $50,000+ in cash and card payments daily`,
            `• Maintained 100% cash balance accuracy across all shifts`,
            `• Provided excellent customer service achieving 95% satisfaction`,
            `• Documented 1,000+ transactions with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led cashier team of 8 cashiers at ${company}`,
            `• Managed daily cash operations of $200,000+`,
            `• Trained 10 junior cashiers in POS systems and customer service`,
            `• Reduced transaction errors by 60% through quality checks`,
            `• Improved customer checkout speed by 30%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led cashier operations of 25 cashiers, processing $1M+ daily at ${company}`,
            `• Defined cash handling procedures adopted across 5 stores`,
            `• Drove customer satisfaction improvement to 98%`,
            `• Built relationships with 25+ vendors and banking partners`,
            `• Published 5+ articles on cash management best practices`
        ];
    }
    return [
        `• Served as Director of Cash Operations at ${company}, overseeing 50+ cashiers and $5M budget`,
        `• Led cash operations transformation improving efficiency by 50%`,
        `• Built cashier organization from ground up, hiring 40+ cashiers`,
        `• Presented operations strategy to board and secured $2M for POS upgrades`,
        `• Mentored 20 cash operations leaders who now run their own departments`
    ];
};