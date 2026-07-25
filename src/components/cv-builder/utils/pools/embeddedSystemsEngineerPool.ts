// utils/pools/embeddedSystemsEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEmbeddedSystemsEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed and developed firmware for 10+ embedded systems using C and C++ at ${company}`,
            `• Integrated 20+ sensors and actuators for IoT devices, ensuring accurate data collection`,
            `• Debugged 50+ hardware-software issues using oscilloscopes and logic analyzers`,
            `• Optimized code for memory-constrained devices, reducing RAM usage by 30%`,
            `• Created technical documentation for 15+ embedded systems and user guides`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 5+ embedded system products, managing a team of 4 engineers at ${company}`,
            `• Designed real-time embedded software using RTOS, achieving 99.9% reliability in critical applications`,
            `• Implemented security features for 10+ IoT devices, ensuring data protection and compliance`,
            `• Optimized power consumption, achieving 40% longer battery life for 3+ products`,
            `• Mentored 5 junior engineers in embedded programming and hardware integration`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led embedded systems engineering division of 25+ engineers at ${company}, managing $15M in product development`,
            `• Architected embedded platform used across 10+ product lines, generating $50M in revenue`,
            `• Defined development processes and quality standards adopted by 5+ engineering teams`,
            `• Implemented CI/CD for embedded firmware, reducing release cycles from 4 weeks to 3 days`,
            `• Partnered with hardware teams to design 5+ custom SoCs for specialized applications`
        ];
    }
    return [
        `• Served as Director of Embedded Systems Engineering, overseeing $40M product portfolio and 60+ engineers`,
        `• Led embedded transformation, launching 15+ products across 8 industries`,
        `• Built embedded organization from ground up, hiring 55+ specialists across 4 countries`,
        `• Presented embedded strategy to board and secured $25M for next-gen IoT platform`,
        `• Mentored 18 engineering leaders who now manage their own embedded teams`
    ];
};