// utils/pools/socialWorkerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSocialWorkerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided case management for 100+ clients in need of social services at ${company}`,
            `• Conducted 200+ assessments to identify client needs and resources`,
            `• Connected 150+ clients with community resources and support services`,
            `• Documented 300+ case notes with 100% accuracy and confidentiality`,
            `• Assisted in 50+ crisis interventions and emergency support situations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed caseload of 80+ clients with complex social needs at ${company}`,
            `• Developed intervention programs reducing client crises by 45%`,
            `• Led 5+ community outreach initiatives serving 1,000+ individuals`,
            `• Supervised 5+ junior social workers in case management`,
            `• Advocated for policy changes improving social services by 30%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led social work department of 15 professionals, serving 2,000+ clients annually at ${company}`,
            `• Defined intervention protocols adopted across the organization`,
            `• Drove community impact improvements by 50%`,
            `• Built relationships with 25+ community organizations and government agencies`,
            `• Published 10+ articles on social work practice and policy`
        ];
    }
    return [
        `• Served as Director of Social Services at ${company}, overseeing 40+ professionals and $5M budget`,
        `• Led social services transformation improving outcomes by 60%`,
        `• Built social work organization from ground up, hiring 35+ professionals`,
        `• Presented social services strategy to board and secured $8M for community programs`,
        `• Mentored 20 social work leaders who now run their own departments`
    ];
};