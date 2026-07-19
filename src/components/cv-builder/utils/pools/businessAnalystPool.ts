// utils/pools/businessAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBusinessAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed business requirements and defined solutions for 10+ projects at ${company}`,
            `• Created BRDs and FRDs for 15+ projects with 100% developer satisfaction`,
            `• Facilitated 50+ meetings between business and technical teams`,
            `• Mapped business processes and identified improvement opportunities for 5+ departments`,
            `• Wrote user stories for 20+ features that captured real user needs`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led business analysis for 10+ projects, delivering $10M in value at ${company}`,
            `• Developed business case that secured $3M in investment`,
            `• Managed stakeholder relationships across 5 departments`,
            `• Drove process improvement reducing costs by 20%`,
            `• Mentored 4 junior business analysts through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led business analysis team of 15, driving $50M in business value`,
            `• Defined business analysis standards that became company-wide`,
            `• Drove strategic initiatives improving profitability by 30%`,
            `• Partnered with executive team to align projects with business goals`,
            `• Presented business analysis to board and secured $10M for new initiatives`
        ];
    }
    return [
        `• Served as Director of Business Analysis, overseeing 20+ analysts and $12M budget`,
        `• Led transformation improving business decision-making by 40%`,
        `• Built business analysis practice from ground up, hiring 18+ analysts across 3 countries`,
        `• Presented business strategy to CEO and secured $8M for innovation`,
        `• Mentored 10 business analysis leads who now run their own practices`
    ];
};