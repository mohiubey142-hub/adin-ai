// utils/pools/instrumentationTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getInstrumentationTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and calibrated 300+ industrial instruments at ${company}`,
            `• Maintained 200+ control systems ensuring 99% accuracy`,
            `• Diagnosed and repaired 150+ instrument faults`,
            `• Performed 400+ calibration tasks with 100% accuracy`,
            `• Documented 300+ instrumentation reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led instrumentation team of 5 technicians at ${company}`,
            `• Maintained 1,000+ instruments with 99.5% reliability`,
            `• Implemented calibration procedures reducing errors by 55%`,
            `• Trained 8 junior technicians in instrumentation and control`,
            `• Improved process control accuracy by 45%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led instrumentation department of 15 technicians, maintaining 5,000+ instruments at ${company}`,
            `• Defined instrumentation standards adopted across 5 plants`,
            `• Drove process reliability improvement by 60%`,
            `• Built relationships with 25+ instrument vendors and suppliers`,
            `• Published 10+ articles on instrumentation and control`
        ];
    }
    return [
        `• Served as Director of Instrumentation at ${company}, overseeing 40+ technicians and $6M budget`,
        `• Led instrumentation transformation improving reliability by 70%`,
        `• Built instrumentation organization from ground up, hiring 35+ technicians`,
        `• Presented instrumentation strategy to board and secured $4M for upgrades`,
        `• Mentored 20 instrumentation leaders who now run their own departments`
    ];
};