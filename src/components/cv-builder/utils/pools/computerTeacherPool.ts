// utils/pools/computerTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getComputerTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Computer Science to 200+ students, making Programming and Web Development accessible`,
            `• Developed lesson plans that simplified Coding, HTML, CSS, and JavaScript concepts`,
            `• Used practical projects (websites, apps, games) to engage 150+ students`,
            `• Conducted lab sessions that improved practical skills by 50%`,
            `• Collaborated with other teachers to integrate Technology across 5+ subjects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Computer Science department of 6 teachers, improving student performance by 40%`,
            `• Developed comprehensive curriculum that improved Coding skills by 50%`,
            `• Introduced project-based learning that increased student engagement by 55%`,
            `• Created Coding Club and Hackathon program that produced 10 national-level winners`,
            `• Mentored 5 junior Computer teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Computer Science department of 12 teachers, achieving 85% A-grades in board exams`,
            `• Developed curriculum that became provincial standard for Computer Science education`,
            `• Published 3 research papers in Computer Science education journals`,
            `• Created teacher training program improving teaching quality by 45%`,
            `• Built partnerships with 5+ IT companies for student internships`
        ];
    }
    return [
        `• Served as Director of Computer Science Education, overseeing 40+ teachers across 8 schools`,
        `• Led Computer Science transformation improving national coding scores by 30%`,
        `• Built Computer Science department from ground up, hiring 30+ teachers across 5 levels`,
        `• Presented CS strategy to board and secured $5M for computer lab modernization`,
        `• Mentored 15 CS leads who now run their own departments`
    ];
};