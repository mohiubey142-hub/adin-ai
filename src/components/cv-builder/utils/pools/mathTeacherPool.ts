// utils/pools/mathTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMathTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Mathematics to 250+ students, making Algebra, Geometry, and Calculus accessible`,
            `• Developed lesson plans that simplified complex topics like Derivatives and Integration`,
            `• Used real-world applications to explain Math concepts for 200+ students`,
            `• Created practice materials that improved problem-solving skills by 40%`,
            `• Collaborated with Physics teachers for applied Mathematics lessons`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Mathematics department of 10 teachers, improving student performance by 35%`,
            `• Developed comprehensive exam preparation materials that improved grades by 45%`,
            `• Introduced technology-based learning that increased engagement by 50%`,
            `• Created Math Olympiad training program that produced 10 national-level winners`,
            `• Mentored 8 junior Math teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Mathematics department of 18 teachers, achieving 85% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for Mathematics`,
            `• Published 4 research papers in Mathematics education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ engineering universities for student pathways`
        ];
    }
    return [
        `• Served as Director of Mathematics Education, overseeing 60+ Math teachers across 12 schools`,
        `• Led Mathematics transformation improving national Math scores by 20%`,
        `• Built Mathematics department from ground up, hiring 50+ teachers across 5 levels`,
        `• Presented Math strategy to Ministry of Education and secured $5M for Math innovation`,
        `• Mentored 25 Math leads who now run their own departments`
    ];
};