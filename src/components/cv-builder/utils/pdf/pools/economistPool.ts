// utils/pools/economistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEconomistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 50+ economic analyses on market trends and policies at ${company}`,
            `• Built 30+ economic models for forecasting and policy evaluation`,
            `• Analyzed 100+ datasets using statistical software`,
            `• Prepared 40+ economic reports for management review`,
            `• Assisted in 20+ economic impact assessments`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led economic research on 20+ major projects at ${company}`,
            `• Developed forecasting models improving accuracy by 35%`,
            `• Published 5+ economic papers in peer-reviewed journals`,
            `• Managed 5+ junior economists on complex research projects`,
            `• Advised senior management on 15+ economic policy decisions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led economics team of 12 economists, managing 50+ projects at ${company}`,
            `• Defined economic strategy adopted across 5 business units`,
            `• Drove policy improvements based on economic research`,
            `• Built relationships with 25+ government and financial institutions`,
            `• Published 15+ economic papers in leading journals`
        ];
    }
    return [
        `• Served as Chief Economist at ${company}, overseeing 30+ economists and $5M budget`,
        `• Led economic transformation influencing 10+ national policies`,
        `• Built economics research organization from ground up, hiring 25+ economists`,
        `• Presented economic strategy to board and secured $8M for research initiatives`,
        `• Mentored 15 economic leaders who now run their own departments`
    ];
};