// utils/pools/electricalEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getElectricalEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed 30+ electrical schematics and single-line diagrams using AutoCAD Electrical at ${company}`,
            `• Performed load calculations and power distribution design for 10+ facilities`,
            `• Conducted 50+ electrical testing and commissioning activities for switchgear and transformers`,
            `• Assisted in electrical installation supervision for 5+ projects`,
            `• Ensured compliance with electrical safety standards and codes for 20+ installations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led electrical design and installation for 8+ projects worth $8M at ${company}`,
            `• Designed power distribution systems for 5+ industrial facilities, improving efficiency by 20%`,
            `• Managed electrical team of 10+ technicians, ensuring 100% project completion on time`,
            `• Implemented energy conservation measures reducing consumption by 25%`,
            `• Mentored 5 junior electrical engineers in design, testing, and safety practices`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed electrical engineering team of 25+ engineers, managing $30M electrical portfolio at ${company}`,
            `• Defined electrical engineering standards adopted across 15+ facilities`,
            `• Led electrical infrastructure upgrade improving reliability from 95% to 99.5%`,
            `• Implemented smart grid and automation solutions reducing energy costs by 30%`,
            `• Partnered with utilities and regulatory bodies to ensure compliance and optimize tariffs`
        ];
    }
    return [
        `• Served as Director of Electrical Engineering, overseeing 50+ engineers and $40M electrical budget`,
        `• Led electrical engineering transformation improving power reliability by 40%`,
        `• Built electrical engineering organization from ground up, hiring 45+ professionals across 5 countries`,
        `• Presented electrical strategy to board and secured $25M for modernization`,
        `• Mentored 22 electrical leads who now manage their own engineering teams`
    ];
};