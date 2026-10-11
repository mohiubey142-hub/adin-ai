// utils/pools/packagingOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPackagingOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Operated packaging machines producing 10,000+ units daily at ${company}`,
            `• Maintained 99% packaging quality across all products`,
            `• Performed 500+ quality checks on packaged products`,
            `• Managed inventory of 50+ packaging materials`,
            `• Documented 400+ production reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led packaging team of 8 operators at ${company}`,
            `• Operated packaging lines producing 50,000+ units daily`,
            `• Implemented quality control reducing defects by 60%`,
            `• Trained 10 junior operators in packaging procedures`,
            `• Improved packaging efficiency by 40% through process optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led packaging department of 25 operators, producing 500,000+ units daily at ${company}`,
            `• Defined packaging standards adopted across 5 production lines`,
            `• Drove packaging efficiency improvement by 60%`,
            `• Built relationships with 25+ suppliers and distributors`,
            `• Published 10+ articles on packaging operations`
        ];
    }
    return [
        `• Served as Director of Packaging at ${company}, overseeing 50+ operators and $5M budget`,
        `• Led packaging transformation improving efficiency by 70%`,
        `• Built packaging organization from ground up, hiring 40+ operators`,
        `• Presented packaging strategy to board and secured $4M for automation`,
        `• Mentored 20 packaging leaders who now run their own departments`
    ];
};