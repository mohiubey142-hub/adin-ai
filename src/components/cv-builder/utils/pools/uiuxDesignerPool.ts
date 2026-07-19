// utils/pools/uiuxDesignerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getUiuxDesignerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed interfaces that users actually enjoyed using for 10+ products at ${company}`,
            `• Created wireframes and prototypes that brought ideas to life for 15+ projects`,
            `• Collaborated with product managers to define user needs for 10+ projects`,
            `• Conducted usability testing and fixed 50+ issues`,
            `• Built design systems that made development faster for 3+ products`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed user experience that increased engagement by 40% at ${company}`,
            `• Led redesign of core product, increasing user satisfaction by 30%`,
            `• Managed relationship with 5+ stakeholders across product and engineering`,
            `• Built design research program that uncovered 20+ user needs`,
            `• Created design system used by 3 product teams`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led design team of 15, driving design strategy for $100M product portfolio at ${company}`,
            `• Defined design vision that became company standard`,
            `• Drove design transformation that improved NPS from 55 to 78`,
            `• Partnered with engineering to build design system improving development speed by 50%`,
            `• Presented design strategy to board and secured $5M for design innovation`
        ];
    }
    return [
        `• Served as Director of Design, overseeing $20M design budget and 30+ design professionals`,
        `• Led design transformation that increased user satisfaction by 60%`,
        `• Built design organization from ground up, hiring 25+ designers across 5 countries`,
        `• Presented design vision to CEO and secured $10M for design innovation`,
        `• Mentored 6 design leads who now run their own design teams`
    ];
};