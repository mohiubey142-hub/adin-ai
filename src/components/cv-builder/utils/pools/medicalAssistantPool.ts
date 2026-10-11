// utils/pools/medicalAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted physicians in 500+ patient examinations and procedures at ${company}`,
            `• Recorded 1,000+ patient histories and vital signs with 100% accuracy`,
            `• Prepared 800+ patients for examinations and treatments`,
            `• Managed 500+ medical records ensuring 100% confidentiality`,
            `• Administered 200+ injections and medications under supervision`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed clinical operations for 5+ physicians at ${company}`,
            `• Supervised 5+ medical assistants ensuring quality patient care`,
            `• Implemented patient flow improvements reducing wait times by 30%`,
            `• Trained 8 junior medical assistants in clinical procedures`,
            `• Improved patient satisfaction scores by 40% through compassionate care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led medical assistant team of 15 professionals across 3 clinics at ${company}`,
            `• Defined clinical protocols adopted across the organization`,
            `• Drove patient care improvements reducing errors by 60%`,
            `• Built relationships with 25+ healthcare providers and specialists`,
            `• Published 5+ articles on clinical medical assisting`
        ];
    }
    return [
        `• Served as Director of Clinical Services at ${company}, overseeing 30+ assistants and $2M budget`,
        `• Led clinical transformation improving efficiency by 50%`,
        `• Built medical assisting organization from ground up, hiring 25+ professionals`,
        `• Presented clinical strategy to board and secured $1.5M for technology`,
        `• Mentored 15 clinical leaders who now run their own departments`
    ];
};