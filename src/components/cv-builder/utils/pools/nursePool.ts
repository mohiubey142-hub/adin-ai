// utils/pools/nursePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getNurseBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Cared for 20+ patients daily with compassion and precision at ${company}`,
            `• Administered medications and treatments following protocols for 50+ patients`,
            `• Documented patient care accurately and thoroughly for 100+ patients`,
            `• Collaborated with doctors and healthcare team to provide best care for 100+ patients`,
            `• Built trust with patients and their families for 50+ families`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led team of 5 nurses, improving patient satisfaction by 30% at ${company}`,
            `• Developed protocols that reduced medication errors by 50%`,
            `• Implemented better documentation system that saved 10 hours/week`,
            `• Managed relationships with 50+ families, building trust during difficult times`,
            `• Mentored 8 junior nurses through clinical training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led nursing team of 30, overseeing 100+ patients daily at ${company}`,
            `• Defined nursing protocols that became hospital standard`,
            `• Drove quality improvement initiative that reduced readmission rates by 25%`,
            `• Created training program that improved nursing skills by 40%`,
            `• Partnered with hospital leadership to improve patient experience by 20%`
        ];
    }
    return [
        `• Served as Director of Nursing, overseeing 100+ nurses and $10M nursing budget`,
        `• Led nursing transformation that improved patient outcomes by 35%`,
        `• Built nursing organization from ground up, hiring 80+ nurses across 5 units`,
        `• Presented nursing strategy to board and secured $5M for nursing innovation`,
        `• Mentored 15 nurse leaders who now run their own nursing units`
    ];
};