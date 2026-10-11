// utils/pools/cardiologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCardiologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 200+ echocardiograms and stress tests, identifying cardiac abnormalities in 15% of cases at ${company}`,
            `• Assisted senior cardiologists in 50+ cardiac catheterization procedures with 100% patient safety`,
            `• Managed 100+ patients with hypertension and heart failure, achieving 90% blood pressure control`,
            `• Interpreted 500+ ECGs and Holter monitors, detecting arrhythmias requiring intervention`,
            `• Participated in 30+ emergency cardiac cases, providing rapid assessment and stabilization`
        ];
    }
    if (level === 'mid') {
        return [
            `• Performed 500+ cardiac catheterizations and 200+ angioplasties with 98% success rate at ${company}`,
            `• Managed 300+ patients with complex cardiac conditions, improving outcomes by 35%`,
            `• Led cardiac rehabilitation program for 150+ patients, reducing readmissions by 40%`,
            `• Performed 100+ pacemaker implantations with zero major complications`,
            `• Mentored 5 junior cardiologists in interventional procedures and patient management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led cardiology department of 15 specialists, performing 1,000+ interventional procedures annually at ${company}`,
            `• Established heart failure clinic that reduced hospitalizations by 45%`,
            `• Introduced TAVR program, performing 50+ procedures with 97% success rate`,
            `• Published 15+ research papers in peer-reviewed cardiology journals`,
            `• Mentored 20+ cardiology fellows who now practice across 5 countries`
        ];
    }
    return [
        `• Served as Director of Cardiology at ${company}, overseeing 40+ cardiologists and $25M budget`,
        `• Built cardiovascular center from ground up, performing 5,000+ procedures annually`,
        `• Led heart transplant program achieving 90% 5-year survival rate`,
        `• Presented cardiovascular strategy to board and secured $15M for advanced equipment`,
        `• Mentored 30+ cardiology leaders who now head their own departments`
    ];
};