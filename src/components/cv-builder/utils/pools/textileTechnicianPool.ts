// utils/pools/textileTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTextileTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Operated textile machinery producing 5,000+ meters daily at ${company}`,
            `• Maintained 50+ textile machines with 98% uptime`,
            `• Performed 300+ quality checks on fabrics and yarns`,
            `• Diagnosed and repaired 150+ machine faults`,
            `• Documented 400+ production reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led textile technician team of 6 technicians at ${company}`,
            `• Maintained 100+ textile machines with 99% uptime`,
            `• Implemented maintenance procedures reducing downtime by 50%`,
            `• Trained 8 junior technicians in textile machinery operation`,
            `• Improved machine efficiency by 45% through preventive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led textile technical department of 15 technicians, maintaining 300+ machines at ${company}`,
            `• Defined technical standards adopted across 5 mills`,
            `• Drove machine uptime improvement to 99.5%`,
            `• Built relationships with 25+ equipment vendors and suppliers`,
            `• Published 10+ articles on textile machinery maintenance`
        ];
    }
    return [
        `• Served as Director of Textile Technical Services at ${company}, overseeing 40+ technicians and $8M budget`,
        `• Led textile technical transformation improving uptime by 65%`,
        `• Built textile technical organization from ground up, hiring 35+ technicians`,
        `• Presented technical strategy to board and secured $5M for modernization`,
        `• Mentored 20 textile technical leaders who now run their own mills`
    ];
};