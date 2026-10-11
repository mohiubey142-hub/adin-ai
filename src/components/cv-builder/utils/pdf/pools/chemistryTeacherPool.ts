// utils/pools/chemistryTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getChemistryTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught Chemistry to 200+ students, making Organic Chemistry and Chemical Bonding accessible`,
            `• Conducted 40+ lab experiments that enhanced student understanding by 35%`,
            `• Developed lesson plans that simplified Periodic Table and Stoichiometry concepts`,
            `• Used everyday examples to explain Chemistry concepts, improving engagement by 30%`,
            `• Collaborated with Biology teachers for interdisciplinary Biochemistry lessons`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Chemistry department of 6 teachers, improving student performance by 30%`,
            `• Developed innovative lab experiments that won 2 inter-school awards`,
            `• Created comprehensive exam preparation materials that improved grades by 35%`,
            `• Introduced safety protocols that reduced lab incidents by 80%`,
            `• Mentored 5 junior Chemistry teachers through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Chemistry department of 12 teachers, achieving 80% A-grades in board exams`,
            `• Developed curriculum that became regional standard for Chemistry education`,
            `• Published 3 research papers in Chemistry education journals`,
            `• Created teacher training program improving teaching quality by 35%`,
            `• Built partnerships with 5+ chemical industries for student internships`
        ];
    }
    return [
        `• Served as Director of Science Education, overseeing 40+ Science teachers across 8 schools`,
        `• Led Chemistry transformation improving student interest in Science by 50%`,
        `• Built Chemistry department from ground up, hiring 30+ teachers across 3 levels`,
        `• Presented Science strategy to board and secured $3M for lab modernization`,
        `• Mentored 15 Science leads who now run their own departments`
    ];
};