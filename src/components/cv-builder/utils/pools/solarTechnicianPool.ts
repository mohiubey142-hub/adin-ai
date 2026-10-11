// utils/pools/solarTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSolarTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed 100+ solar panels on residential and commercial buildings at ${company}`,
            `• Performed 300+ maintenance tasks on solar systems`,
            `• Diagnosed and repaired 150+ solar system faults`,
            `• Conducted 200+ performance tests on solar installations`,
            `• Documented 400+ installation and maintenance reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led solar installation team of 5 technicians at ${company}`,
            `• Installed 50+ solar systems with 99% efficiency`,
            `• Implemented installation procedures reducing time by 40%`,
            `• Trained 8 junior technicians in solar installation and maintenance`,
            `• Improved system performance by 45% through optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led solar technical department of 15 technicians, installing 200+ systems annually at ${company}`,
            `• Defined solar installation standards adopted across 5 regions`,
            `• Drove system efficiency improvement to 99.5%`,
            `• Built relationships with 25+ suppliers and government agencies`,
            `• Published 10+ articles on solar technology`
        ];
    }
    return [
        `• Served as Director of Solar Services at ${company}, overseeing 40+ technicians and $10M budget`,
        `• Led solar transformation installing 1,000+ systems with 99.9% efficiency`,
        `• Built solar services organization from ground up, hiring 35+ technicians`,
        `• Presented solar strategy to board and secured $8M for expansion`,
        `• Mentored 20 solar leaders who now run their own departments`
    ];
};