// utils/pools/medicalCoderPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalCoderBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Coded 1,000+ medical records using ICD-10 and CPT at ${company}`,
            `• Reviewed 500+ patient charts for accurate coding`,
            `• Maintained 98% coding accuracy across all specialties`,
            `• Processed 800+ claims with 95% first-pass acceptance`,
            `• Documented 500+ coding decisions with 100% compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led medical coding team of 5 coders at ${company}`,
            `• Coded 2,000+ complex medical records monthly`,
            `• Improved coding accuracy to 99.5% through quality audits`,
            `• Trained 8 junior coders in ICD-10 and CPT coding`,
            `• Reduced claim denials by 40% through accurate coding`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led medical coding department of 15 coders, processing 20,000+ records annually at ${company}`,
            `• Defined coding standards adopted across 3 facilities`,
            `• Drove revenue improvement of 25% through accurate coding`,
            `• Built relationships with 25+ healthcare providers and insurance companies`,
            `• Published 5+ articles on medical coding best practices`
        ];
    }
    return [
        `• Served as Director of Medical Coding at ${company}, overseeing 40+ coders and $3M budget`,
        `• Led coding transformation improving revenue by 35%`,
        `• Built medical coding organization from ground up, hiring 35+ coders`,
        `• Presented coding strategy to board and secured $2M for technology`,
        `• Mentored 20 coding leaders who now run their own departments`
    ];
};