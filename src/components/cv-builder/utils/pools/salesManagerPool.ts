// utils/pools/salesManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSalesManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed sales team of 5 executives generating $1M in revenue at ${company}`,
            `• Coached 5 sales executives improving performance by 30%`,
            `• Developed 10+ sales strategies increasing conversion by 25%`,
            `• Conducted 200+ sales meetings and client presentations`,
            `• Documented 300+ sales activities with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed sales team of 15 executives generating $10M in revenue at ${company}`,
            `• Developed sales strategies increasing revenue by 50%`,
            `• Coached 10 sales executives to exceed targets by 30%`,
            `• Built relationships with 100+ enterprise clients`,
            `• Mentored 5 junior sales managers in team leadership`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led sales department of 50+ executives, managing $50M in revenue at ${company}`,
            `• Defined sales strategy adopted across 5 regions`,
            `• Drove revenue growth of 70% through strategic initiatives`,
            `• Built relationships with 200+ enterprise clients and partners`,
            `• Published 10+ articles on sales management`
        ];
    }
    return [
        `• Served as VP of Sales at ${company}, overseeing 100+ executives and $200M revenue`,
        `• Led sales transformation achieving 100% revenue growth`,
        `• Built sales organization from ground up, hiring 80+ executives`,
        `• Presented sales strategy to board and secured $50M for expansion`,
        `• Mentored 30 sales leaders who now run their own teams`
    ];
};