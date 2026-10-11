// utils/pools/policeOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPoliceOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Patrolled assigned areas ensuring safety of 10,000+ citizens at ${company}`,
            `• Responded to 500+ emergency calls with average response time of 5 minutes`,
            `• Investigated 100+ criminal cases, solving 75% of them`,
            `• Conducted 200+ traffic stops and issued citations for violations`,
            `• Documented 300+ incident reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led police team of 10 officers in high-crime areas at ${company}`,
            `• Reduced crime rate by 35% through community policing initiatives`,
            `• Investigated 50+ major crimes, solving 85% of them`,
            `• Managed 5+ junior officers in complex investigations`,
            `• Built relationships with community leaders improving trust by 40%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led police district of 100+ officers, ensuring public safety at ${company}`,
            `• Defined policing strategy adopted across 5 precincts`,
            `• Drove crime reduction of 50% through strategic initiatives`,
            `• Built relationships with 25+ community organizations and government agencies`,
            `• Published 10+ articles on policing best practices`
        ];
    }
    return [
        `• Served as Chief of Police at ${company}, overseeing 500+ officers and $50M budget`,
        `• Led police transformation reducing crime by 60%`,
        `• Built police organization from ground up, hiring 400+ officers`,
        `• Presented policing strategy to government and secured $30M for modernization`,
        `• Mentored 25 police leaders who now run their own departments`
    ];
};