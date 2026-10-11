// utils/pools/softwareEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSoftwareEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed and maintained 10+ software applications using Java, Python, and JavaScript at ${company}`,
            `• Wrote 500+ unit tests achieving 85% code coverage across 5+ projects`,
            `• Fixed 100+ bugs and implemented 20+ feature enhancements for production systems`,
            `• Collaborated with product teams to deliver 8 successful releases in 12 months`,
            `• Documented technical specifications for 15+ features and APIs`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed and built 5+ scalable software systems handling 1M+ users at ${company}`,
            `• Implemented microservices architecture reducing response time by 60%`,
            `• Optimized database queries improving performance by 70% and reducing costs by 25%`,
            `• Led code reviews for 10+ engineers, ensuring code quality and best practices`,
            `• Mentored 6 junior developers through pair programming and technical guidance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led software engineering team of 20+ engineers at ${company}, building products for 10M+ users`,
            `• Defined software architecture strategy adopted across 15+ teams and 50+ services`,
            `• Implemented CI/CD pipeline reducing deployment time from 2 hours to 5 minutes`,
            `• Drove innovation in cloud-native development, improving scalability and resilience`,
            `• Partnered with product and design teams to launch 5 major products generating $20M in revenue`
        ];
    }
    return [
        `• Served as Director of Software Engineering, overseeing $50M product portfolio and 100+ engineers`,
        `• Led software transformation increasing development velocity by 45% across 20+ teams`,
        `• Built engineering organization from ground up, hiring 80+ professionals across 5 countries`,
        `• Presented technology strategy to CTO and secured $30M for platform modernization`,
        `• Mentored 25 engineering leads who now manage their own teams`
    ];
};