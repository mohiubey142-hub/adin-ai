// utils/pools/engineeringPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEngineeringBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in designing systems for 10+ projects at ${company}`,
            `• Prepared technical drawings and specifications for 20+ projects`,
            `• Conducted site visits and collected field data for 15+ projects`,
            `• Supported quality control and testing for 10+ engineering systems`,
            `• Collaborated with cross-functional teams on 5+ project executions`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led engineering projects and managed technical teams of 5+ members at ${company}`,
            `• Designed and implemented engineering solutions for 10+ complex problems`,
            `• Conducted feasibility studies and prepared technical proposals for 5+ projects`,
            `• Ensured compliance with industry standards and safety regulations`,
            `• Mentored junior engineers and provided technical guidance to 5+ team members`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed engineering department at ${company}, overseeing 50+ engineers and 20+ projects`,
            `• Developed engineering standards and best practices adopted organization-wide`,
            `• Managed multimillion-dollar project budgets and resource allocation`,
            `• Led innovation initiatives and implemented cutting-edge technologies`,
            `• Provided strategic technical leadership and represented organization at 5+ industry forums`
        ];
    }
    return [
        `• Served as Engineering Director at ${company}, leading technical strategy`,
        `• Oversaw $50M+ infrastructure projects from conception to completion`,
        `• Established engineering standards adopted as industry benchmarks`,
        `• Mentored engineers who now lead their own teams`,
        `• Led digital transformation initiatives saving millions annually`
    ];
};