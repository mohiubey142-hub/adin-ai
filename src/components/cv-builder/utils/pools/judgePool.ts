// utils/pools/judgePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getJudgeBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Presided over 200+ cases in civil and criminal courts at ${company}`,
            `• Researched 300+ legal precedents for judicial decisions`,
            `• Drafted 150+ judgments and orders with legal reasoning`,
            `• Conducted 100+ hearings ensuring fair proceedings`,
            `• Maintained 500+ case files with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Presided over 500+ cases including complex civil and criminal matters at ${company}`,
            `• Delivered 300+ judgments with 95% upheld on appeal`,
            `• Developed case management procedures reducing backlog by 40%`,
            `• Mentored 5 junior judges in judicial conduct and legal reasoning`,
            `• Specialized in commercial law, handling 100+ high-value disputes`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led judicial district of 20 judges, managing 2,000+ cases annually at ${company}`,
            `• Defined judicial standards adopted across the district`,
            `• Drove case disposal improvement by 50% through procedural reforms`,
            `• Built relationships with 30+ legal professionals and bar associations`,
            `• Published 10+ articles on judicial reform and legal theory`
        ];
    }
    return [
        `• Served as Chief Justice at ${company}, overseeing 50+ judges and 10,000+ cases annually`,
        `• Led judicial transformation improving case disposal by 60%`,
        `• Built judicial organization from ground up, hiring 40+ judges across 5 districts`,
        `• Presented judicial reform strategy to government and secured $10M for court modernization`,
        `• Mentored 20 judicial leaders who now run their own courts`
    ];
};