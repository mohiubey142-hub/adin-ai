// utils/pools/taxConsultantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTaxConsultantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 100+ tax returns for individuals and businesses at ${company}`,
            `• Researched 50+ tax regulations ensuring compliance`,
            `• Assisted in 20+ tax planning engagements saving clients $500K`,
            `• Documented 200+ tax calculations and supporting schedules`,
            `• Supported senior consultants in 10+ IRS audit representations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led tax planning for 30+ corporate clients saving $5M annually at ${company}`,
            `• Developed tax strategies reducing client tax liability by 25%`,
            `• Managed 5+ tax consultants on complex tax engagements`,
            `• Represented clients in 15+ tax audits with 90% success rate`,
            `• Presented tax strategies to C-level executives`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led tax practice of 15 consultants, managing 200+ clients at ${company}`,
            `• Defined tax strategy adopted across the firm`,
            `• Drove tax savings of $20M through innovative planning`,
            `• Built relationships with tax authorities and legal counsel`,
            `• Published 10+ articles on tax planning and compliance`
        ];
    }
    return [
        `• Served as Director of Tax at ${company}, overseeing 40+ consultants and $30M revenue`,
        `• Led tax transformation saving clients $100M+ in taxes`,
        `• Built tax practice from ground up, hiring 35+ consultants across 5 offices`,
        `• Presented tax strategy to clients and secured $25M in new engagements`,
        `• Mentored 20 tax leaders who now run their own practices`
    ];
};