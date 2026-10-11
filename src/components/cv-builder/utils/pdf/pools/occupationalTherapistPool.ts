// utils/pools/occupationalTherapistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getOccupationalTherapistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided occupational therapy services to 80+ patients with physical and cognitive challenges at ${company}`,
            `• Developed 60+ individualized treatment plans to improve activities of daily living (ADLs)`,
            `• Conducted 150+ functional assessments and created detailed progress documentation`,
            `• Applied 5+ therapeutic techniques including neurodevelopmental treatment and sensory integration`,
            `• Educated 120+ patients and caregivers on adaptive strategies and equipment use`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led occupational therapy department of 5 therapists, managing 120+ patient cases monthly at ${company}`,
            `• Developed specialized programs for 5+ clinical areas (stroke rehab, pediatric, geriatric, mental health)`,
            `• Implemented evidence-based protocols improving patient functional outcomes by 35%`,
            `• Trained 8+ junior occupational therapists in advanced assessment and intervention techniques`,
            `• Collaborated with physical therapists and speech therapists for comprehensive patient care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed occupational therapy services across 4 facilities at ${company}, managing 20+ therapists`,
            `• Established therapy protocols that became organizational standards for 5+ conditions`,
            `• Launched community reintegration programs serving 200+ patients annually`,
            `• Developed clinical education program for 12+ occupational therapy interns`,
            `• Led research initiatives resulting in 3+ publications in occupational therapy journals`
        ];
    }
    return [
        `• Served as Director of Occupational Therapy Services, overseeing 45+ therapists and $4M annual budget`,
        `• Led therapy transformation improving patient independence by 45% across 8 facilities`,
        `• Built therapy department from ground up, hiring 40+ specialists across 6 locations`,
        `• Presented therapy strategy to board and secured $6M for facility and program expansion`,
        `• Mentored 20 therapy leads who now manage their own occupational therapy departments`
    ];
};