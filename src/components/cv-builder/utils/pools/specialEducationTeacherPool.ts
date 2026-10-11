// utils/pools/specialEducationTeacherPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSpecialEducationTeacherBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Taught 100+ students with special needs including autism, ADHD, and learning disabilities at ${company}`,
            `• Developed 200+ individualized education plans (IEPs) tailored to student needs`,
            `• Implemented 50+ behavioral intervention strategies improving classroom behavior by 40%`,
            `• Collaborated with 10+ therapists and counselors on student development`,
            `• Documented 300+ student progress reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led special education department of 8 teachers at ${company}`,
            `• Developed inclusive curriculum improving student outcomes by 45%`,
            `• Trained 10 general education teachers in inclusive practices`,
            `• Implemented assistive technology improving learning by 50%`,
            `• Improved student engagement and participation by 60%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led special education program of 20 teachers, serving 500+ students at ${company}`,
            `• Defined special education standards adopted across 5 schools`,
            `• Drove inclusive education improvements increasing graduation by 40%`,
            `• Built relationships with 25+ therapy centers and advocacy groups`,
            `• Published 10+ research papers in special education journals`
        ];
    }
    return [
        `• Served as Director of Special Education at ${company}, overseeing 40+ teachers and $5M budget`,
        `• Led special education transformation improving outcomes by 60%`,
        `• Built special education program from ground up, hiring 35+ teachers`,
        `• Presented education strategy to board and secured $3M for resources`,
        `• Mentored 20 special education leaders who now run their own departments`
    ];
};