// utils/pools/logisticsManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLogisticsManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Coordinated logistics operations for 200+ shipments monthly, ensuring timely delivery at ${company}`,
            `• Maintained transportation records and monitored carrier performance for 15+ partners`,
            `• Processed shipping documentation for 500+ international and domestic shipments`,
            `• Resolved 40+ logistics issues, minimizing delays and customer impact`,
            `• Assisted in route optimization achieving 10% reduction in transportation costs`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led logistics team of 8 professionals, managing 1,000+ shipments monthly at ${company}`,
            `• Implemented warehouse management system improving inventory accuracy from 92% to 99.5%`,
            `• Optimized distribution network reducing delivery times by 30% and costs by 18%`,
            `• Negotiated with 10+ logistics partners securing better rates and service levels`,
            `• Mentored 5 junior logistics coordinators in operations and customer service`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed logistics operations across 5 warehouses and 10+ distribution centers at ${company}`,
            `• Led logistics transformation with AI-powered route optimization saving $5M annually`,
            `• Established 3PL partnerships reducing logistics costs by 25% while improving service levels`,
            `• Implemented real-time tracking system improving customer satisfaction by 35%`,
            `• Developed logistics talent program producing 15+ logistics managers`
        ];
    }
    return [
        `• Served as VP of Logistics, overseeing global operations across 15 countries and 200+ employees`,
        `• Led logistics transformation improving efficiency by 40% and reducing costs by 30%`,
        `• Built logistics organization from ground up, hiring 150+ professionals across 8 countries`,
        `• Presented logistics strategy to board and secured $50M for automation and expansion`,
        `• Mentored 25 logistics leaders who now manage their own global operations`
    ];
};