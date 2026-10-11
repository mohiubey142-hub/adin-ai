// utils/pools/physicalTherapistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhysicalTherapistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided physical therapy to 300+ patients with musculoskeletal and neurological conditions at ${company}`,
            `• Designed and implemented 200+ individualized treatment plans`,
            `• Performed 500+ therapeutic exercises and manual therapy sessions`,
            `• Achieved 85% patient satisfaction rate through compassionate care`,
            `• Documented 1,000+ patient sessions with 100% compliance to documentation standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed caseload of 150+ patients with complex rehabilitation needs at ${company}`,
            `• Developed sports rehabilitation program returning 90% of athletes to play`,
            `• Led 1,000+ therapy sessions using advanced manual therapy techniques`,
            `• Reduced patient recovery time by 30% through evidence-based interventions`,
            `• Mentored 5 junior physical therapists in orthopedic rehabilitation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led physical therapy department of 15 therapists, treating 2,000+ patients annually at ${company}`,
            `• Established rehabilitation center with advanced equipment and techniques`,
            `• Developed post-surgical rehabilitation program reducing recovery time by 40%`,
            `• Published 8+ research papers in physical therapy journals`,
            `• Mentored 20+ physical therapists who now lead their own clinics`
        ];
    }
    return [
        `• Served as Director of Rehabilitation at ${company}, overseeing 40+ therapists and $12M budget`,
        `• Built rehabilitation center from ground up, serving 5,000+ patients annually`,
        `• Led rehabilitation research program securing $5M in grants`,
        `• Presented rehabilitation strategy to board and secured $8M for facility expansion`,
        `• Mentored 25+ rehabilitation leaders who now head their own departments`
    ];
};