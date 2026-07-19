// utils/pools/naturalSciencesPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getNaturalSciencesBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted laboratory experiments and recorded scientific data for 50+ projects at ${company}`,
            `• Assisted senior scientists in research projects and analysis for 10+ projects`,
            `• Maintained laboratory equipment and ensured safety compliance for 5+ labs`,
            `• Prepared scientific reports and documentation of findings for 20+ projects`,
            `• Collaborated with research team on experimental design for 5+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led laboratory research projects and supervised scientific teams of 3+ members at ${company}`,
            `• Designed experiments and developed research methodologies for 10+ projects`,
            `• Analyzed complex data and presented findings to stakeholders for 15+ projects`,
            `• Published research in peer-reviewed scientific journals for 3+ projects`,
            `• Trained junior scientists and laboratory staff on protocols for 10+ members`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed scientific research department at ${company}, overseeing multiple laboratories`,
            `• Secured research funding and managed budgets for scientific initiatives totaling $5M`,
            `• Established research partnerships with academic and industry partners for 5+ projects`,
            `• Published groundbreaking research in high-impact scientific journals for 5+ papers`,
            `• Represented organization at international scientific conferences for 5+ events`
        ];
    }
    return [
        `• Served as Scientific Director at ${company}, leading research innovation`,
        `• Secured major research funding and built world-class laboratories`,
        `• Established international research collaborations with 5+ countries`,
        `• Published research that advanced scientific knowledge in the field`,
        `• Mentored scientists who now lead their own research programs`
    ];
};