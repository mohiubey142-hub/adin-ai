// utils/pools/professorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProfessorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught 200+ students with passion and dedication at ${company}`,
            `• Developed course materials that 95% of students enjoyed`,
            `• Assessed student work and provided constructive feedback for 200+ students`,
            `• Mentored 50+ students who needed extra support`,
            `• Published research in academic journals for 3+ papers`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led department of 10+ faculty members at ${company}`,
            `• Developed curriculum that improved student outcomes by 30%`,
            `• Published research with 100+ citations`,
            `• Secured $500K in research grants`,
            `• Mentored 10 PhD students through their research`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led school of 50+ faculty and 2000+ students at ${company}`,
            `• Defined academic strategy that became university standard`,
            `• Published groundbreaking research with 1000+ citations`,
            `• Secured $5M in research funding`,
            `• Built partnerships with 10+ universities globally`
        ];
    }
    return [
        `• Served as Dean, overseeing 200+ faculty and 10,000+ students`,
        `• Led academic transformation that improved rankings from 50 to 10`,
        `• Built academic programs from ground up, hiring 150+ faculty across 10 departments`,
        `• Presented academic strategy to board and secured $50M for research`,
        `• Mentored 30 academic leaders who now run their own institutions`
    ];
};