// utils/pools/legalAdvisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLegalAdvisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided legal advice on 50+ matters including contracts and compliance at ${company}`,
            `• Drafted and reviewed 100+ legal documents and agreements`,
            `• Conducted 30+ legal research projects on regulatory requirements`,
            `• Assisted in 20+ due diligence and risk assessment exercises`,
            `• Maintained 200+ legal files with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Advised on 100+ legal matters across corporate and commercial law at ${company}`,
            `• Developed compliance programs reducing legal risks by 40%`,
            `• Negotiated 30+ contracts saving the company $2M annually`,
            `• Managed 5+ junior advisors on complex legal projects`,
            `• Represented company in 15+ regulatory proceedings`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led legal advisory team of 12 advisors, managing 300+ matters at ${company}`,
            `• Defined legal strategy adopted across 5 business units`,
            `• Drove compliance improvements reducing litigation by 50%`,
            `• Built relationships with 25+ external counsel and regulators`,
            `• Published 10+ articles on corporate legal advisory`
        ];
    }
    return [
        `• Served as General Counsel at ${company}, overseeing 30+ advisors and $5M budget`,
        `• Led legal transformation reducing legal costs by 60%`,
        `• Built legal advisory organization from ground up, hiring 25+ advisors`,
        `• Presented legal strategy to board and secured $8M for compliance programs`,
        `• Mentored 15 legal leaders who now run their own departments`
    ];
};