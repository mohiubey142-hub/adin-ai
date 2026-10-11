// utils/pools/teacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Planned and delivered engaging lessons for 150+ students following curriculum guidelines at ${company}`,
            `• Assessed student work and provided constructive feedback to 200+ students`,
            `• Maintained classroom management and created positive learning environment for 5+ classes`,
            `• Collaborated with senior teachers to develop instructional materials for 3+ subjects`,
            `• Communicated with parents regarding student progress and concerns for 100+ students`
        ];
    }
    if (level === 'mid') {
        return [
            `• Developed comprehensive unit plans and assessments for 10+ courses at ${company}`,
            `• Implemented differentiated instruction strategies to accommodate diverse learning needs of 200+ students`,
            `• Mentored 5+ new teachers and served as grade-level team leader`,
            `• Analyzed student performance data to inform instructional decisions for 150+ students`,
            `• Led parent-teacher conferences for 80+ families and developed individualized learning plans`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led department of 12+ teachers at ${company}, driving curriculum development and instructional excellence`,
            `• Designed school-wide assessment framework and professional development program for 50+ teachers`,
            `• Mentored teaching staff through 100+ classroom observations with feedback`,
            `• Increased student achievement scores by 25% through data-driven interventions`,
            `• Presented at 5+ educational conferences on innovative teaching strategies`
        ];
    }
    return [
        `• Served as Academic Director at ${company}, overseeing all educational programs for 2,000+ students`,
        `• Developed strategic partnerships with 5+ universities and educational institutions`,
        `• Managed annual budget of $2M and led team of 50+ faculty members`,
        `• Implemented technology integration plan across 20+ departments`,
        `• Improved graduation rates by 25% through retention initiatives`
    ];
};