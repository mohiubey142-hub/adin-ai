// utils/pools/softwareTesterPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSoftwareTesterBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Tested 50+ software applications identifying 500+ bugs at ${company}`,
            `• Created 1,000+ test cases with 95% coverage`,
            `• Performed 500+ manual and automated tests`,
            `• Documented 400+ test results with 100% accuracy`,
            `• Collaborated with developers to resolve 300+ issues`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led testing team of 5 testers at ${company}`,
            `• Tested 20+ complex software systems with 99% bug detection`,
            `• Implemented automated testing reducing test time by 60%`,
            `• Trained 8 junior testers in testing methodologies`,
            `• Improved software quality by 50% through rigorous testing`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led QA department of 15 testers, testing 50+ software products at ${company}`,
            `• Defined testing standards adopted across 5 product lines`,
            `• Drove software quality improvement to 99.9%`,
            `• Built relationships with 25+ development teams and stakeholders`,
            `• Published 10+ articles on software testing`
        ];
    }
    return [
        `• Served as Director of QA at ${company}, overseeing 40+ testers and $5M budget`,
        `• Led QA transformation achieving 99.95% software quality`,
        `• Built QA organization from ground up, hiring 35+ testers`,
        `• Presented QA strategy to board and secured $3M for automation`,
        `• Mentored 20 QA leaders who now run their own departments`
    ];
};