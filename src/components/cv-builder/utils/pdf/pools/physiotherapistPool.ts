// utils/pools/physiotherapistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhysiotherapistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided physiotherapy treatment to 100+ patients with musculoskeletal and neurological conditions at ${company}`,
            `• Developed 50+ individualized rehabilitation programs, achieving 85% patient satisfaction`,
            `• Conducted 200+ patient assessments and created detailed treatment progress notes`,
            `• Administered manual therapy, electrotherapy, and exercise-based rehabilitation for 30+ cases weekly`,
            `• Educated 150+ patients and families on home exercise programs, improving recovery outcomes`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led physiotherapy department of 8 therapists, managing 200+ patient cases monthly at ${company}`,
            `• Developed specialized rehabilitation programs for 5+ clinical areas (orthopedic, neurological, pediatric)`,
            `• Implemented evidence-based protocols improving patient recovery time by 30%`,
            `• Trained 10+ junior physiotherapists in advanced manual therapy techniques and assessment methods`,
            `• Collaborated with orthopedic surgeons and neurologists for comprehensive patient care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed physiotherapy services across 3 facilities at ${company}, managing 25+ therapists`,
            `• Established rehabilitation protocols that became organizational standards for 5+ conditions`,
            `• Launched community outreach programs, providing care to 500+ underserved patients annually`,
            `• Developed clinical education programs for 15+ physiotherapy interns and residents`,
            `• Led research initiatives resulting in 3+ publications in physiotherapy journals`
        ];
    }
    return [
        `• Served as Director of Physiotherapy & Rehabilitation, overseeing 50+ therapists and $5M annual budget`,
        `• Led rehabilitation transformation improving patient outcomes by 40% across 7 facilities`,
        `• Built therapy department from ground up, hiring 45+ specialists across 4 locations`,
        `• Presented rehabilitation strategy to board and secured $8M for facility modernization`,
        `• Mentored 20 therapy leads who now manage their own rehabilitation departments`
    ];
};