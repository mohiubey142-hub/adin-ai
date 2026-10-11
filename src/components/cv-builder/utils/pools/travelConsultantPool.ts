// utils/pools/travelConsultantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTravelConsultantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Planned 200+ travel itineraries for clients at ${company}`,
            `• Booked 500+ flights, hotels, and tours for clients`,
            `• Managed travel budgets totaling $1M with 100% accountability`,
            `• Resolved 100+ travel issues ensuring client satisfaction`,
            `• Documented 300+ travel plans with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led travel consulting team of 5 consultants at ${company}`,
            `• Planned 500+ complex travel itineraries`,
            `• Managed travel budgets totaling $5M with 15% cost savings`,
            `• Trained 8 junior consultants in travel planning`,
            `• Improved client satisfaction scores by 40%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led travel consulting department of 15 consultants, managing $20M in travel at ${company}`,
            `• Defined travel consulting standards adopted across 5 branches`,
            `• Drove client satisfaction improvement to 98%`,
            `• Built relationships with 30+ travel partners and vendors`,
            `• Published 10+ articles on travel consulting`
        ];
    }
    return [
        `• Served as Director of Travel Services at ${company}, overseeing 40+ consultants and $100M in travel`,
        `• Led travel transformation improving client satisfaction by 60%`,
        `• Built travel consulting organization from ground up, hiring 35+ consultants`,
        `• Presented travel strategy to board and secured $20M for expansion`,
        `• Mentored 20 travel consulting leaders who now run their own agencies`
    ];
};