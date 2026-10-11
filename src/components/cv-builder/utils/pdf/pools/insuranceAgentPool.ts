// utils/pools/insuranceAgentPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getInsuranceAgentBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Sold 100+ insurance policies worth $2M in premiums at ${company}`,
            `• Managed portfolio of 200+ clients with 95% retention rate`,
            `• Conducted 300+ client meetings for policy reviews and sales`,
            `• Achieved 110% of sales targets for 6 consecutive months`,
            `• Built relationships with 150+ prospects through referrals`
        ];
    }
    if (level === 'mid') {
        return [
            `• Sold 200+ insurance policies worth $10M in premiums at ${company}`,
            `• Led team of 5 agents, generating $5M in annual premiums`,
            `• Developed client retention program improving retention by 30%`,
            `• Built network of 500+ clients and referral partners`,
            `• Achieved 130% of sales targets for 3 consecutive years`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led insurance team of 15 agents, managing $50M in premiums at ${company}`,
            `• Defined sales strategy adopted across the agency`,
            `• Drove revenue growth of 35% through strategic initiatives`,
            `• Built relationships with 100+ corporate clients and brokers`,
            `• Published 10+ articles on insurance planning`
        ];
    }
    return [
        `• Served as Agency Director at ${company}, overseeing 50+ agents and $200M in premiums`,
        `• Led insurance transformation achieving 50% revenue growth`,
        `• Built insurance agency from ground up, hiring 40+ agents`,
        `• Presented growth strategy to board and secured $30M for expansion`,
        `• Mentored 25 insurance leaders who now run their own agencies`
    ];
};