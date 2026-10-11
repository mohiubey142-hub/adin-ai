// utils/pools/productionManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProductionManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed daily production of 5,000+ units at ${company}`,
            `• Supervised 30+ production workers across shifts`,
            `• Maintained 98% production efficiency with minimal downtime`,
            `• Conducted 200+ quality checks ensuring product standards`,
            `• Documented 300+ production reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed production operations worth $20M annually at ${company}`,
            `• Led team of 100+ production workers across 3 shifts`,
            `• Improved production efficiency by 40% through process optimization`,
            `• Implemented lean manufacturing reducing waste by 50%`,
            `• Mentored 8 junior production supervisors`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led production department of 500+ workers, managing $100M in annual production at ${company}`,
            `• Defined production strategy adopted across 5 plants`,
            `• Drove productivity improvement by 60%`,
            `• Built relationships with 30+ suppliers and customers`,
            `• Published 10+ articles on production management`
        ];
    }
    return [
        `• Served as Director of Production at ${company}, overseeing 1,000+ workers and $200M in production`,
        `• Led production transformation improving efficiency by 70%`,
        `• Built production organization from ground up, hiring 800+ workers`,
        `• Presented production strategy to board and secured $50M for automation`,
        `• Mentored 25 production leaders who now run their own plants`
    ];
};