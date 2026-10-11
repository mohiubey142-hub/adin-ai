// utils/pools/chefPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getChefBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 500+ dishes daily maintaining 98% quality and presentation standards at ${company}`,
            `• Assisted in menu planning and recipe development for 20+ dishes`,
            `• Ensured 100% compliance with food safety and hygiene regulations`,
            `• Maintained 15+ kitchen stations including preparation, cooking, and plating areas`,
            `• Managed kitchen inventory and reduced waste by 15% through proper storage and portion control`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led kitchen team of 12 chefs, managing daily operations for 300+ covers at ${company}`,
            `• Developed and launched 30+ new menu items increasing customer satisfaction by 35%`,
            `• Implemented kitchen processes reducing food preparation time by 25%`,
            `• Managed food costing and budget, achieving 20% cost reduction while maintaining quality`,
            `• Trained 15 junior chefs in culinary techniques, food safety, and kitchen management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed culinary operations across 3 restaurants, managing 35+ chefs at ${company}`,
            `• Established culinary standards and recipes adopted across all restaurant locations`,
            `• Led menu innovation and seasonal refresh programs, increasing revenue by 30%`,
            `• Implemented kitchen management systems improving efficiency by 40%`,
            `• Partnered with suppliers to source premium ingredients while reducing costs by 15%`
        ];
    }
    return [
        `• Served as Executive Chef/Director of Culinary Operations, overseeing 80+ chefs and $10M annual food budget`,
        `• Led culinary transformation improving food quality by 40% and kitchen efficiency by 50%`,
        `• Built culinary team from ground up, hiring 70+ chefs across 6 restaurant locations`,
        `• Presented culinary strategy to board and secured $5M for kitchen modernization`,
        `• Mentored 35 culinary leads who now manage their own kitchen teams`
    ];
};