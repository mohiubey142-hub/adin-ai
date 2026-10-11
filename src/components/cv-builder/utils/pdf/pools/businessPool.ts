// utils/pools/businessPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBusinessBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in business operations and administrative tasks for 5+ departments at ${company}`,
            `• Prepared 50+ business reports, presentations, and documentation`,
            `• Supported senior managers in project coordination and follow-ups for 20+ projects`,
            `• Conducted market research and competitor analysis for 10+ products`,
            `• Participated in team meetings and contributed to strategic discussions`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed business projects and led cross-functional teams of 5+ members at ${company}`,
            `• Developed business strategies that improved operational efficiency by 20%`,
            `• Analyzed market trends and provided data-driven recommendations for 10+ initiatives`,
            `• Built and maintained relationships with key stakeholders and clients`,
            `• Mentored junior team members and contributed to team development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led business division at ${company}, driving strategic growth and profitability`,
            `• Developed and executed business plans resulting in 30% revenue growth`,
            `• Managed multi-department operations and budgets totaling $10M`,
            `• Established strategic partnerships and expanded market presence by 25%`,
            `• Provided executive leadership and mentored managers across departments`
        ];
    }
    return [
        `• Served as Business Director at ${company}, leading organizational strategy`,
        `• Drove revenue growth through innovative business development initiatives`,
        `• Managed $10M+ budget and led team of 50+ professionals`,
        `• Established strategic partnerships that expanded market reach by 40%`,
        `• Built high-performance culture recognized across the industry`
    ];
};