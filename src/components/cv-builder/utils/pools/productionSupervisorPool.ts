// utils/pools/productionSupervisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProductionSupervisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 20+ production workers on daily operations at ${company}`,
            `• Monitored production of 2,000+ units daily ensuring quality`,
            `• Conducted 200+ quality checks with 98% accuracy`,
            `• Maintained 97% production efficiency across shifts`,
            `• Documented 300+ production reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised production team of 50+ workers across 2 shifts at ${company}`,
            `• Managed production of 10,000+ units daily`,
            `• Improved team productivity by 35% through training and motivation`,
            `• Implemented safety programs reducing accidents by 65%`,
            `• Mentored 8 junior production workers in operational procedures`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led production supervision of 150+ workers, managing 50,000+ units daily at ${company}`,
            `• Defined supervision standards adopted across 5 production lines`,
            `• Drove production efficiency improvement by 55%`,
            `• Built relationships with 25+ suppliers and quality teams`,
            `• Published 10+ articles on production supervision`
        ];
    }
    return [
        `• Served as Director of Production Supervision at ${company}, overseeing 300+ supervisors and $100M production`,
        `• Led production supervision transformation improving efficiency by 65%`,
        `• Built supervision organization from ground up, hiring 250+ supervisors`,
        `• Presented production strategy to board and secured $40M for automation`,
        `• Mentored 25 production leaders who now run their own plants`
    ];
};