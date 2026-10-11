// utils/pools/warehouseManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getWarehouseManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed warehouse operations of 50,000 sq ft at ${company}`,
            `• Supervised 20+ warehouse staff across shifts`,
            `• Processed 1,000+ shipments monthly with 99% accuracy`,
            `• Maintained 99.5% inventory accuracy across 5,000+ SKUs`,
            `• Documented 800+ warehouse transactions with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed 200,000 sq ft warehouse with $10M inventory at ${company}`,
            `• Led team of 80+ warehouse staff across 3 shifts`,
            `• Improved warehouse efficiency by 40% through layout optimization`,
            `• Implemented WMS reducing order processing time by 50%`,
            `• Mentored 5 junior warehouse supervisors`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led warehouse operations of 500,000 sq ft, managing $50M inventory at ${company}`,
            `• Defined warehouse standards adopted across 5 facilities`,
            `• Drove operational efficiency improvement by 60%`,
            `• Built relationships with 30+ suppliers and logistics partners`,
            `• Published 10+ articles on warehouse management`
        ];
    }
    return [
        `• Served as Director of Warehouse Operations at ${company}, overseeing 200+ staff and $20M budget`,
        `• Led warehouse transformation improving efficiency by 70%`,
        `• Built warehouse operations from ground up, hiring 150+ staff across 5 facilities`,
        `• Presented warehouse strategy to board and secured $15M for automation`,
        `• Mentored 25 warehouse leaders who now run their own facilities`
    ];
};