// utils/pools/marketingPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMarketingBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created social media content that engaged 50,000+ followers at ${company}`,
            `• Analyzed campaign data and optimized for better performance for 20+ campaigns`,
            `• Collaborated with creative teams to bring 15+ campaigns to life`,
            `• Wrote copy that made people feel something for 10+ brands`,
            `• Managed 5 social media accounts and grew following by 200%`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led marketing campaigns that generated $5M in revenue at ${company}`,
            `• Built marketing dashboards that helped teams understand what worked for 10+ campaigns`,
            `• Managed relationship with 3 external agencies, delivering campaigns on time and under budget`,
            `• Created content strategy that increased organic traffic by 150%`,
            `• Led social media strategy that grew audience to 500K followers`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led marketing team of 20, driving $50M annual revenue at ${company}`,
            `• Defined marketing strategy that doubled market share in 2 years`,
            `• Built marketing analytics function that proved ROI of every dollar spent`,
            `• Partnered with sales teams to align marketing with revenue goals`,
            `• Created brand strategy that increased brand awareness by 80%`
        ];
    }
    return [
        `• Served as CMO, overseeing $100M marketing budget and 100+ marketing professionals`,
        `• Led marketing transformation that increased revenue by 150%`,
        `• Built marketing organization from ground up, hiring 80+ professionals across 8 countries`,
        `• Presented marketing strategy to CEO and secured $50M for innovation`,
        `• Mentored 12 marketing leads who now run their own marketing teams`
    ];
};