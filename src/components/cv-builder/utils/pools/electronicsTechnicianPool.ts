// utils/pools/electronicsTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getElectronicsTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Repaired 300+ electronic devices including circuits, sensors, and controllers at ${company}`,
            `• Assembled and tested 200+ electronic components`,
            `• Diagnosed 150+ electronic faults using multimeters and oscilloscopes`,
            `• Maintained 100+ electronic systems with 99% uptime`,
            `• Documented 400+ repair reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led electronics repair team of 5 technicians at ${company}`,
            `• Repaired 500+ electronic systems with 98% success rate`,
            `• Implemented diagnostic procedures reducing repair time by 45%`,
            `• Trained 8 junior technicians in electronics repair`,
            `• Improved system reliability by 50% through preventive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led electronics services of 15 technicians, repairing 2,000+ systems annually at ${company}`,
            `• Defined electronics standards adopted across 3 facilities`,
            `• Drove repair efficiency improvement by 60%`,
            `• Built relationships with 25+ vendors and suppliers`,
            `• Published 10+ articles on electronics maintenance`
        ];
    }
    return [
        `• Served as Director of Electronics Services at ${company}, overseeing 30+ technicians and $5M budget`,
        `• Led electronics transformation improving efficiency by 70%`,
        `• Built electronics services organization from ground up, hiring 25+ technicians`,
        `• Presented electronics strategy to board and secured $3M for equipment`,
        `• Mentored 15 electronics leaders who now run their own departments`
    ];
};