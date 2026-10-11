// utils/pools/journalistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getJournalistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Wrote 200+ news articles and features for digital and print at ${company}`,
            `• Conducted 100+ interviews with sources across various sectors`,
            `• Researched and fact-checked 150+ stories ensuring accuracy`,
            `• Covered 50+ events and breaking news stories`,
            `• Built a network of 100+ sources and contacts`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led investigative reporting on 10+ major stories at ${company}`,
            `• Broke 5+ exclusive stories that made national headlines`,
            `• Developed 3+ award-winning journalistic series`,
            `• Mentored 5 junior journalists in investigative techniques`,
            `• Built relationships with 200+ sources across industries`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led newsroom team of 15 journalists, producing 2,000+ stories annually at ${company}`,
            `• Defined editorial standards adopted across the newsroom`,
            `• Drove investigative journalism winning 5+ national awards`,
            `• Built relationships with 500+ sources and officials`,
            `• Published 20+ articles in leading publications`
        ];
    }
    return [
        `• Served as Editor-in-Chief at ${company}, overseeing 50+ journalists and editorial operations`,
        `• Led newsroom transformation winning 10+ national awards`,
        `• Built news organization from ground up, hiring 40+ journalists`,
        `• Presented editorial strategy to board and secured $10M for newsroom expansion`,
        `• Mentored 25 journalists who now lead their own newsrooms`
    ];
};