// utils/pools/emergencyMedicalTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEmergencyMedicalTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Responded to 500+ emergency calls providing life-saving care at ${company}`,
            `• Stabilized 300+ patients during transport to hospitals`,
            `• Performed 200+ CPR and advanced life support procedures`,
            `• Managed 100+ trauma cases with 95% survival rate`,
            `• Documented 400+ patient care reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led emergency response team of 6 EMTs at ${company}`,
            `• Responded to 1,000+ emergency calls with 98% success rate`,
            `• Trained 10 junior EMTs in advanced life support and trauma care`,
            `• Implemented response protocols reducing response time by 30%`,
            `• Managed 200+ critical care transports with zero incidents`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led emergency medical services of 25 EMTs, responding to 5,000+ calls annually at ${company}`,
            `• Defined emergency response protocols adopted across 5 stations`,
            `• Drove patient survival improvement by 40%`,
            `• Built relationships with 25+ hospitals and emergency services`,
            `• Published 10+ articles on emergency medical care`
        ];
    }
    return [
        `• Served as Director of Emergency Medical Services at ${company}, overseeing 50+ EMTs and $5M budget`,
        `• Led EMS transformation improving response times by 50%`,
        `• Built EMS organization from ground up, hiring 40+ EMTs`,
        `• Presented EMS strategy to board and secured $3M for equipment and training`,
        `• Mentored 20 EMS leaders who now run their own stations`
    ];
};