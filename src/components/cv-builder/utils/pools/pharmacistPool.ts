// utils/pools/pharmacistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPharmacistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Dispensed 1000+ prescriptions with 100% accuracy at ${company}`,
            `• Counseled patients on medication usage and side effects for 500+ patients`,
            `• Maintained inventory and ensured proper storage of medications`,
            `• Learned about drug interactions and contraindications for 100+ medications`,
            `• Collaborated with physicians to optimize patient care for 200+ patients`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led pharmacy team of 10, serving 500+ patients daily at ${company}`,
            `• Developed protocols that reduced medication errors by 50%`,
            `• Managed $1M inventory with 99.9% accuracy`,
            `• Implemented system that improved patient counseling by 40%`,
            `• Mentored 8 junior pharmacists through clinical training`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led pharmacy operations across 20+ locations at ${company}`,
            `• Defined clinical pharmacy standards that became company-wide`,
            `• Drove quality improvement that reduced medication errors by 70%`,
            `• Implemented technology that improved efficiency by 35%`,
            `• Built partnerships with healthcare providers to improve patient outcomes`
        ];
    }
    return [
        `• Served as Director of Pharmacy, overseeing 200+ pharmacists and $100M operations`,
        `• Led pharmacy transformation that improved patient outcomes by 30%`,
        `• Built pharmacy organization from ground up, hiring 150+ professionals across 10 cities`,
        `• Presented pharmacy strategy to board and secured $20M for innovation`,
        `• Mentored 30 pharmacy leads who now run their own operations`
    ];
};