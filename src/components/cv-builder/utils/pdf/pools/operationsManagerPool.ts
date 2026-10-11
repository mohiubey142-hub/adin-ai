// utils/pools/operationsManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getOperationsManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed daily operations across 5 teams at ${company}`,
            `• Streamlined processes that improved efficiency by 20%`,
            `• Maintained operational metrics and reports for 10+ projects`,
            `• Collaborated with cross-functional teams to achieve goals for 15+ projects`,
            `• Identified and resolved operational bottlenecks for 5+ processes`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led operations team of 15, improving productivity by 35% at ${company}`,
            `• Implemented new processes that reduced costs by 20%`,
            `• Managed $5M budget and delivered 10% under budget`,
            `• Built relationships with 20+ vendors and partners`,
            `• Mentored 5 junior operations managers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led operations team of 50, managing $50M budget at ${company}`,
            `• Defined operational strategy that became company standard`,
            `• Drove transformation that improved operational efficiency by 40%`,
            `• Created operational excellence program that saved $10M annually`,
            `• Partnered with executive team to align operations with business goals`
        ];
    }
    return [
        `• Served as VP of Operations, overseeing 200+ staff and $200M budget`,
        `• Led operations transformation that improved profitability by 30%`,
        `• Built operations organization from ground up, hiring 150+ professionals across 8 countries`,
        `• Presented operations strategy to CEO and secured $50M for modernization`,
        `• Mentored 20 operations leaders who now run their own operations`
    ];
};