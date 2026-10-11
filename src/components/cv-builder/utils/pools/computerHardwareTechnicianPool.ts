// utils/pools/computerHardwareTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getComputerHardwareTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Diagnosed and repaired 200+ computer hardware issues at ${company}`,
            `• Assembled and configured 100+ desktop and laptop systems`,
            `• Replaced 300+ hardware components including RAM, hard drives, and motherboards`,
            `• Performed 500+ preventive maintenance tasks on computers`,
            `• Documented 400+ repair tickets with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led hardware repair team of 5 technicians at ${company}`,
            `• Repaired 500+ computer systems with 98% success rate`,
            `• Implemented diagnostic procedures reducing repair time by 40%`,
            `• Trained 8 junior technicians in hardware repair techniques`,
            `• Improved system uptime by 50% through preventive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led hardware services of 15 technicians, repairing 2,000+ systems annually at ${company}`,
            `• Defined hardware standards adopted across 3 locations`,
            `• Drove repair efficiency improvement by 60%`,
            `• Built relationships with 25+ vendors and suppliers`,
            `• Published 10+ articles on computer hardware maintenance`
        ];
    }
    return [
        `• Served as Director of Hardware Services at ${company}, overseeing 30+ technicians and $3M budget`,
        `• Led hardware services transformation improving efficiency by 70%`,
        `• Built hardware services organization from ground up, hiring 25+ technicians`,
        `• Presented hardware strategy to board and secured $2M for equipment`,
        `• Mentored 15 hardware services leaders who now run their own departments`
    ];
};