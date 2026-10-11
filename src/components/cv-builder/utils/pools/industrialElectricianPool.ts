// utils/pools/industrialElectricianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getIndustrialElectricianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and maintained 500+ industrial electrical systems at ${company}`,
            `• Diagnosed and repaired 300+ electrical faults in machinery`,
            `• Performed 400+ preventive maintenance tasks on electrical equipment`,
            `• Ensured 100% compliance with electrical safety codes`,
            `• Documented 300+ electrical maintenance reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led industrial electrical team of 6 electricians at ${company}`,
            `• Maintained 1,000+ electrical systems with 99.5% uptime`,
            `• Implemented electrical safety programs reducing accidents by 60%`,
            `• Trained 8 junior electricians in industrial electrical systems`,
            `• Improved equipment reliability by 45% through preventive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led industrial electrical department of 15 electricians, maintaining $50M in equipment at ${company}`,
            `• Defined electrical maintenance standards adopted across 5 plants`,
            `• Drove equipment uptime improvement to 99.9%`,
            `• Built relationships with 25+ equipment vendors and suppliers`,
            `• Published 10+ articles on industrial electrical maintenance`
        ];
    }
    return [
        `• Served as Director of Electrical Maintenance at ${company}, overseeing 40+ electricians and $8M budget`,
        `• Led electrical maintenance transformation improving uptime by 60%`,
        `• Built industrial electrical organization from ground up, hiring 35+ electricians`,
        `• Presented electrical strategy to board and secured $5M for modernization`,
        `• Mentored 20 electrical maintenance leaders who now run their own departments`
    ];
};