// utils/pools/agriculturalTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAgriculturalTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in crop production and management for 50+ acres of agricultural land at ${company}`,
            `• Conducted 100+ soil tests and irrigation assessments, optimizing water usage by 20%`,
            `• Monitored and reported on 30+ crop health indicators and pest infestations`,
            `• Maintained and operated 20+ agricultural equipment including tractors and sprayers`,
            `• Kept detailed farm records including planting schedules, inputs, and harvest data`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led agricultural operations for 200+ acres, improving crop yield by 30% at ${company}`,
            `• Implemented integrated pest management program reducing pesticide use by 40%`,
            `• Developed irrigation schedules improving water efficiency by 35%`,
            `• Managed team of 8 field workers and coordinated daily farm operations`,
            `• Trained 6 junior technicians in modern farming techniques and equipment operation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed agricultural operations across 3 farms, managing 500+ acres at ${company}`,
            `• Established agricultural best practices adopted across all farming operations`,
            `• Led precision agriculture initiative using GPS and sensors, increasing efficiency by 40%`,
            `• Implemented sustainable farming practices reducing environmental impact by 50%`,
            `• Partnered with agricultural universities and research institutions for technology adoption`
        ];
    }
    return [
        `• Served as Director of Agricultural Operations, overseeing 1,000+ acres and $15M annual budget`,
        `• Led agricultural transformation improving productivity by 60% and sustainability by 40%`,
        `• Built agricultural operations from ground up, hiring 50+ professionals across 5 locations`,
        `• Presented agricultural strategy to board and secured $10M for technology and equipment`,
        `• Mentored 30 agricultural leads who now manage their own farming operations`
    ];
};