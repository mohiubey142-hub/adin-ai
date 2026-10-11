// utils/pools/systemAdministratorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSystemAdministratorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed 50+ Windows and Linux servers with 99.9% uptime at ${company}`,
            `• Resolved 500+ IT support tickets with 95% first-call resolution`,
            `• Performed 100+ system backups and recovery operations`,
            `• Configured 200+ user accounts and permissions across systems`,
            `• Monitored system performance and resolved 50+ critical incidents`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed 200+ servers across hybrid cloud infrastructure at ${company}`,
            `• Implemented monitoring solution reducing downtime by 60%`,
            `• Led migration of 100+ applications to cloud infrastructure`,
            `• Developed automation scripts reducing manual tasks by 70%`,
            `• Mentored 5 junior administrators in system management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led infrastructure team of 15 administrators managing 500+ servers at ${company}`,
            `• Defined infrastructure architecture adopted across 3 data centers`,
            `• Achieved 99.99% uptime through redundancy and failover systems`,
            `• Implemented disaster recovery plan ensuring 4-hour RTO`,
            `• Partnered with security team to achieve SOC 2 compliance`
        ];
    }
    return [
        `• Served as Director of Infrastructure at ${company}, overseeing 40+ administrators and $15M budget`,
        `• Led infrastructure transformation achieving 99.999% uptime`,
        `• Built infrastructure organization from ground up, hiring 35+ administrators`,
        `• Presented infrastructure strategy to CTO and secured $10M for modernization`,
        `• Mentored 20 infrastructure leaders who now run their own teams`
    ];
};