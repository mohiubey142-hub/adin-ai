// utils/pools/medicalSalesRepresentativePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalSalesRepresentativeBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built relationships with 50+ healthcare professionals, achieving 85% customer satisfaction at ${company}`,
            `• Generated $500K in sales of pharmaceutical products in first year`,
            `• Conducted 200+ product presentations and demonstrations to physicians and hospitals`,
            `• Maintained detailed customer database and sales records for 100+ accounts`,
            `• Achieved 100% of quarterly sales targets for 4 consecutive quarters`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led medical sales team of 5 representatives, generating $3M in annual revenue at ${company}`,
            `• Developed and executed territory plans for 5+ districts, increasing market share by 25%`,
            `• Established relationships with 20+ key opinion leaders and hospital formularies`,
            `• Implemented sales training program improving team performance by 40%`,
            `• Negotiated contracts with 10+ hospitals and healthcare systems worth $1.5M`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed medical sales operations across 3 regions, managing 20+ representatives and $15M revenue at ${company}`,
            `• Defined sales strategy and go-to-market plans for 5+ product lines`,
            `• Led product launches achieving 50% market penetration within 6 months`,
            `• Built relationships with 50+ key accounts including major hospital chains`,
            `• Partnered with marketing and medical affairs teams to develop promotional strategies`
        ];
    }
    return [
        `• Served as Vice President of Medical Sales, overseeing 60+ representatives and $50M annual revenue`,
        `• Led sales transformation increasing market share by 40% and revenue by 60%`,
        `• Built medical sales organization from ground up, hiring 50+ professionals across 8 regions`,
        `• Presented sales strategy to board and secured $10M for sales force expansion`,
        `• Mentored 30 sales leads who now manage their own medical sales teams`
    ];
};