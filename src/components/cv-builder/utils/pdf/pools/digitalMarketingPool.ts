// utils/pools/digitalMarketingPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDigitalMarketingBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed 10+ social media accounts growing followers by 50% at ${company}`,
            `• Created 100+ content pieces across platforms generating 1M+ impressions`,
            `• Ran 20+ email marketing campaigns achieving 25% open rate`,
            `• Analyzed 50+ campaign metrics optimizing performance by 30%`,
            `• Assisted in 15+ paid advertising campaigns on Google and Facebook`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led digital marketing campaigns generating $5M in revenue at ${company}`,
            `• Grew organic traffic by 200% through SEO and content strategy`,
            `• Managed $1M+ ad spend achieving 4x ROAS`,
            `• Built marketing automation reducing manual work by 60%`,
            `• Mentored 5 junior marketers in digital marketing strategies`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led digital marketing team of 15 specialists, managing $10M budget at ${company}`,
            `• Defined digital strategy adopted across 5 product lines`,
            `• Drove customer acquisition growth of 300% through multi-channel campaigns`,
            `• Built relationships with 20+ media partners and agencies`,
            `• Published 10+ articles on digital marketing trends`
        ];
    }
    return [
        `• Served as Director of Digital Marketing at ${company}, overseeing 40+ specialists and $20M budget`,
        `• Led digital transformation generating $100M+ in revenue`,
        `• Built digital marketing organization from ground up, hiring 35+ specialists`,
        `• Presented digital strategy to board and secured $15M for marketing technology`,
        `• Mentored 20 marketing leaders who now run their own departments`
    ];
};