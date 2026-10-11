// utils/pools/urduTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getUrduTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Urdu to 250+ students, improving their reading, writing, and comprehension skills`,
            `• Developed lesson plans that made Urdu Grammar, Poetry, and Prose accessible`,
            `• Used diverse Urdu literature to develop appreciation for 200+ students`,
            `• Conducted Urdu speaking sessions that improved student confidence by 50%`,
            `• Collaborated with other teachers to integrate Urdu across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Urdu department of 8 teachers, improving student performance by 35%`,
            `• Developed comprehensive curriculum that improved Writing skills by 45%`,
            `• Introduced digital tools that increased engagement by 40%`,
            `• Created Urdu Debate and Mushaira program that produced 5 national-level winners`,
            `• Mentored 6 junior Urdu teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Urdu department of 14 teachers, achieving 80% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for Urdu education`,
            `• Published 3 research papers in Urdu education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ literary organizations for student exposure`
        ];
    }
    return [
        `• Served as Director of Language Education, overseeing 45+ Language teachers across 9 schools`,
        `• Led Urdu transformation that improved national Urdu scores by 20%`,
        `• Built Urdu department from ground up, hiring 35+ teachers across 5 levels`,
        `• Presented Language strategy to board and secured $3M for language modernization`,
        `• Mentored 18 Language leads who now run their own departments`
    ];
};