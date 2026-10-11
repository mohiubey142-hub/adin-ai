// utils/pools/architectPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getArchitectBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed 10+ residential and commercial buildings using AutoCAD and Revit at ${company}`,
            `• Created 50+ architectural drawings and 3D models with 100% accuracy`,
            `• Conducted 30+ site visits ensuring design compliance`,
            `• Collaborated with engineers on 15+ structural and MEP designs`,
            `• Documented 200+ design specifications and construction details`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led design of 10+ major building projects worth $50M at ${company}`,
            `• Developed sustainable design solutions reducing energy consumption by 40%`,
            `• Managed 5+ design teams coordinating 20+ consultants`,
            `• Won 3 architectural design competitions for innovative concepts`,
            `• Mentored 5 junior architects in design and project management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led architectural practice of 20+ architects, delivering $200M in projects at ${company}`,
            `• Defined design standards adopted across the firm`,
            `• Drove innovation in sustainable architecture achieving LEED Platinum certification`,
            `• Built relationships with 15+ developers and government agencies`,
            `• Published 10+ articles in architectural journals`
        ];
    }
    return [
        `• Served as Principal Architect at ${company}, overseeing 50+ architects and $100M revenue`,
        `• Led architectural transformation delivering 100+ landmark projects`,
        `• Built architectural practice from ground up, hiring 40+ architects across 3 offices`,
        `• Presented design vision to clients and secured $50M in new projects`,
        `• Mentored 25 architectural leaders who now run their own practices`
    ];
};