// utils/pools/driverPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDriverBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Completed 1,000+ safe deliveries with 100% on-time performance at ${company}`,
            `• Drove 50,000+ miles annually with zero accidents`,
            `• Maintained vehicle logs and documentation with 100% accuracy`,
            `• Performed 200+ vehicle inspections ensuring safety`,
            `• Provided excellent customer service achieving 95% satisfaction`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led driver team of 8 drivers at ${company}`,
            `• Completed 5,000+ deliveries with 99% on-time performance`,
            `• Trained 10 junior drivers in safe driving and delivery procedures`,
            `• Maintained 100% safety record across all routes`,
            `• Improved delivery efficiency by 30% through route optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led fleet operations of 25 drivers, completing 20,000+ deliveries annually at ${company}`,
            `• Defined driving standards adopted across 5 regions`,
            `• Drove safety improvement reducing accidents by 60%`,
            `• Built relationships with 25+ clients and logistics partners`,
            `• Published 5+ articles on fleet management`
        ];
    }
    return [
        `• Served as Director of Fleet Operations at ${company}, overseeing 50+ drivers and $10M budget`,
        `• Led fleet transformation improving efficiency by 50%`,
        `• Built fleet organization from ground up, hiring 40+ drivers`,
        `• Presented fleet strategy to board and secured $8M for vehicle modernization`,
        `• Mentored 20 fleet leaders who now run their own operations`
    ];
};