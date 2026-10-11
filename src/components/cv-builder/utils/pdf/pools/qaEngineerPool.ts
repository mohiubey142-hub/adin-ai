// utils/pools/qaEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getQaEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created and executed 100+ test cases for web and mobile applications at ${company}`,
            `• Identified and reported 200+ bugs using JIRA and defect tracking tools`,
            `• Performed regression testing for 20+ releases, ensuring 95% bug-free delivery`,
            `• Documented test plans and test results for 15+ features`,
            `• Collaborated with developers to reproduce and resolve 80+ critical issues`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led QA team of 6 engineers, testing 5+ products with 98% release quality at ${company}`,
            `• Developed test automation framework reducing testing time by 60%`,
            `• Implemented CI/CD integration for automated testing, catching 90% of bugs early`,
            `• Established QA metrics and KPIs improving testing efficiency by 40%`,
            `• Mentored 4 junior QA engineers in automation, testing best practices, and tools`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed QA strategy for 10+ products, managing 20+ QA engineers at ${company}`,
            `• Built quality assurance framework adopted as company standard for SDLC`,
            `• Reduced production defects by 70% through shift-left testing and automation`,
            `• Implemented performance and security testing, identifying 50+ vulnerabilities`,
            `• Partnered with product and engineering teams to embed quality into development culture`
        ];
    }
    return [
        `• Served as Director of Quality Assurance, overseeing 50+ QA professionals and $8M budget`,
        `• Led QA transformation reducing testing cycle time by 50% and defects by 80%`,
        `• Built QA organization from ground up, hiring 40+ engineers across 4 countries`,
        `• Presented QA strategy to CTO and secured $6M for test automation investment`,
        `• Mentored 15 QA leads who now manage their own quality teams`
    ];
};