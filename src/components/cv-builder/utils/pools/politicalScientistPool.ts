// utils/pools/politicalScientistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPoliticalScientistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 50+ political research studies on governance and policy at ${company}`,
            `• Analyzed 100+ political datasets using statistical software`,
            `• Prepared 40+ research reports and policy briefs`,
            `• Assisted in 20+ political analysis projects`,
            `• Documented 200+ research findings with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 20+ political research projects on governance and elections at ${company}`,
            `• Developed analytical frameworks improving policy analysis by 40%`,
            `• Published 5+ research papers in peer-reviewed journals`,
            `• Managed 5+ junior researchers on complex political projects`,
            `• Advised policymakers on 15+ policy decisions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led political science research team of 12 researchers, managing 50+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove policy improvements based on political research`,
            `• Built relationships with 25+ government and academic institutions`,
            `• Published 15+ research papers in leading political science journals`
        ];
    }
    return [
        `• Served as Director of Political Research at ${company}, overseeing 30+ researchers and $4M budget`,
        `• Led political research transformation influencing 10+ national policies`,
        `• Built political science research organization from ground up, hiring 25+ researchers`,
        `• Presented research strategy to board and secured $6M for research initiatives`,
        `• Mentored 15 political science leaders who now run their own departments`
    ];
};