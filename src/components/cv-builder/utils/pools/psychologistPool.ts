// utils/pools/psychologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPsychologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 200+ psychological assessments and evaluations at ${company}`,
            `• Provided 300+ therapy sessions using CBT and other modalities`,
            `• Maintained 100+ client case files with 100% confidentiality`,
            `• Assisted in 50+ crisis interventions and mental health screenings`,
            `• Documented 200+ clinical notes with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed caseload of 80+ clients with complex psychological conditions at ${company}`,
            `• Developed treatment programs reducing symptoms by 60%`,
            `• Led 1,000+ therapy sessions using evidence-based approaches`,
            `• Supervised 5+ junior psychologists in clinical practice`,
            `• Conducted 50+ workshops on mental health awareness`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led psychology department of 15 psychologists, treating 1,000+ clients annually at ${company}`,
            `• Defined clinical protocols adopted across the organization`,
            `• Drove mental health outcomes improvement by 45%`,
            `• Built relationships with 20+ mental health organizations`,
            `• Published 10+ research papers in psychology journals`
        ];
    }
    return [
        `• Served as Director of Psychology at ${company}, overseeing 30+ psychologists and $5M budget`,
        `• Led mental health transformation improving outcomes by 60%`,
        `• Built psychology practice from ground up, hiring 25+ psychologists`,
        `• Presented mental health strategy to board and secured $8M for programs`,
        `• Mentored 15 psychology leaders who now run their own departments`
    ];
};