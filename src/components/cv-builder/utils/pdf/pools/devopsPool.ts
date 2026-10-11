// utils/pools/devopsPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDevopsBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built CI/CD pipelines for 10+ applications at ${company}`,
            `• Created Docker containers for 20+ services with 100% consistency`,
            `• Wrote automation scripts saving team 10 hours per week`,
            `• Monitored system metrics and created dashboards for 5+ services`,
            `• Collaborated with developers to understand pain points and improve workflows`
        ];
    }
    if (level === 'mid') {
        return [
            `• Designed CI/CD strategy reducing deployment time from 1 hour to 10 minutes at ${company}`,
            `• Built Kubernetes cluster scaling to 500+ pods automatically`,
            `• Implemented observability stack reducing MTTR from 4 hours to 30 minutes`,
            `• Created deployment metrics helping teams understand their own velocity`,
            `• Mentored 5 junior DevOps engineers through hands-on training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led DevOps team of 18, managing infrastructure for 50+ microservices`,
            `• Architected GitOps strategy that became company standard`,
            `• Built platform engineering team reducing developer friction by 60%`,
            `• Implemented chaos engineering improving resilience by 45%`,
            `• Partnered with security teams to embed DevSecOps practices`
        ];
    }
    return [
        `• Served as Director of DevOps, overseeing global infrastructure and $10M budget`,
        `• Led DevOps transformation improving deployment frequency by 500%`,
        `• Built DevOps practice from ground up, hiring 30+ engineers across 5 countries`,
        `• Presented DevOps metrics to board and secured $3M for tooling`,
        `• Mentored 7 DevOps leads who now run their own teams`
    ];
};