// utils/pools/qualityControlEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getQualityControlEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed 20+ quality control procedures for manufacturing at ${company}`,
            `• Conducted 300+ quality tests and analyses`,
            `• Documented 400+ quality reports with 100% accuracy`,
            `• Identified 150+ quality issues and implemented corrective actions`,
            `• Maintained 100% compliance with ISO 9001 standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led quality engineering team of 5 engineers at ${company}`,
            `• Developed quality systems reducing defects by 65%`,
            `• Implemented statistical process control improving quality by 50%`,
            `• Trained 8 junior engineers in quality engineering`,
            `• Achieved ISO 9001 certification for 3 production lines`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led quality engineering department of 15 engineers, managing $20M in quality at ${company}`,
            `• Defined quality engineering standards adopted across 5 plants`,
            `• Drove quality improvement reducing defects to 0.05%`,
            `• Built relationships with 25+ suppliers and customers`,
            `• Published 10+ articles on quality engineering`
        ];
    }
    return [
        `• Served as Director of Quality Engineering at ${company}, overseeing 40+ engineers and $5M budget`,
        `• Led quality transformation achieving 99.95% product quality`,
        `• Built quality engineering organization from ground up, hiring 35+ engineers`,
        `• Presented quality strategy to board and secured $3M for advanced testing`,
        `• Mentored 20 quality leaders who now run their own departments`
    ];
};