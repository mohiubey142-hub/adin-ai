// utils/pools/investmentBankerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getInvestmentBankerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 50+ financial models for M&A and capital raising transactions at ${company}`,
            `• Conducted 100+ valuation analyses using DCF, comparable companies, and precedent transactions`,
            `• Prepared 30+ pitch books and client presentations`,
            `• Analyzed 50+ companies across 5 industries for investment opportunities`,
            `• Supported senior bankers in 10+ live transactions worth $500M+`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led execution of 10+ M&A transactions worth $2B+ at ${company}`,
            `• Managed client relationships with 15+ corporate and financial sponsors`,
            `• Developed financial strategies increasing client shareholder value by 30%`,
            `• Led due diligence on 20+ transactions identifying key risks and opportunities`,
            `• Mentored 6 junior bankers in financial modeling and deal execution`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led investment banking team of 20+ bankers, executing $10B+ in transactions at ${company}`,
            `• Defined M&A strategy for 5+ industry sectors`,
            `• Drove client relationships with C-suite executives at 30+ major corporations`,
            `• Built relationships with private equity and hedge fund clients`,
            `• Published 15+ industry reports on M&A trends and valuation`
        ];
    }
    return [
        `• Served as Managing Director at ${company}, overseeing 50+ bankers and $500M+ revenue`,
        `• Led investment banking transformation executing $50B+ in transactions`,
        `• Built investment banking practice from ground up, hiring 40+ bankers across 3 offices`,
        `• Presented M&A strategy to clients and secured $100M+ in new mandates`,
        `• Mentored 25 investment banking leaders who now run their own practices`
    ];
};