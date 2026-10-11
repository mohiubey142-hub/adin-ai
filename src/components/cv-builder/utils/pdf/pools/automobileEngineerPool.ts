// utils/pools/automobileEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAutomobileEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in design and development of 5+ vehicle components using CAD software at ${company}`,
            `• Conducted 50+ vehicle performance tests, analyzing data to improve efficiency by 15%`,
            `• Collaborated with manufacturing teams to resolve 20+ production issues`,
            `• Performed root cause analysis on 30+ vehicle defects, implementing solutions that reduced complaints by 40%`,
            `• Supported senior engineers in 3 major vehicle platform development projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led design and development of 2 vehicle platforms, achieving 20% weight reduction at ${company}`,
            `• Optimized engine performance, improving fuel efficiency by 18% and reducing emissions by 25%`,
            `• Managed 5+ vehicle testing programs across 3 countries, ensuring compliance with international standards`,
            `• Implemented design improvements reducing manufacturing costs by $2M annually`,
            `• Mentored 5 junior engineers in vehicle dynamics and CAD design`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led automobile engineering team of 25+ engineers at ${company}, delivering 3 new vehicle models`,
            `• Defined vehicle architecture strategy adopted across 5 product lines`,
            `• Drove innovation in electric vehicle technology, increasing range by 30%`,
            `• Created engineering processes reducing time-to-market by 25% for new models`,
            `• Partnered with suppliers to develop 10+ advanced automotive components`
        ];
    }
    return [
        `• Served as Director of Automobile Engineering, overseeing $50M vehicle development and 100+ engineers`,
        `• Led electric vehicle transformation, launching 3 EV models with 400+ km range`,
        `• Built engineering organization from ground up, hiring 80+ professionals across 6 countries`,
        `• Presented vehicle strategy to CEO and secured $100M for EV platform development`,
        `• Mentored 20 engineering leaders who now manage their own vehicle programs`
    ];
};