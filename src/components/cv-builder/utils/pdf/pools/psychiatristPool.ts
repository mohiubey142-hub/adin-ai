// utils/pools/psychiatristPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPsychiatristBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided psychiatric evaluations and treatment to 300+ patients annually at ${company}`,
            `• Managed 150+ patients with depression and anxiety, achieving 70% symptom reduction`,
            `• Conducted 200+ therapy sessions using CBT and motivational interviewing`,
            `• Participated in 50+ crisis interventions, ensuring patient safety`,
            `• Documented 500+ patient cases with 100% compliance to clinical standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed caseload of 200+ patients with complex psychiatric conditions at ${company}`,
            `• Developed addiction recovery program with 60% success rate`,
            `• Led 500+ therapy sessions using evidence-based approaches`,
            `• Reduced psychiatric hospitalizations by 35% through outpatient program`,
            `• Mentored 5 junior psychiatrists in diagnosis and treatment planning`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led psychiatric department of 15 specialists, treating 2,000+ patients annually at ${company}`,
            `• Established mental health program reducing suicide rates by 40%`,
            `• Developed telepsychiatry service reaching 5,000+ rural patients`,
            `• Published 12+ research papers in psychiatric journals`,
            `• Mentored 20+ psychiatry residents who now practice across 4 countries`
        ];
    }
    return [
        `• Served as Director of Psychiatry at ${company}, overseeing 40+ psychiatrists and $15M budget`,
        `• Built mental health hospital from ground up, serving 10,000+ patients annually`,
        `• Led psychiatric research program securing $8M in grants`,
        `• Presented mental health strategy to board and secured $10M for expansion`,
        `• Mentored 30+ psychiatric leaders who now head their own departments`
    ];
};