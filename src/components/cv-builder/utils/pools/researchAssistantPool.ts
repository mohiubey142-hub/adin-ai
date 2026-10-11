// utils/pools/researchAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getResearchAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in 20+ research projects across various disciplines at ${company}`,
            `• Collected and analyzed 1,000+ data points using statistical software`,
            `• Conducted 100+ literature reviews and summaries`,
            `• Prepared 50+ research reports and presentations`,
            `• Documented 300+ research findings with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 10+ research projects from design to publication at ${company}`,
            `• Developed research methodologies improving data quality by 40%`,
            `• Co-authored 5+ research papers in peer-reviewed journals`,
            `• Managed 5+ junior research assistants on complex projects`,
            `• Presented research findings at 10+ conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led research team of 12 assistants, managing 30+ projects at ${company}`,
            `• Defined research standards adopted across the organization`,
            `• Drove research innovation leading to 10+ publications`,
            `• Built relationships with 25+ academic and research institutions`,
            `• Published 15+ research papers in leading journals`
        ];
    }
    return [
        `• Served as Director of Research at ${company}, overseeing 30+ assistants and $5M budget`,
        `• Led research transformation achieving 20+ breakthrough findings`,
        `• Built research organization from ground up, hiring 25+ assistants`,
        `• Presented research strategy to board and secured $10M for research initiatives`,
        `• Mentored 15 research leaders who now run their own departments`
    ];
};