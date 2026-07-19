// utils/pools/lecturerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLecturerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Delivered lectures to 150+ students across 5+ courses at ${company}`,
            `• Developed course materials and assessments for 3+ courses`,
            `• Assessed student work and provided constructive feedback for 150+ students`,
            `• Mentored 30+ students who needed extra support`,
            `• Collaborated with senior faculty to improve course content`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led department of 5+ faculty members at ${company}`,
            `• Developed curriculum that improved student outcomes by 25%`,
            `• Published research in academic journals for 5+ papers`,
            `• Secured $200K in research grants`,
            `• Mentored 5 PhD students through their research`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led faculty of 25+ members across 5+ departments at ${company}`,
            `• Defined academic strategy that became university standard`,
            `• Published influential research with 500+ citations`,
            `• Secured $2M in research funding`,
            `• Built partnerships with 5+ international universities`
        ];
    }
    return [
        `• Served as Dean of Faculty, overseeing 100+ faculty and 5,000+ students`,
        `• Led academic transformation that improved rankings by 20 positions`,
        `• Built academic programs from ground up, hiring 80+ faculty across 5 departments`,
        `• Presented academic strategy to board and secured $25M for research`,
        `• Mentored 15 academic leaders who now run their own departments`
    ];
};