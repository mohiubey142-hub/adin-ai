// utils/pools/developerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed and tested 25+ features following best practices at ${company}`,
            `• Fixed 60+ bugs in existing codebase and wrote unit tests using Jest`,
            `• Participated in agile ceremonies including sprint planning and daily standups`,
            `• Learned and applied Git best practices for version control`,
            `• Collaborated with senior developers to implement 15+ new features`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed and implemented RESTful APIs handling 100K+ daily traffic at ${company}`,
            `• Optimized database queries reducing response time by 40% (from 800ms to 150ms)`,
            `• Led feature development for 5+ major releases from requirements to deployment`,
            `• Implemented CI/CD pipeline reducing deployment time from 2 hours to 15 minutes`,
            `• Mentored 5 junior developers through pair programming sessions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Architected microservices infrastructure supporting 10M+ daily requests at ${company}`,
            `• Led technical design for cross-team initiatives spanning 3+ engineering teams`,
            `• Reduced cloud infrastructure costs by 35% through resource optimization`,
            `• Established engineering-wide standards for observability and incident response`,
            `• Served as technical lead for critical system redesign achieving 99.99% uptime`
        ];
    }
    return [
        `• Served as CTO/Engineering Director at ${company}, driving technical vision and strategy`,
        `• Managed $10M+ engineering budget and led team of 80+ engineers across 6 teams`,
        `• Scaled platform from 100K to 10M users with 99.99% uptime`,
        `• Built engineering culture and processes from ground up`,
        `• Led digital transformation initiative saving $5M annually`
    ];
};