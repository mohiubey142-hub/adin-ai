// utils/pools/businessDevelopmentExecutivePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBusinessDevelopmentExecutiveBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Generated 50+ qualified leads monthly, converting 15 into new business opportunities at ${company}`,
            `• Conducted market research and competitive analysis for 5+ new markets`,
            `• Assisted in preparing 30+ business proposals and presentations for potential clients`,
            `• Built relationships with 50+ potential partners and stakeholders`,
            `• Achieved 120% of quarterly sales targets for 4 consecutive quarters`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led business development team of 5 professionals, generating $5M in new revenue at ${company}`,
            `• Developed and executed market entry strategies for 3 new geographies`,
            `• Built strategic partnerships with 20+ key clients and channel partners`,
            `• Negotiated 10+ major contracts worth $3M, achieving 25% margin improvement`,
            `• Mentored 4 junior business development executives in sales and relationship management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed business development operations across 5 markets, generating $25M in new revenue at ${company}`,
            `• Established strategic partnerships with 30+ enterprise clients and industry leaders`,
            `• Developed new business models that increased recurring revenue by 40%`,
            `• Identified and executed 5+ strategic acquisitions valued at $50M`,
            `• Built high-performing team of 20+ business development professionals with 90% retention`
        ];
    }
    return [
        `• Served as VP of Business Development, overseeing global growth strategy and $100M revenue pipeline`,
        `• Led business transformation increasing revenue by 50% across 10+ markets`,
        `• Built business development organization from ground up, hiring 50+ professionals across 8 countries`,
        `• Presented growth strategy to board and secured $75M for market expansion`,
        `• Mentored 30 business development leaders who now manage their own teams`
    ];
};