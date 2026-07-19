// utils/pools/biologyTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBiologyTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Biology to 200+ students, making Genetics, Human Anatomy, and Evolution engaging`,
            `• Conducted 50+ lab experiments that enhanced student understanding by 40%`,
            `• Developed lesson plans that simplified Cell Biology and DNA replication concepts`,
            `• Used real-world examples to explain Biology concepts, improving engagement by 35%`,
            `• Collaborated with Chemistry teachers for Biochemistry lessons`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Biology department of 7 teachers, improving student performance by 30%`,
            `• Developed innovative lab experiments that won 3 inter-school awards`,
            `• Created comprehensive exam preparation materials that improved grades by 40%`,
            `• Introduced digital resources (3D models, simulations) increasing engagement by 45%`,
            `• Mentored 6 junior Biology teachers through professional development programs`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Biology department of 14 teachers, achieving 82% A-grades in board exams`,
            `• Developed curriculum that became regional standard for Biology education`,
            `• Published 4 research papers in Biology education journals`,
            `• Created teacher training program improving teaching quality by 35%`,
            `• Built partnerships with 5+ medical colleges for student pathways`
        ];
    }
    return [
        `• Served as Director of Science Education, overseeing 45+ Science teachers across 9 schools`,
        `• Led Biology transformation improving student interest in Life Sciences by 55%`,
        `• Built Biology department from ground up, hiring 35+ teachers across 3 levels`,
        `• Presented Science strategy to board and secured $4M for lab modernization`,
        `• Mentored 18 Science leads who now run their own departments`
    ];
};