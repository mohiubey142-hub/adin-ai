// utils/pools/microbiologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMicrobiologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Cultured and identified 500+ microbial samples including bacteria and fungi at ${company}`,
            `• Performed 200+ microscopy examinations with 95% accuracy`,
            `• Conducted 150+ antimicrobial susceptibility tests`,
            `• Prepared 100+ culture media and reagents`,
            `• Documented 300+ lab results with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led microbiology lab operations processing 1,000+ samples monthly at ${company}`,
            `• Developed rapid diagnostic methods reducing identification time by 50%`,
            `• Published 5+ research papers in microbiology journals`,
            `• Managed 5+ junior microbiologists on complex projects`,
            `• Implemented quality control reducing contamination by 70%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led microbiology department of 12 scientists, processing 10,000+ samples annually at ${company}`,
            `• Defined microbial testing protocols adopted across the organization`,
            `• Drove innovation in molecular microbiology and genomics`,
            `• Built relationships with 20+ academic and clinical research institutions`,
            `• Published 15+ research papers in leading microbiology journals`
        ];
    }
    return [
        `• Served as Director of Microbiology at ${company}, overseeing 30+ scientists and $8M budget`,
        `• Led microbiology transformation achieving 5+ breakthrough discoveries`,
        `• Built microbiology research organization from ground up, hiring 25+ scientists`,
        `• Presented research strategy to board and secured $12M for advanced research`,
        `• Mentored 15 microbiology leaders who now run their own departments`
    ];
};