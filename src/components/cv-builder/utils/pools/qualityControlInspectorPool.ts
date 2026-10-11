// utils/pools/qualityControlInspectorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getQualityControlInspectorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Inspected 500+ products daily ensuring 99% quality compliance at ${company}`,
            `• Conducted 300+ quality tests on raw materials and finished products`,
            `• Documented 400+ inspection reports with 100% accuracy`,
            `• Identified 200+ quality issues and recommended corrective actions`,
            `• Maintained 100% compliance with quality standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led quality inspection team of 6 inspectors at ${company}`,
            `• Inspected 2,000+ products daily with 99.5% accuracy`,
            `• Implemented quality control procedures reducing defects by 60%`,
            `• Trained 8 junior inspectors in quality standards and testing`,
            `• Improved product quality by 45% through rigorous inspection`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led quality control department of 15 inspectors, ensuring 10,000+ products daily at ${company}`,
            `• Defined quality standards adopted across 5 production lines`,
            `• Drove quality improvement reducing defects to 0.1%`,
            `• Built relationships with 25+ suppliers and customers`,
            `• Published 10+ articles on quality control`
        ];
    }
    return [
        `• Served as Director of Quality Control at ${company}, overseeing 40+ inspectors and $3M budget`,
        `• Led quality transformation achieving 99.9% product quality`,
        `• Built quality control organization from ground up, hiring 35+ inspectors`,
        `• Presented quality strategy to board and secured $2M for testing equipment`,
        `• Mentored 20 quality leaders who now run their own departments`
    ];
};