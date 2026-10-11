// utils/pools/databaseAdministratorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDatabaseAdministratorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed and maintained 10+ production databases (SQL Server, Oracle, PostgreSQL) at ${company}`,
            `• Performed daily database backups and recovery procedures for 50+ databases`,
            `• Monitored database performance and optimized 100+ queries, reducing response time by 40%`,
            `• Created and maintained database documentation for 20+ critical systems`,
            `• Assisted in database migrations and upgrades with zero downtime`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led database administration team of 4 DBAs, managing 100+ databases across 3 data centers at ${company}`,
            `• Implemented high-availability solutions achieving 99.99% uptime for mission-critical databases`,
            `• Designed disaster recovery strategy reducing RTO from 4 hours to 15 minutes`,
            `• Optimized database architecture improving performance by 60% and reducing storage costs by 30%`,
            `• Mentored 3 junior DBAs in advanced database administration and performance tuning`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed database operations across 5 data centers, managing 200+ databases and 15+ DBAs at ${company}`,
            `• Defined database standards and best practices adopted by 10+ development teams`,
            `• Implemented cloud-native database solutions reducing infrastructure costs by 40%`,
            `• Led migration from on-premise to cloud, ensuring zero data loss and minimal downtime`,
            `• Developed DBA training program producing 8+ skilled database administrators`
        ];
    }
    return [
        `• Served as Director of Database Operations, overseeing 300+ databases and 30+ DBA professionals`,
        `• Led database transformation improving performance by 70% and reducing costs by 50%`,
        `• Built DBA organization from ground up, hiring 25+ professionals across 4 countries`,
        `• Presented database strategy to CTO and secured $10M for modernization`,
        `• Mentored 15 DBA leaders who now manage their own database teams`
    ];
};