// utils/pools/foodSafetyOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFoodSafetyOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 300+ food safety inspections at restaurants and food facilities at ${company}`,
            `• Implemented 60+ food safety protocols reducing violations by 50%`,
            `• Delivered 100+ food safety training sessions to 500+ food handlers`,
            `• Investigated 30+ food safety incidents and recommended corrective actions`,
            `• Documented 250+ food safety reports with 100% compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led food safety team of 5 officers at ${company}`,
            `• Developed food safety programs reducing violations by 70%`,
            `• Managed 600+ food safety inspections with 99% compliance`,
            `• Trained 300+ food handlers in food safety procedures`,
            `• Achieved HACCP certification for 10+ food facilities`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led food safety department of 15 officers, ensuring 1,000+ food facilities' compliance at ${company}`,
            `• Defined food safety standards adopted across 5 regions`,
            `• Drove food safety improvement reducing violations by 85%`,
            `• Built relationships with 25+ regulatory bodies and food organizations`,
            `• Published 10+ articles on food safety management`
        ];
    }
    return [
        `• Served as Director of Food Safety at ${company}, overseeing 40+ officers and $4M budget`,
        `• Led food safety transformation achieving 95% compliance`,
        `• Built food safety organization from ground up, hiring 35+ officers`,
        `• Presented food safety strategy to board and secured $2.5M for programs`,
        `• Mentored 20 food safety leaders who now run their own departments`
    ];
};