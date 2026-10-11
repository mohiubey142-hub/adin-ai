// utils/pools/speechTherapistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSpeechTherapistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided speech therapy services to 70+ patients with communication and swallowing disorders at ${company}`,
            `• Conducted 100+ comprehensive speech and language assessments for children and adults`,
            `• Developed 50+ individualized treatment plans addressing articulation, fluency, and voice disorders`,
            `• Applied 10+ therapeutic techniques including oral-motor exercises and augmentative communication`,
            `• Educated 90+ families on home programs and strategies to support speech development`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led speech therapy department of 5 therapists, managing 100+ patient cases monthly at ${company}`,
            `• Developed specialized programs for 5+ clinical areas (pediatric, stroke rehab, autism, voice disorders)`,
            `• Implemented innovative therapy protocols improving communication outcomes by 40%`,
            `• Trained 8+ junior speech therapists in advanced assessment and intervention techniques`,
            `• Collaborated with schools and families for 30+ cases, ensuring integrated care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed speech therapy services across 4 facilities at ${company}, managing 18+ therapists`,
            `• Established therapy protocols that became organizational standards for 5+ communication disorders`,
            `• Launched early intervention programs for 150+ children with speech delays annually`,
            `• Developed clinical education program for 10+ speech therapy interns and residents`,
            `• Led research initiatives resulting in 3+ publications in speech-language pathology journals`
        ];
    }
    return [
        `• Served as Director of Speech & Language Therapy Services, overseeing 35+ therapists and $3M annual budget`,
        `• Led therapy transformation improving communication outcomes by 45% across 6 facilities`,
        `• Built therapy department from ground up, hiring 30+ specialists across 5 locations`,
        `• Presented therapy strategy to board and secured $5M for technology and program expansion`,
        `• Mentored 16 therapy leads who now manage their own speech therapy departments`
    ];
};