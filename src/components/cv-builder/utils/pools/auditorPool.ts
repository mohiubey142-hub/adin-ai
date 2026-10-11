// utils/pools/auditorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAuditorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 20+ financial audits ensuring compliance with GAAP and IFRS at ${company}`,
            `• Reviewed 100+ financial transactions for accuracy and compliance`,
            `• Documented 50+ audit findings and recommendations`,
            `• Performed 30+ internal control assessments identifying weaknesses`,
            `• Supported senior auditors in 10+ external audit engagements`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ audit engagements across multiple industries at ${company}`,
            `• Identified $3M in cost savings through process improvements`,
            `• Developed audit programs reducing audit time by 30%`,
            `• Managed 5+ junior auditors on complex audit projects`,
            `• Presented audit findings to senior management and audit committee`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led audit team of 15 auditors, managing 50+ engagements annually at ${company}`,
            `• Defined audit methodology adopted across the firm`,
            `• Drove risk management improvements reducing fraud by 60%`,
            `• Built relationships with 20+ clients across industries`,
            `• Published 10+ articles on audit best practices`
        ];
    }
    return [
        `• Served as Director of Audit at ${company}, overseeing 40+ auditors and $25M budget`,
        `• Led audit transformation improving efficiency by 50%`,
        `• Built audit practice from ground up, hiring 35+ auditors across 5 offices`,
        `• Presented audit strategy to partners and secured $15M for practice expansion`,
        `• Mentored 20 audit leaders who now run their own practices`
    ];
};