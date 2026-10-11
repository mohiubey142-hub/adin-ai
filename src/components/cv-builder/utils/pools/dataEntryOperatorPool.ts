// utils/pools/dataEntryOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDataEntryOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Entered 10,000+ data records daily with 99.5% accuracy at ${company}`,
            `• Maintained 100% data confidentiality and security compliance`,
            `• Processed 5,000+ documents monthly into digital systems`,
            `• Verified and corrected 2,000+ data entries reducing errors by 80%`,
            `• Documented 1,000+ data transactions with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led data entry team of 8 operators at ${company}`,
            `• Managed 50,000+ data records monthly with 99.9% accuracy`,
            `• Implemented quality checks reducing errors by 70%`,
            `• Trained 10 junior operators in data management systems`,
            `• Improved data processing speed by 40% through workflow optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led data operations of 25 operators, processing 500,000+ records annually at ${company}`,
            `• Defined data entry standards adopted across 5 departments`,
            `• Drove data accuracy improvement to 99.95%`,
            `• Built relationships with 25+ internal stakeholders`,
            `• Published 5+ articles on data management best practices`
        ];
    }
    return [
        `• Served as Director of Data Operations at ${company}, overseeing 50+ operators and $3M budget`,
        `• Led data operations transformation improving efficiency by 60%`,
        `• Built data operations from ground up, hiring 40+ operators`,
        `• Presented data strategy to board and secured $2M for automation`,
        `• Mentored 20 data operations leaders who now run their own departments`
    ];
};