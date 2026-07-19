// utils/pools/frontendPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFrontendBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 20+ React components used by 50,000+ users at ${company}`,
            `• Implemented 100+ pixel-perfect designs from Figma with 98% accuracy`,
            `• Fixed 50+ cross-browser issues across Chrome, Firefox, and Safari`,
            `• Wrote 100+ unit tests using Jest, achieving 85% code coverage`,
            `• Collaborated with senior developers to implement 15+ new features`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected reusable component library used by 5 product teams, reducing development time by 40%`,
            `• Implemented design system improving consistency across 20+ applications`,
            `• Optimized frontend performance by 50%, reducing load time from 3s to 1.2s`,
            `• Built testing strategy increasing code coverage from 40% to 85%`,
            `• Mentored 4 junior frontend developers through weekly code reviews`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led frontend team of 12 engineers, building products used by 2M+ users`,
            `• Defined frontend architecture adopted as company standard for 10+ teams`,
            `• Drove performance optimization improving Core Web Vitals by 60%`,
            `• Built micro-frontend architecture enabling 10+ teams to ship independently`,
            `• Partnered with product and design teams to improve user experience by 35%`
        ];
    }
    return [
        `• Served as Director of Frontend Engineering, overseeing 30+ engineers and $8M budget`,
        `• Led frontend transformation improving developer velocity by 70%`,
        `• Built frontend organization from ground up, hiring 25+ engineers across 4 countries`,
        `• Presented frontend strategy to CTO and secured $5M for platform investment`,
        `• Mentored 8 frontend leads who now run their own teams`
    ];
};