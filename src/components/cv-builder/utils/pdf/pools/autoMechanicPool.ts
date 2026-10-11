// utils/pools/autoMechanicPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAutoMechanicBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Diagnosed and repaired 200+ vehicles including engine, transmission, brake, and suspension systems at ${company}`,
            `• Performed 150+ preventive maintenance services including oil changes, tire rotations, and fluid checks`,
            `• Used diagnostic equipment to identify 100+ mechanical and electrical faults`,
            `• Replaced 200+ vehicle components including belts, hoses, filters, and brake pads`,
            `• Maintained 98% customer satisfaction through quality workmanship and clear communication`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led auto repair team of 6 mechanics, achieving 40% increase in service capacity at ${company}`,
            `• Specialized in engine rebuilding and transmission repairs for 50+ vehicles`,
            `• Implemented diagnostic procedures reducing repair time by 35%`,
            `• Trained 8 junior mechanics in diagnostic techniques and repair procedures`,
            `• Achieved 95% first-time fix rate and reduced customer complaints by 60%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed auto service operations across 3 locations, managing 25+ mechanics at ${company}`,
            `• Established service standards and quality procedures adopted across all workshops`,
            `• Led technical training program producing 15+ certified master mechanics`,
            `• Implemented workshop management system improving efficiency by 45%`,
            `• Partnered with dealerships and parts suppliers to optimize inventory and service delivery`
        ];
    }
    return [
        `• Served as Director of Automotive Services, overseeing 60+ mechanics and $10M annual revenue`,
        `• Led service transformation improving efficiency by 50% and customer satisfaction to 98%`,
        `• Built automotive service organization from ground up, hiring 50+ professionals across 5 locations`,
        `• Presented service strategy to board and secured $5M for workshop modernization`,
        `• Mentored 30 service leads who now manage their own workshops`
    ];
};