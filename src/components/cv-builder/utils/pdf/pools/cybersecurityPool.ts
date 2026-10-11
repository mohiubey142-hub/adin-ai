// utils/pools/cybersecurityPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCybersecurityBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Monitored networks and caught 20+ suspicious activities before they became breaches at ${company}`,
            `• Conducted vulnerability scans and reported 100+ findings to senior team`,
            `• Documented security incidents and created playbooks for 5+ scenarios`,
            `• Helped implement multi-factor authentication across 10+ applications`,
            `• Collaborated with IT teams to patch 50+ critical vulnerabilities`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led penetration testing program that identified 50+ critical vulnerabilities at ${company}`,
            `• Implemented SIEM system reducing threat detection time from 8 hours to 15 minutes`,
            `• Created security awareness program reducing phishing click rate by 70%`,
            `• Architected zero-trust network access, reducing attack surface by 80%`,
            `• Led incident response for 3 major security events with zero data loss`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led security team of 15, protecting data of 5M+ customers at ${company}`,
            `• Designed security architecture achieving SOC 2 and ISO 27001 compliance`,
            `• Reduced security incidents by 60% through proactive threat hunting`,
            `• Built incident response framework that became company standard`,
            `• Partnered with executive team to embed security into product development`
        ];
    }
    return [
        `• Served as CISO, overseeing global security operations and $10M budget`,
        `• Led security transformation reducing breach risk by 90%`,
        `• Built security operations center from ground up, hiring 50+ security professionals`,
        `• Represented company at 10+ cybersecurity conferences`,
        `• Mentored 8 security leads who now protect their own organizations`
    ];
};