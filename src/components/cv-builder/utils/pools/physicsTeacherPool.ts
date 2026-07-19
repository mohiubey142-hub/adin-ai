// utils/pools/physicsTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhysicsTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Physics to 200+ students, making complex concepts like Quantum Mechanics and Relativity understandable`,
            `• Conducted 50+ lab experiments that enhanced student understanding by 40%`,
            `• Developed lesson plans that simplified Newton's Laws and Electromagnetism concepts`,
            `• Used real-world examples to explain Physics principles, improving engagement by 35%`,
            `• Collaborated with senior teachers to develop engaging teaching methods`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Physics department of 8 teachers, improving student performance by 35%`,
            `• Developed lab experiments that won 3 inter-school competition awards`,
            `• Created comprehensive exam preparation materials that improved grades by 40%`,
            `• Introduced interactive teaching methods that increased engagement by 50%`,
            `• Mentored 6 junior Physics teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Physics department of 15 teachers, achieving 85% A-grades in board exams`,
            `• Developed curriculum that became school-wide standard for Science subjects`,
            `• Published 5 research papers in Physics education journals`,
            `• Created teacher training program improving teaching quality by 40%`,
            `• Built partnerships with 5+ universities for student exchange programs`
        ];
    }
    return [
        `• Served as Director of Science Education, overseeing 50+ Science teachers across 10 schools`,
        `• Led Science education transformation improving national ranking from 15 to 5`,
        `• Built Science department from ground up, hiring 40+ teachers across 5 subjects`,
        `• Presented Science education strategy to Ministry of Education and secured $5M for lab modernization`,
        `• Mentored 20 Science leads who now run their own departments`
    ];
};