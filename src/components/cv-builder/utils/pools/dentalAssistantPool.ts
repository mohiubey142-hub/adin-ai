// utils/pools/dentalAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDentalAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted dentists in 500+ dental procedures including fillings, cleanings, and extractions at ${company}`,
            `• Prepared and sterilized 1,000+ dental instruments ensuring 100% infection control`,
            `• Managed patient records for 800+ patients with 100% accuracy`,
            `• Provided chairside assistance to 5+ dentists during complex procedures`,
            `• Educated 200+ patients on oral hygiene and post-treatment care`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed dental assistant team of 5 professionals at ${company}`,
            `• Assisted in 1,000+ dental procedures including implants and root canals`,
            `• Implemented sterilization protocols reducing infections by 80%`,
            `• Trained 8 junior dental assistants in chairside procedures`,
            `• Improved patient satisfaction scores by 35% through quality care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led dental assisting team of 12 professionals at ${company}`,
            `• Defined clinical protocols adopted across 3 dental clinics`,
            `• Drove patient care improvements reducing wait times by 40%`,
            `• Managed $500K dental supply budget with 20% cost savings`,
            `• Mentored 20+ dental assistants who now lead their own teams`
        ];
    }
    return [
        `• Served as Director of Dental Services at ${company}, overseeing 30+ assistants and $2M budget`,
        `• Led dental practice transformation improving efficiency by 50%`,
        `• Built dental assisting organization from ground up, hiring 25+ professionals`,
        `• Presented dental strategy to board and secured $1M for equipment modernization`,
        `• Mentored 15 dental leaders who now run their own practices`
    ];
};