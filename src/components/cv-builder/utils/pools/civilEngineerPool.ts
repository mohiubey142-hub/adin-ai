// utils/pools/civilEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCivilEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 50+ structural drawings and quantity estimates using AutoCAD at ${company}`,
            `• Supervised site execution for 5+ construction projects, ensuring compliance with approved drawings`,
            `• Conducted 100+ quality control inspections and material testing`,
            `• Assisted in preparing BOQ and cost estimates for 10+ projects worth $2M`,
            `• Coordinated with contractors and vendors for 20+ material deliveries and site activities`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led civil engineering for 8+ projects valued at $10M, completing 100% within budget at ${company}`,
            `• Designed and reviewed structural systems for 5+ commercial buildings using STAAD Pro and AutoCAD`,
            `• Managed site teams of 30+ workers, ensuring safety compliance and quality standards`,
            `• Reduced project costs by 15% through value engineering and optimized material usage`,
            `• Mentored 6 junior civil engineers in site supervision, quality control, and documentation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed civil engineering division of 25+ engineers, managing 15+ projects worth $50M at ${company}`,
            `• Defined structural engineering standards adopted across 20+ projects`,
            `• Led design and construction of 3 major infrastructure projects (bridges, highways, buildings)`,
            `• Implemented BIM processes reducing rework by 40% and improving project delivery by 25%`,
            `• Partnered with government authorities and stakeholders to secure project approvals and permits`
        ];
    }
    return [
        `• Served as Director of Civil Engineering, overseeing 60+ engineers and $100M project portfolio`,
        `• Led civil engineering transformation improving project delivery time by 30% and cost by 20%`,
        `• Built civil engineering organization from ground up, hiring 50+ professionals across 5 locations`,
        `• Presented civil strategy to board and secured $20M for technology and innovation`,
        `• Mentored 25 engineering leads who now manage their own project teams`
    ];
};