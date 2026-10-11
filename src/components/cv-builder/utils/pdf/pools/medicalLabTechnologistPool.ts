// utils/pools/medicalLabTechnologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalLabTechnologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 1,000+ laboratory tests across hematology, microbiology, and clinical chemistry at ${company}`,
            `• Processed 500+ patient samples daily with 99.5% accuracy and zero critical errors`,
            `• Maintained and calibrated 20+ laboratory instruments, ensuring 99.8% uptime`,
            `• Ensured compliance with ISO 15189 and CLIA standards for all laboratory procedures`,
            `• Participated in 5+ external quality assurance programs with 100% pass rate`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led medical laboratory department of 10 technologists, managing 2,000+ tests daily at ${company}`,
            `• Implemented quality control system reducing errors by 45% and improving turnaround time by 30%`,
            `• Introduced 5+ new test protocols, expanding diagnostic capabilities for 10+ conditions`,
            `• Trained 12+ junior technologists in advanced laboratory techniques and quality assurance`,
            `• Prepared laboratory for successful ISO 15189 accreditation, exceeding all requirements`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed laboratory services across 4 facilities at ${company}, managing 30+ technologists`,
            `• Established laboratory quality management system adopted across 10+ facilities`,
            `• Launched molecular diagnostics program enabling genetic testing for 20+ conditions`,
            `• Developed training programs for 25+ laboratory technologists and residents`,
            `• Secured ISO 15189 accreditation for 3 laboratories, achieving 100% compliance`
        ];
    }
    return [
        `• Served as Director of Laboratory Services, overseeing 60+ technologists and $10M annual budget`,
        `• Led laboratory transformation increasing testing capacity by 60% across 6 facilities`,
        `• Built laboratory organization from ground up, hiring 55+ specialists across 5 locations`,
        `• Presented laboratory strategy to board and secured $12M for automation and expansion`,
        `• Mentored 22 laboratory leads who now manage their own laboratory departments`
    ];
};