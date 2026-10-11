// utils/pools/physicistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhysicistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 100+ physics experiments in optics, mechanics, and thermodynamics at ${company}`,
            `• Analyzed 200+ datasets using Python and MATLAB`,
            `• Prepared 50+ research reports and technical papers`,
            `• Assisted in 20+ advanced physics research projects`,
            `• Documented 150+ experimental results with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 15+ physics research projects in quantum and applied physics at ${company}`,
            `• Developed experimental techniques improving accuracy by 40%`,
            `• Published 5+ research papers in peer-reviewed physics journals`,
            `• Managed 5+ junior physicists on complex research projects`,
            `• Presented research at 10+ national and international conferences`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led physics research team of 12 researchers, managing 30+ projects at ${company}`,
            `• Defined research strategy adopted across the organization`,
            `• Drove innovation in applied physics and materials science`,
            `• Built relationships with 25+ academic and industrial research institutions`,
            `• Published 15+ research papers in leading physics journals`
        ];
    }
    return [
        `• Served as Director of Physics Research at ${company}, overseeing 30+ researchers and $10M budget`,
        `• Led physics research transformation achieving 5+ breakthrough discoveries`,
        `• Built physics research organization from ground up, hiring 25+ researchers`,
        `• Presented research strategy to board and secured $15M for advanced research`,
        `• Mentored 15 physics research leaders who now run their own departments`
    ];
};