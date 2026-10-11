// utils/pools/sociologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSociologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 50+ sociological research studies on social behavior at ${company}`,
            `• Collected and analyzed 1,000+ survey responses and interview data`,
            `• Prepared 100+ research reports and academic papers`,
            `• Assisted in 20+ community-based research projects`,
            `• Documented 200+ research findings with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 20+ sociological research projects on social issues at ${company}`,
            `• Developed research methodologies improving data quality by 40%`,
            `• Published 5+ research papers in peer-reviewed journals`,
            `• Managed 5+ junior sociologists on complex research projects`,
            `• Presented research findings at 10+ national conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led sociology research team of 12 researchers, managing 50+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove social policy improvements based on research findings`,
            `• Built relationships with 25+ academic and government institutions`,
            `• Published 15+ research papers in leading sociology journals`
        ];
    }
    return [
        `• Served as Director of Sociological Research at ${company}, overseeing 30+ researchers and $3M budget`,
        `• Led sociological transformation influencing 10+ social policies`,
        `• Built sociology research organization from ground up, hiring 25+ researchers`,
        `• Presented research strategy to board and secured $5M for research initiatives`,
        `• Mentored 15 sociology leaders who now run their own departments`
    ];
};