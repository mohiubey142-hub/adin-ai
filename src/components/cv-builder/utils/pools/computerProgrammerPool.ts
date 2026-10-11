// utils/pools/computerProgrammerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getComputerProgrammerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed 15+ software applications using Java, Python, and C++ at ${company}`,
            `• Wrote 50,000+ lines of clean, maintainable code`,
            `• Fixed 200+ bugs and performance issues`,
            `• Participated in 100+ code reviews improving code quality`,
            `• Documented 30+ software modules with 100% coverage`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 10+ software projects at ${company}`,
            `• Architected 5+ complex software systems`,
            `• Improved application performance by 50% through optimization`,
            `• Mentored 5 junior programmers in software development`,
            `• Implemented CI/CD pipelines reducing deployment time by 60%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led programming team of 12 developers, building 20+ software products at ${company}`,
            `• Defined software architecture adopted across 5 product lines`,
            `• Drove innovation in software development methodologies`,
            `• Built relationships with 25+ clients and stakeholders`,
            `• Published 10+ articles on software development best practices`
        ];
    }
    return [
        `• Served as Director of Software Development at ${company}, overseeing 40+ programmers and $5M budget`,
        `• Led software transformation delivering 50+ successful products`,
        `• Built software development organization from ground up, hiring 35+ programmers`,
        `• Presented software strategy to board and secured $10M for R&D`,
        `• Mentored 20 software leaders who now run their own teams`
    ];
};