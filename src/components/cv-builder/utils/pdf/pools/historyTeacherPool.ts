// utils/pools/historyTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHistoryTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught History to 200+ students, making World History, European History, and Ancient Civilizations exciting`,
            `• Developed lesson plans that simplified historical events and their significance`,
            `• Used stories from history to make learning memorable for 200+ students`,
            `• Conducted interactive sessions that improved student understanding by 40%`,
            `• Collaborated with other teachers to integrate History across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led History department of 5 teachers, improving student performance by 35%`,
            `• Developed comprehensive curriculum that improved historical analysis skills by 45%`,
            `• Introduced primary source analysis that increased engagement by 40%`,
            `• Created History Research program that produced 5 national-level winners`,
            `• Mentored 4 junior History teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led History department of 10 teachers, achieving 78% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for History education`,
            `• Published 3 research papers in History education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ museums and archives for student enrichment`
        ];
    }
    return [
        `• Served as Director of Humanities, overseeing 35+ Humanities teachers across 7 schools`,
        `• Led History transformation that improved student critical thinking by 45%`,
        `• Built History department from ground up, hiring 25+ teachers across 4 levels`,
        `• Presented Humanities strategy to board and secured $2M for program expansion`,
        `• Mentored 12 Humanities leads who now run their own departments`
    ];
};