// utils/pools/salesPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSalesBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Generated leads through cold calling and email campaigns, achieving 200+ leads at ${company}`,
            `• Maintained accurate records of customer interactions in CRM for 500+ contacts`,
            `• Supported senior account executives with proposal preparation and follow-ups for 50+ deals`,
            `• Qualified inbound leads and scheduled product demonstrations for 100+ leads`,
            `• Achieved quarterly targets for lead generation with 110% achievement`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed portfolio of accounts at ${company}, consistently exceeding quota by 20%`,
            `• Developed territory strategy and built relationships with key decision makers for 50+ accounts`,
            `• Negotiated contracts and closed deals worth $5M annual revenue`,
            `• Conducted product demonstrations and prepared customized proposals for 100+ prospects`,
            `• Collaborated with marketing to refine messaging and campaigns`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led sales team of 10 at ${company}, driving revenue growth by 35%`,
            `• Developed strategic account plans for enterprise clients worth $10M`,
            `• Exceeded annual quota by 30% and recognized as top performer`,
            `• Negotiated complex contracts with legal and procurement teams for 20+ deals`,
            `• Established sales processes and CRM best practices team-wide`
        ];
    }
    return [
        `• Served as Vice President of Sales at ${company}, driving global revenue strategy`,
        `• Managed $100M+ sales pipeline and led team of 50+ sales professionals`,
        `• Expanded market share from 15% to 35% in 3 years through strategic initiatives`,
        `• Secured partnerships with Fortune 500 companies worth $20M+ annually`,
        `• Built sales organization from ground up, hiring and training 100+ reps`
    ];
};