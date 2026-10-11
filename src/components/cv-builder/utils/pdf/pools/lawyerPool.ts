// utils/pools/lawyerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLawyerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Researched 100+ legal cases and statutes for ongoing matters at ${company}`,
            `• Drafted 50+ legal documents including contracts and pleadings`,
            `• Assisted in 30+ client consultations and case preparations`,
            `• Maintained 200+ case files with 100% accuracy`,
            `• Supported senior lawyers in 20+ court appearances`
        ];
    }
    if (level === 'mid') {
        return [
            `• Represented 50+ clients in civil and criminal matters at ${company}`,
            `• Won 30+ cases through effective legal strategies`,
            `• Negotiated 20+ settlements saving clients $2M in litigation costs`,
            `• Managed 5+ junior lawyers on complex cases`,
            `• Specialized in corporate law, handling 15+ M&A transactions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led legal team of 15 lawyers, managing 200+ active cases at ${company}`,
            `• Defined legal strategy adopted across the firm`,
            `• Won 50+ high-stakes cases including 5 landmark judgments`,
            `• Built relationships with 30+ corporate clients and government agencies`,
            `• Published 10+ articles in legal journals`
        ];
    }
    return [
        `• Served as Managing Partner at ${company}, overseeing 40+ lawyers and $20M revenue`,
        `• Led legal transformation winning 100+ high-profile cases`,
        `• Built law firm from ground up, hiring 35+ lawyers across 5 practice areas`,
        `• Presented legal strategy to clients and secured $15M in new engagements`,
        `• Mentored 20 legal leaders who now run their own practices`
    ];
};