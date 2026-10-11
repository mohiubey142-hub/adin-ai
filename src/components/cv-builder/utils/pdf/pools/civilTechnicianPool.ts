// utils/pools/civilTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCivilTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in site supervision for 10+ construction projects, ensuring compliance with approved drawings at ${company}`,
            `• Conducted 150+ quality inspections including concrete slump tests, reinforcement checks, and material verification`,
            `• Prepared 50+ site documentation including daily reports, material logs, and progress photos`,
            `• Performed 100+ measurements and leveling using total station and auto level instruments`,
            `• Collaborated with engineers and contractors to resolve 30+ site issues`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led site technical team of 8 technicians across 5+ construction projects worth $5M at ${company}`,
            `• Managed quality control and assurance activities, maintaining 98% compliance with specifications`,
            `• Developed inspection and test plans for 20+ construction activities`,
            `• Reduced rework by 45% through proactive quality monitoring and issue resolution`,
            `• Trained 6 junior technicians in quality control, surveying, and documentation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed civil technical operations across 8 projects, managing 25+ technicians at ${company}`,
            `• Established quality standards and inspection procedures adopted organization-wide`,
            `• Implemented digital quality management system reducing documentation time by 60%`,
            `• Led technical coordination with consultants, contractors, and regulatory authorities for 10+ projects`,
            `• Built high-performing team of 20+ technicians with 90% retention rate`
        ];
    }
    return [
        `• Served as Director of Technical Services, overseeing 50+ technicians and $15M project portfolio`,
        `• Led technical transformation improving quality compliance from 85% to 98%`,
        `• Built technical services organization from ground up, hiring 40+ professionals across 5 locations`,
        `• Presented technical strategy to board and secured $8M for equipment and training`,
        `• Mentored 25 technical leads who now manage their own site teams`
    ];
};