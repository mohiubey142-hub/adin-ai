// utils/pools/financialAdvisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFinancialAdvisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided financial advisory services to 100+ clients, helping them achieve wealth management goals at ${company}`,
            `• Developed 80+ personalized financial plans including investment, retirement, and tax strategies`,
            `• Conducted 150+ client portfolio reviews, providing recommendations for optimization`,
            `• Assisted clients with investment selection, achieving average portfolio returns of 12%`,
            `• Maintained 95% client satisfaction rate through proactive communication and personalized service`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led team of 5 financial advisors, managing $100M in client assets at ${company}`,
            `• Developed comprehensive wealth management strategies for 50+ high-net-worth clients`,
            `• Advised on estate planning and tax optimization, saving clients $3M in annual taxes`,
            `• Implemented client retention program improving renewal rates from 85% to 95%`,
            `• Mentored 6 junior advisors in investment strategy and client relationship management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed financial advisory practice of 15+ advisors, managing $500M in client assets at ${company}`,
            `• Defined investment philosophy becoming company standard across 3 regions`,
            `• Led expansion into 5 new markets, growing AUM by 40% in 2 years`,
            `• Developed advisor training program producing 10+ top-performing advisors`,
            `• Partnered with legal and tax experts to provide comprehensive wealth solutions for 50+ families`
        ];
    }
    return [
        `• Served as Managing Director of Wealth Management, overseeing $2B in client assets and 50+ advisors`,
        `• Led practice transformation growing AUM by 60% across 10+ offices`,
        `• Built advisory organization from ground up, hiring 45+ professionals across 6 cities`,
        `• Presented growth strategy to board and secured $25M for expansion`,
        `• Mentored 25 advisory leaders who now manage their own practices`
    ];
};