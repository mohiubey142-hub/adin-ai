// utils/pools/telecommunicationsEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getTelecommunicationsEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in design and implementation of 20+ telecom networks including fiber optic and wireless systems at ${company}`,
            `• Performed 100+ site surveys and signal strength measurements for network optimization`,
            `• Configured and maintained 50+ network devices including routers, switches, and base stations`,
            `• Documented network configurations and created 30+ technical reports`,
            `• Collaborated with senior engineers on 5+ major telecom infrastructure projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led telecommunications design and implementation for 8+ projects worth $10M at ${company}`,
            `• Designed and optimized 4G/5G network coverage for 5+ urban and rural areas`,
            `• Managed vendor relationships and equipment procurement for 10+ telecom projects`,
            `• Reduced network downtime by 60% through proactive maintenance and monitoring`,
            `• Mentored 5 junior engineers in telecom design, testing, and optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed telecommunications engineering team of 15+ engineers, managing $25M network infrastructure at ${company}`,
            `• Defined telecom architecture strategy adopted across 10+ regional networks`,
            `• Led network modernization program increasing capacity by 70% and reducing latency by 50%`,
            `• Implemented network automation and monitoring systems improving efficiency by 45%`,
            `• Partnered with regulatory authorities to ensure compliance and spectrum optimization`
        ];
    }
    return [
        `• Served as Director of Telecommunications Engineering, overseeing 40+ engineers and $50M annual budget`,
        `• Led telecom transformation improving network reliability from 99% to 99.99%`,
        `• Built telecom engineering organization from ground up, hiring 35+ professionals across 4 countries`,
        `• Presented telecom strategy to board and secured $20M for 5G and fiber deployment`,
        `• Mentored 18 telecom leads who now manage their own network engineering teams`
    ];
};