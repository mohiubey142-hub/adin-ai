// utils/pools/islamicStudiesTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getIslamicStudiesTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Islamic Studies to 250+ students, making Quran, Hadith, and Islamic History accessible`,
            `• Developed lesson plans that simplified Islamic beliefs, practices, and values`,
            `• Used stories from Islamic history to make learning engaging for 200+ students`,
            `• Conducted Quran recitation sessions that improved student skills by 40%`,
            `• Collaborated with other teachers to integrate Islamic values across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Islamic Studies department of 7 teachers, improving student performance by 35%`,
            `• Developed comprehensive curriculum that improved Quran understanding by 45%`,
            `• Introduced interactive methods that increased engagement by 40%`,
            `• Created Quran Competition and Islamic Quiz program that produced 10 national-level winners`,
            `• Mentored 6 junior Islamic Studies teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Islamic Studies department of 14 teachers, achieving 85% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for Islamic Studies education`,
            `• Published 2 research papers in Islamic Studies education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ Islamic institutions for student enrichment`
        ];
    }
    return [
        `• Served as Director of Islamic Studies Education, overseeing 50+ teachers across 10 schools`,
        `• Led Islamic Studies transformation improving student character development by 40%`,
        `• Built Islamic Studies department from ground up, hiring 40+ teachers across 5 levels`,
        `• Presented Islamic Studies strategy to board and secured $3M for program expansion`,
        `• Mentored 20 Islamic Studies leads who now run their own departments`
    ];
};