// utils/pools/foremanPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getForemanBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 15+ construction workers on daily tasks at ${company}`,
            `• Managed daily work schedules ensuring 95% productivity`,
            `• Conducted 100+ safety briefings with 100% compliance`,
            `• Coordinated with 10+ subcontractors and suppliers`,
            `• Documented 300+ daily reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised construction projects worth $5M at ${company}`,
            `• Led team of 40+ workers across multiple projects`,
            `• Improved team productivity by 40% through better coordination`,
            `• Implemented safety programs reducing accidents by 65%`,
            `• Mentored 8 junior foremen in construction supervision`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led foreman team of 15 foremen, supervising 200+ workers at ${company}`,
            `• Defined supervision standards adopted across 5 sites`,
            `• Drove project efficiency improvement by 55%`,
            `• Built relationships with 30+ contractors and engineers`,
            `• Published 10+ articles on construction supervision`
        ];
    }
    return [
        `• Served as General Foreman at ${company}, overseeing 500+ workers and $50M projects`,
        `• Led construction transformation delivering 30+ major projects on time`,
        `• Built foreman organization from ground up, hiring 400+ workers`,
        `• Presented construction strategy to board and secured $30M for new projects`,
        `• Mentored 25 foremen who now run their own sites`
    ];
};