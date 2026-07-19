// utils/pools/pakistanStudiesTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPakistanStudiesTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Pakistan Studies to 250+ students, making History, Geography, and Civics engaging`,
            `• Developed lesson plans that simplified Pakistan's history, culture, and governance`,
            `• Used stories from Pakistan's history to make learning meaningful for 200+ students`,
            `• Conducted interactive sessions that improved student understanding by 40%`,
            `• Collaborated with other teachers to integrate Pakistan Studies across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Pakistan Studies department of 6 teachers, improving student performance by 35%`,
            `• Developed comprehensive curriculum that improved historical understanding by 45%`,
            `• Introduced project-based learning that increased engagement by 40%`,
            `• Created Pakistan History Quiz and Research program that produced 8 national-level winners`,
            `• Mentored 5 junior Pakistan Studies teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Pakistan Studies department of 12 teachers, achieving 80% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for Pakistan Studies education`,
            `• Published 3 research papers in Pakistan Studies education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ historical societies for student enrichment`
        ];
    }
    return [
        `• Served as Director of Social Studies Education, overseeing 40+ teachers across 8 schools`,
        `• Led Pakistan Studies transformation improving student interest in history by 50%`,
        `• Built Pakistan Studies department from ground up, hiring 30+ teachers across 4 levels`,
        `• Presented Social Studies strategy to board and secured $2M for program expansion`,
        `• Mentored 15 Social Studies leads who now run their own departments`
    ];
};