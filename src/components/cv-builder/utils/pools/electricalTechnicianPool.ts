// utils/pools/electricalTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getElectricalTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and maintained 100+ electrical panels, switchgear, and control systems at ${company}`,
            `• Performed preventive maintenance on 50+ motors, transformers, and generators`,
            `• Troubleshot and repaired 200+ electrical faults with 95% first-time fix rate`,
            `• Read and interpreted 50+ electrical schematics and wiring diagrams`,
            `• Ensured 100% compliance with electrical safety standards and procedures`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led electrical maintenance team of 6 technicians, maintaining 200+ electrical assets at ${company}`,
            `• Developed preventive maintenance schedules reducing breakdowns by 60%`,
            `• Implemented electrical testing procedures improving fault detection by 80%`,
            `• Managed electrical installation projects worth $2M, completing 100% on time`,
            `• Trained 8 junior technicians in electrical safety, troubleshooting, and best practices`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed electrical maintenance operations across 5 facilities, managing 25+ technicians at ${company}`,
            `• Established electrical maintenance standards adopted as company-wide policy`,
            `• Led electrical system upgrades reducing energy consumption by 30% and saving $500K annually`,
            `• Designed electrical safety program reducing incidents by 90% over 3 years`,
            `• Built high-performing team of 20+ technicians with 92% retention rate`
        ];
    }
    return [
        `• Served as Director of Electrical Operations, overseeing 60+ technicians and $10M annual budget`,
        `• Led electrical transformation improving reliability from 95% to 99.5% uptime`,
        `• Built electrical maintenance organization from ground up, hiring 50+ professionals`,
        `• Presented electrical strategy to board and secured $5M for modernization`,
        `• Mentored 20 electrical leads who now manage their own teams`
    ];
};