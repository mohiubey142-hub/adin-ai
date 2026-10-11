// utils/pools/cloudEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCloudEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Deployed infrastructure using Terraform, managing 50+ resources at ${company}`,
            `• Managed AWS resources and optimized costs by 20%, saving $50K annually`,
            `• Documented cloud architecture and created runbooks for 20+ services`,
            `• Troubleshot production issues and restored services within 30 minutes`,
            `• Collaborated with DevOps teams to improve deployment workflows for 5+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected multi-cloud strategy improving availability from 99.9% to 99.99% at ${company}`,
            `• Led cloud migration of 200+ applications, saving $500K annually`,
            `• Designed disaster recovery plan reducing RTO from 4 hours to 15 minutes`,
            `• Implemented FinOps practices reducing cloud spend by 35%`,
            `• Mentored 4 junior cloud engineers through hands-on training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led cloud engineering team of 20, managing infrastructure for 10M+ users`,
            `• Defined cloud strategy that became company standard for 50+ teams`,
            `• Built CI/CD pipeline reducing deployment time from 2 hours to 5 minutes`,
            `• Created cloud governance framework enforcing security and compliance automatically`,
            `• Partnered with finance to optimize cloud spend, saving $2M annually`
        ];
    }
    return [
        `• Served as Director of Cloud Engineering, overseeing global cloud operations and $15M budget`,
        `• Led cloud transformation improving agility and reducing costs by 40%`,
        `• Built cloud center of excellence from ground up, recruiting top talent from 6 countries`,
        `• Presented cloud strategy to board and secured $5M for innovation`,
        `• Mentored 6 cloud leads who now run their own teams`
    ];
};