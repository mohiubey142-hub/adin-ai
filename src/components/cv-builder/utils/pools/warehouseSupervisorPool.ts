// utils/pools/warehouseSupervisorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getWarehouseSupervisorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Supervised 15+ warehouse workers across daily operations at ${company}`,
            `• Managed 500+ shipments weekly with 98% on-time delivery`,
            `• Maintained 99% inventory accuracy across 3,000+ SKUs`,
            `• Coordinated with 10+ departments for efficient workflow`,
            `• Documented 600+ warehouse activities with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised warehouse team of 40+ workers across 2 shifts at ${company}`,
            `• Managed 2,000+ shipments weekly with 99% accuracy`,
            `• Improved team productivity by 35% through training and motivation`,
            `• Implemented safety programs reducing accidents by 60%`,
            `• Mentored 8 junior warehouse staff in operational procedures`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led warehouse supervision of 100+ workers, managing 10,000+ shipments weekly at ${company}`,
            `• Defined supervision standards adopted across 3 facilities`,
            `• Drove operational efficiency improvement by 50%`,
            `• Built relationships with 25+ logistics partners and carriers`,
            `• Published 5+ articles on warehouse supervision`
        ];
    }
    return [
        `• Served as Director of Warehouse Supervision at ${company}, overseeing 200+ supervisors and $10M budget`,
        `• Led warehouse supervision transformation improving efficiency by 60%`,
        `• Built supervision organization from ground up, hiring 150+ supervisors`,
        `• Presented supervision strategy to board and secured $8M for training`,
        `• Mentored 20 supervision leaders who now run their own facilities`
    ];
};