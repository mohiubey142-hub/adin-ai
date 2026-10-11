// utils/pools/siteSupervisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSiteSupervisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 15+ construction workers on daily site activities at ${company}`,
            `• Monitored 100+ construction tasks ensuring quality standards`,
            `• Conducted 200+ safety inspections with 100% compliance`,
            `• Coordinated with 10+ subcontractors and suppliers`,
            `• Documented 300+ site reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised construction projects worth $5M at ${company}`,
            `• Led team of 40+ workers across multiple sites`,
            `• Improved site productivity by 35% through better coordination`,
            `• Implemented safety programs reducing accidents by 60%`,
            `• Mentored 8 junior supervisors in site management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led site supervision of 15 supervisors, managing 200+ workers at ${company}`,
            `• Defined site supervision standards adopted across 5 projects`,
            `• Drove project efficiency improvement by 55%`,
            `• Built relationships with 30+ contractors and consultants`,
            `• Published 10+ articles on construction site supervision`
        ];
    }
    return [
        `• Served as Director of Site Supervision at ${company}, overseeing 500+ workers and $50M projects`,
        `• Led site supervision transformation delivering 30+ major projects on time`,
        `• Built site supervision organization from ground up, hiring 400+ workers`,
        `• Presented supervision strategy to board and secured $30M for new projects`,
        `• Mentored 25 site supervision leaders who now run their own projects`
    ];
};