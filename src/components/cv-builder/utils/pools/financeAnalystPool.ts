// utils/pools/financeAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFinanceAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed financial data for 50+ clients, preparing comprehensive reports and forecasts at ${company}`,
            `• Assisted in budgeting and forecasting processes, achieving 95% accuracy in quarterly projections`,
            `• Processed 200+ financial transactions and maintained accurate general ledger entries`,
            `• Conducted variance analysis identifying $200K in cost savings opportunities`,
            `• Prepared monthly financial reports and presentations for 5+ department heads`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led financial analysis for 3 business units at ${company}, managing $50M in budget planning`,
            `• Developed complex financial models supporting strategic decisions worth $10M in investments`,
            `• Identified cost optimization opportunities saving $2M annually across 5 departments`,
            `• Implemented financial reporting automation reducing report generation time by 60%`,
            `• Mentored 4 junior analysts in financial modeling and forecasting techniques`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed financial planning and analysis for 10+ business units at ${company}, managing $200M budget`,
            `• Developed 5-year strategic financial roadmap supporting 20% annual revenue growth`,
            `• Led M&A due diligence for 3 acquisitions valued at $100M`,
            `• Presented financial strategy to board, securing $50M for growth initiatives`,
            `• Built and managed team of 12+ financial analysts with 95% retention rate`
        ];
    }
    return [
        `• Served as VP of Financial Planning & Analysis, overseeing $500M portfolio and 30+ analysts`,
        `• Led financial transformation improving forecasting accuracy by 40% across 15+ business units`,
        `• Built FP&A organization from ground up, hiring 25+ professionals across 4 countries`,
        `• Presented financial strategy to CEO and board, securing $100M for strategic initiatives`,
        `• Mentored 18 finance leaders who now manage their own FP&A teams`
    ];
};