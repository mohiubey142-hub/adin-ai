// utils/pools/dentistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDentistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 500+ dental procedures with 98% accuracy at ${company}`,
            `• Diagnosed and treated 200+ patients with dental conditions`,
            `• Maintained accurate patient records and treatment plans for 300+ patients`,
            `• Built trust with patients who were afraid of the dentist`,
            `• Educated patients on oral hygiene and preventive care`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led dental team of 5, improving patient satisfaction by 40% at ${company}`,
            `• Implemented new procedures reducing treatment time by 30%`,
            `• Developed treatment protocols improving outcomes by 25%`,
            `• Managed relationships with 1000+ patients with 95% satisfaction`,
            `• Mentored 5 junior dentists through clinical training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led dental department at ${company}, overseeing 10+ dentists and 50+ staff`,
            `• Defined clinical protocols that became practice standard`,
            `• Drove quality improvement initiative reducing complications by 50%`,
            `• Created training program improving clinical skills by 40%`,
            `• Partnered with medical professionals to provide integrated care`
        ];
    }
    return [
        `• Served as Clinical Director, overseeing 20+ dentists and $10M practice`,
        `• Led practice transformation increasing revenue by 40%`,
        `• Built dental practice from ground up, hiring 15+ dentists across 3 locations`,
        `• Presented dental innovation to board and secured $2M for expansion`,
        `• Mentored 10 dental leaders who now run their own practices`
    ];
};