// utils/pools/tailorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTailorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Stitched 500+ garments including suits, dresses, and shirts at ${company}`,
            `• Took 300+ measurements with 99% accuracy`,
            `• Altered 400+ garments according to client specifications`,
            `• Maintained 98% client satisfaction through quality craftsmanship`,
            `• Documented 300+ orders with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led tailoring team of 5 tailors at ${company}`,
            `• Stitched 1,000+ custom garments annually`,
            `• Trained 8 junior tailors in advanced tailoring techniques`,
            `• Improved production efficiency by 35% through workflow optimization`,
            `• Maintained 99% client satisfaction rating`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led tailoring department of 15 tailors, producing 5,000+ garments annually at ${company}`,
            `• Defined tailoring standards adopted across 3 locations`,
            `• Drove quality improvement reducing alterations by 50%`,
            `• Built relationships with 30+ fashion designers and boutiques`,
            `• Published 5+ articles on tailoring techniques`
        ];
    }
    return [
        `• Served as Director of Tailoring at ${company}, overseeing 30+ tailors and $3M budget`,
        `• Led tailoring transformation improving efficiency by 50%`,
        `• Built tailoring business from ground up, hiring 25+ tailors`,
        `• Presented tailoring strategy to board and secured $2M for modernization`,
        `• Mentored 15 tailoring leaders who now run their own businesses`
    ];
};