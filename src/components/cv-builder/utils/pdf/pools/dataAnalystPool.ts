// utils/pools/dataAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDataAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed data and found 20+ insights that improved decision-making at ${company}`,
            `• Created dashboards that managers used for 10+ projects`,
            `• Wrote SQL queries that fetched data efficiently for 50+ reports`,
            `• Cleaned messy data and made it usable for 5+ departments`,
            `• Collaborated with business teams to understand what metrics mattered`
        ];
    }
    if (level === 'mid') {
        return [
            `• Built analytics framework improving decision-making by 50% at ${company}`,
            `• Led 20+ analytics projects that generated $5M in value`,
            `• Developed automated reporting saving 20 hours/week`,
            `• Created data quality framework reducing errors by 80%`,
            `• Mentored 5 junior data analysts through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led analytics team of 12, driving data strategy for $50M business`,
            `• Defined analytics vision that became company standard`,
            `• Drove data literacy program increasing data adoption by 60%`,
            `• Built data warehouse reducing time-to-insight from weeks to hours`,
            `• Partnered with executive team to embed data in every decision`
        ];
    }
    return [
        `• Served as Director of Analytics, overseeing 30+ analysts and $8M budget`,
        `• Led analytics transformation increasing revenue by 25%`,
        `• Built analytics organization from ground up, hiring 25+ analysts across 4 countries`,
        `• Presented analytics strategy to CEO and secured $5M for data investment`,
        `• Mentored 8 analytics leads who now run their own analytics teams`
    ];
};