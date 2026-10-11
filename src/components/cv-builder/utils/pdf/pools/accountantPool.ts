// utils/pools/accountantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAccountantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Processed 500+ accounts payable and receivable transactions accurately in QuickBooks at ${company}`,
            `• Reconciled 100+ bank statements and credit card transactions monthly`,
            `• Assisted with month-end closing procedures and journal entries for 50+ accounts`,
            `• Maintained organized filing system for 1,000+ financial documents`,
            `• Responded to 200+ vendor inquiries regarding payment status`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed full-cycle accounting for 5+ entities at ${company}, ensuring timely month-end close`,
            `• Prepared financial statements including balance sheet, P&L, and cash flow analysis for 10+ clients`,
            `• Led annual audit preparation and served as primary contact for external auditors`,
            `• Implemented internal controls reducing discrepancies by 60%`,
            `• Advised department heads on budget variance and cost optimization, saving $200K annually`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led finance team of 8 accountants at ${company}, overseeing all accounting operations`,
            `• Developed financial forecasting models supporting strategic business decisions`,
            `• Reduced month-end close from 15 days to 5 days through process automation`,
            `• Ensured GAAP compliance and prepared for annual external audits with 100% pass rate`,
            `• Presented quarterly financial results to executive leadership`
        ];
    }
    return [
        `• Served as Chief Financial Officer at ${company}, driving financial strategy and growth`,
        `• Managed $50M+ annual budget and led team of 25 finance professionals`,
        `• Secured $10M in funding through investor relations and banking partnerships`,
        `• Implemented ERP system improving financial reporting efficiency by 60%`,
        `• Achieved 15% cost reduction through strategic vendor negotiations`
    ];
};