// utils/pools/constructionSupervisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getConstructionSupervisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 20+ construction workers on residential and commercial projects at ${company}`,
            `• Managed daily construction activities ensuring 95% on-time completion`,
            `• Conducted 100+ safety inspections with 100% compliance`,
            `• Coordinated with 10+ subcontractors and suppliers`,
            `• Documented 300+ daily construction reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised construction projects worth $10M at ${company}`,
            `• Led team of 50+ construction workers across multiple sites`,
            `• Improved project efficiency by 35% through better coordination`,
            `• Implemented safety programs reducing accidents by 60%`,
            `• Mentored 8 junior supervisors in construction management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led construction supervision of 200+ workers on $50M projects at ${company}`,
            `• Defined construction standards adopted across 5 sites`,
            `• Drove project delivery improvement by 50%`,
            `• Built relationships with 30+ contractors and engineers`,
            `• Published 10+ articles on construction supervision`
        ];
    }
    return [
        `• Served as Director of Construction at ${company}, overseeing 500+ workers and $100M projects`,
        `• Led construction transformation delivering 50+ major projects on time`,
        `• Built construction organization from ground up, hiring 400+ workers`,
        `• Presented construction strategy to board and secured $50M for new projects`,
        `• Mentored 25 construction leaders who now run their own sites`
    ];
};