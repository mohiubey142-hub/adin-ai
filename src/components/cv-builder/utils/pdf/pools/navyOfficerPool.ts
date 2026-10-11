// utils/pools/navyOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getNavyOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Led a team of 30+ sailors with discipline and operational excellence at ${company}`,
            `• Executed 10+ naval missions with precision and teamwork, achieving 100% success rate`,
            `• Maintained operational readiness through rigorous training for 100+ personnel`,
            `• Built trust with team members through shared sacrifice and commitment`,
            `• Completed naval training with distinction, ranking in top 5% of class`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 5 successful naval operations with zero casualties, achieving all mission objectives at ${company}`,
            `• Developed training programs that improved fleet readiness by 40%`,
            `• Managed logistics and resources efficiently for 500+ personnel`,
            `• Built relationships with allied navies and international forces for 5+ operations`,
            `• Mentored 15 junior officers through professional development programs`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led naval fleet of 1,000+ sailors, ensuring operational excellence at ${company}`,
            `• Defined naval strategy adopted as navy standard for 10+ units`,
            `• Drove transformation improving combat readiness by 50%`,
            `• Created leadership development program that produced 50+ naval leaders`,
            `• Partnered with international navies to improve interoperability for 5+ missions`
        ];
    }
    return [
        `• Served as Admiral, overseeing 10,000+ sailors and $500M naval operations`,
        `• Led naval transformation improving national security by 40%`,
        `• Built naval organization from ground up, hiring 2,000+ professionals`,
        `• Presented naval strategy to government and secured $1B for fleet modernization`,
        `• Mentored 50 naval leaders who now command their own fleets`
    ];
};