// utils/pools/englishTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEnglishTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught English to 250+ students, improving their reading, writing, and speaking skills`,
            `• Developed lesson plans that made Grammar, Literature, and Essay Writing accessible`,
            `• Used diverse texts to develop critical thinking for 200+ students`,
            `• Conducted speaking sessions that improved student confidence by 50%`,
            `• Collaborated with other teachers to integrate English across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led English department of 8 teachers, improving student performance by 35%`,
            `• Developed comprehensive curriculum that improved Writing skills by 45%`,
            `• Introduced digital tools that increased engagement by 40%`,
            `• Created Debate and Public Speaking program that produced 5 national-level winners`,
            `• Mentored 6 junior English teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led English department of 16 teachers, achieving 80% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for English education`,
            `• Published 3 research papers in English education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ international schools for student exchange`
        ];
    }
    return [
        `• Served as Director of Language Education, overseeing 50+ Language teachers across 10 schools`,
        `• Led English transformation improving national English scores by 20%`,
        `• Built English department from ground up, hiring 40+ teachers across 5 levels`,
        `• Presented Language strategy to board and secured $3M for language lab modernization`,
        `• Mentored 20 Language leads who now run their own departments`
    ];
};