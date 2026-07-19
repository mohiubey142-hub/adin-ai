// utils/pools/itSupportPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getItSupportBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Resolved 500+ tickets with 95% satisfaction rate at ${company}`,
            `• Diagnosed and fixed 300+ hardware and software issues`,
            `• Documented solutions for 100+ common issues`,
            `• Built trust with users by being patient and helpful`,
            `• Learned new technologies quickly and applied them to 20+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led IT support team of 5, improving response time by 50% at ${company}`,
            `• Implemented ticketing system reducing resolution time by 40%`,
            `• Created knowledge base reducing repeated issues by 60%`,
            `• Managed relationships with 1000+ users across 5 departments`,
            `• Mentored 5 junior IT support staff through hands-on training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led IT support team of 20, supporting 5000+ users globally at ${company}`,
            `• Defined IT support strategy that became company standard`,
            `• Drove digital workplace transformation improving productivity by 30%`,
            `• Created training program improving IT literacy by 50%`,
            `• Partnered with IT teams to improve infrastructure reliability by 25%`
        ];
    }
    return [
        `• Served as Director of IT Operations, overseeing 50+ IT staff and $20M budget`,
        `• Led IT transformation improving service quality by 60%`,
        `• Built IT operations from ground up, hiring 40+ professionals across 4 countries`,
        `• Presented IT strategy to CIO and secured $10M for modernization`,
        `• Mentored 15 IT leaders who now run their own IT operations`
    ];
};