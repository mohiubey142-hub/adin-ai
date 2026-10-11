// utils/pools/motionDesignerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMotionDesignerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 100+ motion graphics for social media and advertising at ${company}`,
            `• Produced 50+ animated logos and brand assets`,
            `• Designed 80+ animated infographics and explainer videos`,
            `• Collaborated with 10+ clients on motion design projects`,
            `• Built a portfolio of 40+ published motion designs`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led motion design for 15+ major campaigns at ${company}`,
            `• Developed motion guidelines adopted across multiple brands`,
            `• Created 300+ motion graphics using After Effects and Cinema 4D`,
            `• Managed 5+ junior motion designers on complex projects`,
            `• Won 3 motion design awards for creative excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led motion design team of 10 designers, producing 500+ motion assets annually at ${company}`,
            `• Defined motion identity adopted across 5 product lines`,
            `• Drove innovation in interactive and AR motion design`,
            `• Built relationships with 20+ major clients and agencies`,
            `• Published 10+ articles on motion design techniques`
        ];
    }
    return [
        `• Served as Motion Design Director at ${company}, overseeing 25+ designers and $3M budget`,
        `• Led motion transformation delivering 5,000+ motion assets`,
        `• Built motion design studio from ground up, hiring 20+ designers`,
        `• Presented creative vision to clients and secured $6M in new projects`,
        `• Mentored 15 motion design leaders who now run their own studios`
    ];
};