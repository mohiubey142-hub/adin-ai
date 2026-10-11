// utils/pools/productManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProductManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted user research that uncovered 10+ customer needs at ${company}`,
            `• Created product requirements documents for 15+ features`,
            `• Facilitated cross-functional meetings for 20+ projects`,
            `• Analyzed user feedback and prioritized features for 5+ products`,
            `• Launched first product update that increased engagement by 20%`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led product strategy for 3 successful launches, increasing user engagement by 40% at ${company}`,
            `• Used data to prioritize features that generated $2M in annual revenue`,
            `• Managed relationship with 5+ stakeholders across engineering, design, and marketing`,
            `• Created product roadmap that aligned with business goals`,
            `• Launched MVP that got 10K users in first month`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led product team of 12, managing $20M product portfolio at ${company}`,
            `• Defined product vision that drove company growth from $10M to $50M`,
            `• Drove user research program that became company standard`,
            `• Partnered with engineering to improve delivery speed by 30%`,
            `• Presented product strategy to board and secured $5M in funding`
        ];
    }
    return [
        `• Served as Director of Product, overseeing $100M product portfolio and 50+ product professionals`,
        `• Led product transformation that increased NPS from 45 to 78`,
        `• Built product management practice from ground up, hiring 40+ PMs across 5 countries`,
        `• Presented product vision to CEO and secured $20M for innovation`,
        `• Mentored 10 product leads who now run their own product teams`
    ];
};