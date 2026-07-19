// utils/pools/pilotPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPilotBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Logged 500+ flight hours with zero incidents at ${company}`,
            `• Operated flights in various weather conditions with 100% safety record`,
            `• Maintained accurate flight logs and documentation for 200+ flights`,
            `• Collaborated with crew to ensure smooth operations for 150+ flights`,
            `• Passed rigorous training and certification with top 10% ranking`
        ];
    }
    if (level === 'mid') {
        return [
            `• Logged 3000+ flight hours across 50+ destinations at ${company}`,
            `• Led flight crew of 5, ensuring safety and efficiency for 300+ flights`,
            `• Developed training programs for junior pilots, training 20+ pilots`,
            `• Managed relationships with 100+ passengers daily with 98% satisfaction`,
            `• Mentored 10 junior pilots through flight training programs`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led flight operations team of 50, ensuring safety across 100+ daily flights at ${company}`,
            `• Defined safety protocols that became airline standard`,
            `• Drove operational efficiency improving on-time performance by 20%`,
            `• Created training academy that trained 200+ pilots`,
            `• Partnered with aviation authorities to improve safety standards`
        ];
    }
    return [
        `• Served as Chief Pilot, overseeing 200+ pilots and $50M aviation operations`,
        `• Led aviation transformation that improved safety by 50%`,
        `• Built pilot organization from ground up, hiring 150+ pilots across 5 bases`,
        `• Presented aviation strategy to board and secured $20M for fleet expansion`,
        `• Mentored 20 pilot leaders who now command their own fleets`
    ];
};