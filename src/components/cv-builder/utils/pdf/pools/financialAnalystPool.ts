// utils/pools/financialAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFinancialAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 50+ financial models for budgeting, forecasting, and valuation at ${company}`,
            `• Analyzed 100+ financial statements identifying trends and variances`,
            `• Prepared 30+ monthly financial reports for management review`,
            `• Conducted 20+ variance analyses explaining budget vs actual performance`,
            `• Supported senior analysts in 10+ investment evaluation projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led financial planning and analysis for $50M business unit at ${company}`,
            `• Developed forecasting models improving accuracy by 35%`,
            `• Identified $5M in cost savings through detailed financial analysis`,
            `• Managed 5+ financial analysts on quarterly reporting and budgeting`,
            `• Presented financial insights to executive team influencing strategic decisions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led financial analysis team of 12 analysts, managing $200M portfolio at ${company}`,
            `• Defined financial planning strategy adopted across 5 business units`,
            `• Drove profitability improvement of 25% through strategic analysis`,
            `• Built relationships with investors and banking partners`,
            `• Published 10+ financial reports and industry analyses`
        ];
    }
    return [
        `• Served as Director of Financial Analysis at ${company}, overseeing 30+ analysts and $100M budget`,
        `• Led financial transformation improving profitability by 40%`,
        `• Built financial analysis organization from ground up, hiring 25+ analysts`,
        `• Presented financial strategy to board and secured $50M for strategic initiatives`,
        `• Mentored 15 financial leaders who now run their own departments`
    ];
};