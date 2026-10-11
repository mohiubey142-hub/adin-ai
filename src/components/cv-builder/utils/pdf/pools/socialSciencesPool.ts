// utils/pools/socialSciencesPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSocialSciencesBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted research and data collection for social science projects for 10+ projects at ${company}`,
            `• Assisted senior researchers in literature reviews and data analysis for 5+ projects`,
            `• Prepared reports and presentations on research findings for 10+ projects`,
            `• Managed survey data and maintained research databases for 5+ projects`,
            `• Collaborated with team members on academic publications for 3+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led research initiatives and managed data analysis teams of 3+ members at ${company}`,
            `• Designed survey instruments and research methodologies for 5+ projects`,
            `• Published research findings in academic journals for 3+ papers`,
            `• Presented research at national and international conferences for 5+ events`,
            `• Mentored junior researchers and supervised student projects for 10+ students`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed research department at ${company}, overseeing multiple research projects`,
            `• Secured research grants and managed budgets for research initiatives totaling $2M`,
            `• Established research partnerships with 5+ universities and NGOs`,
            `• Published influential papers cited by numerous researchers`,
            `• Advised government agencies and organizations on social policy development`
        ];
    }
    return [
        `• Served as Research Director at ${company}, leading social science initiatives`,
        `• Secured significant research funding and built research capacity`,
        `• Established partnerships that advanced social science research`,
        `• Published groundbreaking research that influenced policy`,
        `• Mentored researchers who now lead their own research programs`
    ];
};