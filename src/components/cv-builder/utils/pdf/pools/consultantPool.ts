// utils/pools/consultantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getConsultantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted market research and analysis for 10+ client projects at ${company}`,
            `• Developed 15+ business cases and financial models for client recommendations`,
            `• Facilitated 30+ client workshops and stakeholder interviews`,
            `• Analyzed operational data identifying $2M in client cost savings`,
            `• Prepared 20+ client presentations and reports with actionable insights`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led consulting engagements for 8+ clients, delivering $10M in value at ${company}`,
            `• Developed business strategy that increased client revenue by 25%`,
            `• Managed cross-functional teams of 5+ consultants on complex projects`,
            `• Implemented process improvements reducing client costs by 30%`,
            `• Mentored 4 junior consultants in consulting methodologies and client management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led consulting practice of 20+ consultants, delivering $50M in client value at ${company}`,
            `• Defined consulting methodology adopted across the firm`,
            `• Drove strategic initiatives improving client profitability by 40%`,
            `• Built relationships with C-level executives at 15+ enterprise clients`,
            `• Published 10+ thought leadership articles in industry publications`
        ];
    }
    return [
        `• Served as Managing Partner at ${company}, overseeing 50+ consultants and $25M revenue`,
        `• Led consulting transformation increasing practice revenue by 60%`,
        `• Built consulting practice from ground up, hiring 40+ consultants across 5 offices`,
        `• Presented growth strategy to partners and secured $15M for practice expansion`,
        `• Mentored 20 consulting leaders who now run their own practices`
    ];
};