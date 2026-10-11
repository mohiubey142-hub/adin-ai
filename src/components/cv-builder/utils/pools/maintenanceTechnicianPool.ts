// utils/pools/maintenanceTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMaintenanceTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 500+ preventive maintenance tasks on equipment at ${company}`,
            `• Repaired 300+ mechanical and electrical faults`,
            `• Maintained 200+ machines with 98% uptime`,
            `• Conducted 100+ safety inspections with 100% compliance`,
            `• Documented 400+ maintenance reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led maintenance team of 6 technicians at ${company}`,
            `• Maintained 500+ machines with 99.5% uptime`,
            `• Implemented preventive maintenance reducing breakdowns by 60%`,
            `• Trained 8 junior technicians in maintenance procedures`,
            `• Improved equipment reliability by 50% through proactive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led maintenance department of 15 technicians, maintaining $20M in equipment at ${company}`,
            `• Defined maintenance standards adopted across 5 facilities`,
            `• Drove equipment uptime improvement to 99.9%`,
            `• Built relationships with 25+ equipment vendors and suppliers`,
            `• Published 10+ articles on maintenance management`
        ];
    }
    return [
        `• Served as Director of Maintenance at ${company}, overseeing 40+ technicians and $8M budget`,
        `• Led maintenance transformation improving uptime by 70%`,
        `• Built maintenance organization from ground up, hiring 35+ technicians`,
        `• Presented maintenance strategy to board and secured $5M for modernization`,
        `• Mentored 20 maintenance leaders who now run their own departments`
    ];
};