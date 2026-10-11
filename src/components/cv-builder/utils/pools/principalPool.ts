// utils/pools/principalPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPrincipalBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in school administration for 500+ students at ${company}`,
            `• Coordinated 50+ academic events and parent-teacher meetings`,
            `• Supported 30+ teachers in curriculum implementation and classroom management`,
            `• Managed 100+ student disciplinary cases with 95% resolution rate`,
            `• Implemented 10+ student support programs improving attendance by 15%`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led school operations for 1,000+ students and 60+ teachers at ${company}`,
            `• Improved student performance by 25% through curriculum enhancement`,
            `• Developed teacher training program improving teaching quality by 35%`,
            `• Managed $2M school budget with 100% accountability`,
            `• Built partnerships with 10+ community organizations for student development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led school district of 5,000+ students and 300+ teachers at ${company}`,
            `• Improved graduation rate from 75% to 92% through strategic initiatives`,
            `• Established STEM program that won 3 national awards`,
            `• Developed leadership pipeline producing 15+ school principals`,
            `• Presented education strategy to board and secured $5M for school improvement`
        ];
    }
    return [
        `• Served as Director of Education at ${company}, overseeing 20+ schools and 10,000+ students`,
        `• Led education transformation improving student outcomes by 45%`,
        `• Built school network from ground up, hiring 500+ educators across 15 schools`,
        `• Presented education strategy to government and secured $20M for school modernization`,
        `• Mentored 30+ school leaders who now head their own institutions`
    ];
};