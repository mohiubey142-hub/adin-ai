// utils/pools/medicalTechnologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalTechnologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 2,000+ laboratory tests including hematology, chemistry, and microbiology at ${company}`,
            `• Processed 500+ blood samples daily with 99.5% accuracy`,
            `• Operated and maintained 20+ laboratory instruments including analyzers and microscopes`,
            `• Documented 1,500+ test results with 100% compliance to quality standards`,
            `• Assisted in 100+ quality control procedures ensuring accurate test results`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed laboratory section performing 5,000+ tests daily at ${company}`,
            `• Implemented quality control program reducing errors by 45%`,
            `• Validated 15+ new laboratory tests and instruments`,
            `• Trained 10 junior technologists in advanced laboratory techniques`,
            `• Achieved 99.9% accuracy in proficiency testing for 3 consecutive years`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led laboratory department of 20 technologists, processing 15,000+ tests daily at ${company}`,
            `• Established laboratory quality management system achieving ISO 15189 accreditation`,
            `• Introduced molecular diagnostics program increasing test menu by 30%`,
            `• Published 5+ research papers in laboratory medicine journals`,
            `• Mentored 15+ medical technologists who now lead their own laboratories`
        ];
    }
    return [
        `• Served as Director of Laboratory Services at ${company}, overseeing 50+ technologists and $10M budget`,
        `• Built laboratory from ground up, performing 100,000+ tests annually`,
        `• Led laboratory automation project reducing turnaround time by 60%`,
        `• Presented laboratory strategy to board and secured $8M for advanced equipment`,
        `• Mentored 25+ laboratory leaders who now head their own departments`
    ];
};