// utils/pools/dietitianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDietitianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided nutritional counseling to 300+ clients at ${company}`,
            `• Developed 200+ personalized meal plans for various health conditions`,
            `• Conducted 100+ nutritional assessments and body composition analyses`,
            `• Educated 500+ patients on healthy eating and lifestyle changes`,
            `• Documented 300+ patient records with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed caseload of 150+ clients with complex dietary needs at ${company}`,
            `• Developed nutrition programs reducing obesity by 40%`,
            `• Led 5+ community nutrition education programs reaching 1,000+ people`,
            `• Supervised 5+ junior dietitians in clinical nutrition`,
            `• Improved patient health outcomes by 35% through personalized plans`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led nutrition department of 12 dietitians, serving 2,000+ clients annually at ${company}`,
            `• Defined clinical nutrition protocols adopted across 3 hospitals`,
            `• Drove community health improvement reducing diabetes by 30%`,
            `• Built relationships with 25+ healthcare organizations and schools`,
            `• Published 10+ research papers in nutrition journals`
        ];
    }
    return [
        `• Served as Director of Nutrition at ${company}, overseeing 30+ dietitians and $2M budget`,
        `• Led nutrition transformation improving population health by 45%`,
        `• Built nutrition department from ground up, hiring 25+ dietitians`,
        `• Presented nutrition strategy to board and secured $1.5M for community programs`,
        `• Mentored 15 nutrition leaders who now run their own departments`
    ];
};