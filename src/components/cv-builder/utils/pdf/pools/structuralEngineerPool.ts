// utils/pools/structuralEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getStructuralEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed structural designs for 10+ buildings using ETABS and SAP2000 at ${company}`,
            `• Prepared 50+ structural calculations and drawings`,
            `• Conducted 30+ site inspections ensuring construction quality`,
            `• Collaborated with architects on 15+ building designs`,
            `• Documented 200+ structural specifications and reports`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led structural design for 10+ major projects worth $100M at ${company}`,
            `• Designed earthquake-resistant structures for high-rise buildings`,
            `• Optimized structural designs reducing material costs by 25%`,
            `• Managed 5+ structural engineering teams on complex projects`,
            `• Mentored 5 junior structural engineers in design and analysis`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led structural engineering team of 20 engineers, delivering $300M in projects at ${company}`,
            `• Defined structural design standards adopted across the firm`,
            `• Drove innovation in seismic design achieving 9.0 magnitude resilience`,
            `• Built relationships with 15+ contractors and developers`,
            `• Published 10+ research papers in structural engineering journals`
        ];
    }
    return [
        `• Served as Director of Structural Engineering at ${company}, overseeing 50+ engineers and $150M budget`,
        `• Led structural transformation delivering 200+ landmark projects`,
        `• Built structural engineering organization from ground up, hiring 40+ engineers`,
        `• Presented structural strategy to board and secured $40M for technology investment`,
        `• Mentored 25 structural engineering leaders who now run their own firms`
    ];
};