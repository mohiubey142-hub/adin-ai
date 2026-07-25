// utils/pools/healthcareAdministratorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHealthcareAdministratorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in daily healthcare facility operations, managing schedules for 50+ staff members at ${company}`,
            `• Processed 200+ patient admissions and maintained accurate medical records`,
            `• Coordinated communication between 5+ departments for efficient patient flow`,
            `• Monitored compliance with healthcare regulations for 3+ departments`,
            `• Supported quality improvement initiatives, tracking 20+ performance metrics`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed healthcare facility operations of 50+ beds, optimizing patient flow and resource utilization at ${company}`,
            `• Led team of 20+ administrative staff, improving operational efficiency by 30%`,
            `• Implemented electronic health record system reducing documentation time by 40%`,
            `• Ensured 100% compliance with JCIA and ISO healthcare standards`,
            `• Developed budget and financial reports, achieving 15% cost savings through process improvements`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed healthcare administration for 3 facilities with 200+ beds, managing $15M budget at ${company}`,
            `• Led strategic planning and business development, increasing patient volume by 35%`,
            `• Implemented quality management system improving patient satisfaction scores from 78% to 92%`,
            `• Developed and executed $5M facility expansion project, adding 50+ beds and 3 operating rooms`,
            `• Mentored 15+ administrative leaders who now manage their own facility departments`
        ];
    }
    return [
        `• Served as Chief Administrative Officer, overseeing 6 facilities, 500+ employees, and $50M annual budget`,
        `• Led healthcare transformation improving operational efficiency by 40% across 8 facilities`,
        `• Built administrative organization from ground up, hiring 100+ professionals`,
        `• Presented strategic vision to board and secured $25M for healthcare expansion`,
        `• Mentored 25 administrative leaders who now run their own healthcare facilities`
    ];
};