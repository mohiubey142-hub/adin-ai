// utils/pools/logisticsCoordinatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getLogisticsCoordinatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Coordinated 500+ shipments monthly ensuring 95% on-time delivery at ${company}`,
            `• Managed relationships with 50+ carriers and freight forwarders`,
            `• Tracked 1,000+ shipments and resolved 100+ delivery issues`,
            `• Processed 800+ shipping documents with 100% accuracy`,
            `• Documented 300+ logistics reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led logistics coordination team of 5 coordinators at ${company}`,
            `• Managed 2,000+ shipments monthly with 98% on-time delivery`,
            `• Implemented logistics systems reducing costs by 30%`,
            `• Trained 8 junior coordinators in logistics management`,
            `• Improved delivery efficiency by 40% through route optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led logistics department of 15 coordinators, managing 10,000+ shipments monthly at ${company}`,
            `• Defined logistics standards adopted across 5 regions`,
            `• Drove delivery efficiency improvement by 50%`,
            `• Built relationships with 30+ carriers and logistics partners`,
            `• Published 10+ articles on logistics coordination`
        ];
    }
    return [
        `• Served as Director of Logistics at ${company}, overseeing 40+ coordinators and $10M budget`,
        `• Led logistics transformation improving efficiency by 60%`,
        `• Built logistics organization from ground up, hiring 35+ coordinators`,
        `• Presented logistics strategy to board and secured $8M for technology`,
        `• Mentored 20 logistics leaders who now run their own departments`
    ];
};