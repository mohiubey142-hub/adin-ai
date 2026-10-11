// utils/pools/biomedicalEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getBiomedicalEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed 5+ medical devices and components using CAD software at ${company}`,
            `• Conducted 100+ tests on medical equipment ensuring safety and efficacy`,
            `• Maintained 200+ medical devices with 99% uptime`,
            `• Collaborated with clinicians on 10+ device improvement projects`,
            `• Documented 150+ technical specifications and test reports`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 5+ medical devices from concept to FDA approval at ${company}`,
            `• Improved medical device performance by 40% through design optimization`,
            `• Managed 3+ biomedical engineering projects worth $5M`,
            `• Implemented quality management system achieving ISO 13485 certification`,
            `• Mentored 5 junior biomedical engineers in device development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led biomedical engineering team of 15 engineers, managing $30M in projects at ${company}`,
            `• Defined medical device strategy adopted across 3 product lines`,
            `• Drove innovation in wearable medical technology`,
            `• Achieved FDA approval for 5+ Class II medical devices`,
            `• Partnered with hospitals to improve patient outcomes through technology`
        ];
    }
    return [
        `• Served as Director of Biomedical Engineering at ${company}, overseeing 40+ engineers and $50M budget`,
        `• Led biomedical transformation improving patient care by 50%`,
        `• Built biomedical engineering organization from ground up, hiring 30+ engineers`,
        `• Presented biomedical strategy to board and secured $25M for R&D`,
        `• Mentored 20 biomedical engineering leaders who now run their own departments`
    ];
};