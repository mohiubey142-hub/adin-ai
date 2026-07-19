// utils/pools/plumberPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPlumberBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and repaired plumbing systems in 100+ homes at ${company}`,
            `• Learned to read blueprints and building codes for 20+ projects`,
            `• Diagnosed and fixed 200+ leaks efficiently`,
            `• Assisted senior plumbers with complex installations for 30+ projects`,
            `• Worked with construction teams to ensure proper plumbing installation for 20+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led plumbing installations for 50+ commercial buildings at ${company}`,
            `• Designed plumbing systems for 10+ residential and commercial projects`,
            `• Troubleshot complex plumbing issues with 98% success rate`,
            `• Managed 10+ plumbers across multiple sites`,
            `• Trained 12 junior plumbers through hands-on mentorship`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led plumbing department of 40+, overseeing 100+ projects annually at ${company}`,
            `• Defined plumbing standards that became industry benchmark`,
            `• Drove innovation that reduced installation time by 30%`,
            `• Created training program that certified 80+ plumbers`,
            `• Built partnerships with suppliers, reducing material costs by 25%`
        ];
    }
    return [
        `• Served as Director of Plumbing Operations, overseeing 150+ plumbers and $30M portfolio`,
        `• Led plumbing transformation that improved project delivery by 35%`,
        `• Built plumbing organization from ground up, hiring 120+ professionals across 5 cities`,
        `• Presented plumbing strategy to board and secured $15M for expansion`,
        `• Mentored 20 plumbing leads who now run their own teams`
    ];
};