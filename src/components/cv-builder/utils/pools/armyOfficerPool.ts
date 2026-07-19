// utils/pools/armyOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getArmyOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Led a team of 20+ soldiers with discipline and operational excellence at ${company}`,
            `• Executed 10+ missions with precision and teamwork, achieving 100% success rate`,
            `• Maintained operational readiness through rigorous training for 50+ personnel`,
            `• Built trust with team members through shared sacrifice and commitment`,
            `• Completed training with distinction, ranking in top 5% of class`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 3 successful operations with zero casualties, achieving all mission objectives`,
            `• Developed training programs that improved unit readiness by 40%`,
            `• Managed logistics and resources efficiently for 100+ personnel`,
            `• Built relationships with allied forces and local communities for 5+ operations`,
            `• Mentored 15 junior officers through professional development programs`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led battalion of 500+ soldiers, ensuring operational excellence at ${company}`,
            `• Defined operational strategy adopted as army standard for 10+ units`,
            `• Drove transformation improving combat readiness by 50%`,
            `• Created leadership development program that produced 50+ leaders`,
            `• Partnered with international forces to improve interoperability for 3+ missions`
        ];
    }
    return [
        `• Served as Brigadier General, overseeing 5000+ soldiers and $100M operations`,
        `• Led defense transformation improving national security by 40%`,
        `• Built defense organization from ground up, hiring 1000+ professionals`,
        `• Presented defense strategy to government and secured $500M for modernization`,
        `• Mentored 50 military leaders who now command their own units`
    ];
};