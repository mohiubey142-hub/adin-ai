// utils/pools/hvacTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHvacTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and maintained 100+ HVAC systems including split units, package units, and ducted systems at ${company}`,
            `• Performed 200+ preventive maintenance services on air conditioning and refrigeration equipment`,
            `• Diagnosed and repaired 150+ HVAC faults including electrical controls, compressors, and fans`,
            `• Read and interpreted 50+ HVAC drawings, wiring diagrams, and technical manuals`,
            `• Ensured 100% compliance with safety procedures and refrigerant handling regulations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led HVAC maintenance team of 8 technicians, servicing 300+ systems at ${company}`,
            `• Designed and installed 20+ new HVAC systems for commercial and residential projects`,
            `• Implemented preventive maintenance program reducing breakdowns by 70%`,
            `• Optimized system performance reducing energy consumption by 25%`,
            `• Trained 10 junior technicians in installation, troubleshooting, and safety standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed HVAC operations across 5 facilities, managing 30+ technicians at ${company}`,
            `• Established HVAC standards and procedures adopted organization-wide`,
            `• Led energy efficiency program reducing utility costs by 35% and saving $500K annually`,
            `• Implemented Building Management System integration improving control and monitoring`,
            `• Built high-performing team of 25+ technicians with 92% retention rate`
        ];
    }
    return [
        `• Served as Director of HVAC Operations, overseeing 70+ technicians and $12M annual budget`,
        `• Led HVAC transformation improving system reliability from 92% to 99.5%`,
        `• Built HVAC organization from ground up, hiring 60+ professionals across 6 locations`,
        `• Presented HVAC strategy to board and secured $6M for modernization`,
        `• Mentored 25 HVAC leads who now manage their own teams`
    ];
};