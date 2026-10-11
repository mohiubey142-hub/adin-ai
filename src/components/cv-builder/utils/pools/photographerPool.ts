// utils/pools/photographerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhotographerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Photographed 200+ events, portraits, and product shoots at ${company}`,
            `• Edited 500+ photos using Lightroom and Photoshop`,
            `• Managed 50+ photo shoots for various clients`,
            `• Built a portfolio of 100+ published photographs`,
            `• Assisted senior photographers on 30+ complex shoots`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led photography for 20+ major campaigns at ${company}`,
            `• Developed photography style guides adopted across brands`,
            `• Photographed 500+ events and 1,000+ products`,
            `• Managed 5+ junior photographers on complex projects`,
            `• Won 3 photography awards for creative excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led photography team of 10 photographers, producing 2,000+ shoots annually at ${company}`,
            `• Defined visual identity adopted across 5 product lines`,
            `• Drove creative innovation winning 5+ industry awards`,
            `• Built relationships with 20+ major clients and agencies`,
            `• Published 10+ articles on photography techniques`
        ];
    }
    return [
        `• Served as Director of Photography at ${company}, overseeing 25+ photographers and $3M budget`,
        `• Led photography transformation delivering 10,000+ shoots`,
        `• Built photography studio from ground up, hiring 20+ photographers`,
        `• Presented creative vision to clients and secured $5M in new projects`,
        `• Mentored 15 photography leaders who now run their own studios`
    ];
};