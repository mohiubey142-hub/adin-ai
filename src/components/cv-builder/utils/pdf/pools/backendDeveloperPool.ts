// utils/pools/backendDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBackendDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 20+ RESTful APIs handling 50K+ daily requests at ${company}`,
            `• Wrote 100+ database queries with 95% optimization rate`,
            `• Implemented authentication and authorization for 5+ applications`,
            `• Documented APIs for 10+ services with 100% coverage`,
            `• Collaborated with frontend developers to define API contracts for 15+ features`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected microservices handling 10M+ requests daily at ${company}`,
            `• Optimized database queries reducing response time from 800ms to 150ms (81% improvement)`,
            `• Implemented security best practices protecting user data for 1M+ users`,
            `• Designed API versioning strategy enabling smooth migrations for 5+ services`,
            `• Mentored 5 junior backend engineers through code reviews and pair programming`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led backend team of 15 engineers, building systems processing 100M+ requests daily`,
            `• Defined backend architecture scaling to 10M+ users with 99.99% uptime`,
            `• Designed data strategy improving query performance by 70%`,
            `• Implemented zero-trust security architecture protecting 5M+ users`,
            `• Partnered with DevOps to build deployment pipeline reducing downtime by 80%`
        ];
    }
    return [
        `• Served as Director of Backend Engineering, overseeing 35+ engineers and $10M budget`,
        `• Led backend transformation improving reliability from 99.9% to 99.99%`,
        `• Built backend organization from ground up, hiring 30+ engineers across 5 countries`,
        `• Presented backend strategy to CTO and secured $8M for platform investment`,
        `• Mentored 10 backend leads who now run their own teams`
    ];
};