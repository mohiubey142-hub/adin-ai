// utils/pools/airForceOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAirForceOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Led a team of 20+ airmen with discipline and operational excellence at ${company}`,
            `• Executed 15+ aerial missions with precision and teamwork, achieving 100% success rate`,
            `• Maintained operational readiness through rigorous training for 80+ personnel`,
            `• Built trust with team members through shared sacrifice and commitment`,
            `• Completed flight training with distinction, ranking in top 5% of class`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 5 successful aerial operations with zero casualties, achieving all mission objectives at ${company}`,
            `• Developed training programs that improved squadron readiness by 40%`,
            `• Managed logistics and resources efficiently for 300+ personnel`,
            `• Built relationships with allied air forces and international forces for 5+ operations`,
            `• Mentored 12 junior officers through professional development programs`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led air force wing of 1,000+ airmen, ensuring operational excellence at ${company}`,
            `• Defined aerial strategy adopted as air force standard for 10+ units`,
            `• Drove transformation improving combat readiness by 50%`,
            `• Created leadership development program that produced 50+ air force leaders`,
            `• Partnered with international air forces to improve interoperability for 5+ missions`
        ];
    }
    return [
        `• Served as Air Marshal, overseeing 10,000+ airmen and $1B air operations`,
        `• Led air force transformation improving national security by 40%`,
        `• Built air force organization from ground up, hiring 2,000+ professionals`,
        `• Presented air force strategy to government and secured $2B for fleet modernization`,
        `• Mentored 50 air force leaders who now command their own wings`
    ];
};