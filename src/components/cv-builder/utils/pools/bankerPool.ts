// utils/pools/bankerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBankerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Processed 50+ customer transactions daily with 100% accuracy at ${company}`,
            `• Analyzed customer financial data to recommend banking products, achieving 80% conversion rate`,
            `• Assisted 100+ customers with account opening and loan applications`,
            `• Met 100% of sales targets for 6 consecutive months`,
            `• Built relationships with 100+ customers, maintaining 95% satisfaction rate`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led branch banking operations, managing $10M in deposits at ${company}`,
            `• Developed customer portfolio worth $5M in loans and investments`,
            `• Managed 5 relationship managers, improving customer satisfaction by 30%`,
            `• Achieved 120% of targets for 3 consecutive quarters`,
            `• Built partnerships with 10+ businesses, bringing $2M in new deposits`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led regional banking operations, managing $100M in assets at ${company}`,
            `• Defined banking strategy increasing market share by 15%`,
            `• Drove digital banking initiative improving customer acquisition by 40%`,
            `• Built high-performing team of 20+ bankers with 90% retention rate`,
            `• Represented bank at 5+ industry conferences, sharing best practices`
        ];
    }
    return [
        `• Served as Regional Director, overseeing 50+ branches and $1B in assets`,
        `• Led banking transformation improving profitability by 25%`,
        `• Drove strategy increasing customer base by 50% in 3 years`,
        `• Built banking organization from ground up, hiring 100+ professionals`,
        `• Mentored 15 banking leaders who now run their own branches`
    ];
};