// utils/pools/nutritionistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getNutritionistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided nutritional counseling to 200+ clients, focusing on weight management and healthy eating at ${company}`,
            `• Created 150+ personalized meal plans based on individual health needs and preferences`,
            `• Conducted 100+ nutritional assessments and body composition analyses`,
            `• Facilitated 50+ group nutrition education sessions and workshops`,
            `• Collaborated with healthcare team to integrate nutrition into patient care plans`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led nutrition services department of 5 dietitians, managing 300+ patient cases at ${company}`,
            `• Developed specialized nutrition programs for 5+ health conditions (diabetes, cardiac, oncology)`,
            `• Implemented food service guidelines reducing hospital-acquired malnutrition by 35%`,
            `• Mentored 8 junior dietitians in clinical nutrition and patient counseling`,
            `• Created nutrition education materials used across 10+ facilities`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed nutrition services across 5 facilities at ${company}, managing 20+ dietitians`,
            `• Established evidence-based nutrition protocols adopted across 15+ healthcare settings`,
            `• Launched public health nutrition programs reaching 5,000+ community members annually`,
            `• Developed clinical rotation programs for 12+ nutrition interns and residents`,
            `• Led research projects published in 3+ nutrition and dietetics journals`
        ];
    }
    return [
        `• Served as Director of Nutrition Services, overseeing 45+ dietitians and $3M annual budget`,
        `• Led nutrition transformation improving patient outcomes by 30% across 8 facilities`,
        `• Built nutrition department from ground up, hiring 40+ specialists across 6 locations`,
        `• Presented nutrition strategy to board and secured $5M for dietary modernization`,
        `• Mentored 15 nutrition leads who now manage their own departments`
    ];
};