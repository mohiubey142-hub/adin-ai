// utils/pools/attorneyPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAttorneyBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Handled 50+ legal matters including contracts and disputes at ${company}`,
            `• Drafted 100+ legal documents and agreements`,
            `• Conducted 30+ client meetings and case assessments`,
            `• Researched 150+ legal precedents for case strategy`,
            `• Assisted senior attorneys in 20+ depositions and hearings`
        ];
    }
    if (level === 'mid') {
        return [
            `• Represented 40+ clients in litigation and transactional matters at ${company}`,
            `• Won 25+ cases through effective legal representation`,
            `• Negotiated 30+ contracts and settlements saving clients $3M`,
            `• Managed 5+ junior attorneys on complex cases`,
            `• Specialized in intellectual property, handling 20+ patent filings`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led legal team of 12 attorneys, managing 150+ active matters at ${company}`,
            `• Defined litigation strategy adopted across the firm`,
            `• Won 40+ high-stakes cases including 3 landmark judgments`,
            `• Built relationships with 25+ corporate clients and regulatory bodies`,
            `• Published 10+ articles in legal publications`
        ];
    }
    return [
        `• Served as Senior Partner at ${company}, overseeing 35+ attorneys and $15M revenue`,
        `• Led legal transformation winning 80+ high-profile cases`,
        `• Built law practice from ground up, hiring 30+ attorneys across 4 offices`,
        `• Presented legal strategy to clients and secured $12M in new engagements`,
        `• Mentored 18 legal leaders who now run their own practices`
    ];
};