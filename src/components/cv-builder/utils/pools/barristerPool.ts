// utils/pools/barristerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBarristerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 80+ legal opinions and advices for solicitors at ${company}`,
            `• Drafted 100+ pleadings and skeleton arguments`,
            `• Researched 150+ case laws for ongoing matters`,
            `• Assisted in 40+ court appearances and hearings`,
            `• Maintained 200+ case files with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Represented 60+ clients in court proceedings at ${company}`,
            `• Won 35+ cases through effective advocacy`,
            `• Specialized in criminal law, handling 25+ jury trials`,
            `• Negotiated 20+ settlements saving clients $2M`,
            `• Mentored 5 junior barristers in advocacy skills`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led chambers of 15 barristers, managing 200+ active cases at ${company}`,
            `• Defined advocacy strategy adopted across chambers`,
            `• Won 50+ high-stakes cases including 5 landmark judgments`,
            `• Built relationships with 30+ solicitors and judges`,
            `• Published 10+ articles in legal journals`
        ];
    }
    return [
        `• Served as Head of Chambers at ${company}, overseeing 40+ barristers and $10M revenue`,
        `• Led chambers transformation winning 100+ high-profile cases`,
        `• Built chambers from ground up, hiring 35+ barristers across 5 practice areas`,
        `• Presented legal strategy to clients and secured $8M in new briefs`,
        `• Mentored 20 legal leaders who now run their own chambers`
    ];
};