// utils/pools/itTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getItTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Resolved 500+ IT support tickets with 95% first-call resolution at ${company}`,
            `• Maintained 200+ computers and peripherals with 99% uptime`,
            `• Installed and configured 100+ software applications`,
            `• Managed 50+ user accounts and permissions`,
            `• Documented 400+ support tickets with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led IT support team of 5 technicians at ${company}`,
            `• Resolved 1,000+ IT issues with 98% satisfaction rate`,
            `• Implemented IT support procedures reducing resolution time by 40%`,
            `• Trained 8 junior technicians in IT support best practices`,
            `• Improved system uptime by 50% through proactive maintenance`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led IT support department of 15 technicians, supporting 500+ users at ${company}`,
            `• Defined IT support standards adopted across 3 locations`,
            `• Drove user satisfaction improvement to 98%`,
            `• Built relationships with 25+ vendors and service providers`,
            `• Published 10+ articles on IT support management`
        ];
    }
    return [
        `• Served as Director of IT Support at ${company}, overseeing 40+ technicians and $5M budget`,
        `• Led IT support transformation improving efficiency by 60%`,
        `• Built IT support organization from ground up, hiring 35+ technicians`,
        `• Presented IT strategy to board and secured $3M for technology upgrades`,
        `• Mentored 20 IT support leaders who now run their own departments`
    ];
};