// utils/pools/prSpecialistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPrSpecialistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Drafted 100+ press releases and media advisories at ${company}`,
            `• Built relationships with 50+ journalists and media outlets`,
            `• Coordinated 30+ media interviews and press events`,
            `• Monitored 200+ media mentions and prepared coverage reports`,
            `• Assisted in 10+ crisis communication situations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led PR campaigns generating 500+ media placements at ${company}`,
            `• Developed crisis communication plans reducing negative coverage by 60%`,
            `• Managed 5+ PR specialists on major announcements`,
            `• Built relationships with 100+ media contacts across industries`,
            `• Achieved 3x increase in brand mentions through strategic PR`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led PR team of 12 specialists, managing $5M budget at ${company}`,
            `• Defined PR strategy adopted across 5 business units`,
            `• Drove brand reputation improvement by 70% through strategic communications`,
            `• Built relationships with C-level executives at 20+ media organizations`,
            `• Published 10+ articles on public relations best practices`
        ];
    }
    return [
        `• Served as Director of PR at ${company}, overseeing 30+ specialists and $10M budget`,
        `• Led PR transformation generating 10,000+ media placements`,
        `• Built PR organization from ground up, hiring 25+ specialists`,
        `• Presented PR strategy to board and secured $8M for communications`,
        `• Mentored 15 PR leaders who now run their own departments`
    ];
};