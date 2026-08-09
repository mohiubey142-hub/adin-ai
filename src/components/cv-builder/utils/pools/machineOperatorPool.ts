// utils/pools/machineOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMachineOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Operated 5+ production machines (milling, grinding, pressing, and packaging) producing 1,000+ units daily at ${company}`,
            `• Set up and calibrated machines for 50+ different production runs and product specifications`,
            `• Performed 100+ quality checks ensuring 98% product quality and dimensional accuracy`,
            `• Conducted daily machine maintenance and cleaning, maintaining 95% uptime`,
            `• Achieved 100% production targets for 12+ consecutive weeks`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led machine operations team of 8 operators across 3 production lines at ${company}`,
            `• Optimized machine settings reducing cycle time by 25% and increasing output by 30%`,
            `• Implemented preventive maintenance program reducing machine breakdowns by 55%`,
            `• Reduced material waste by 20% through process optimization and quality monitoring`,
            `• Trained 10 junior operators in machine operation, safety, and quality standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed machine operations across 5 production lines, managing 30+ machines and 25+ operators at ${company}`,
            `• Established operational standards and SOPs adopted across all manufacturing units`,
            `• Led automation initiative integrating 10+ new machines, increasing production capacity by 50%`,
            `• Implemented real-time monitoring system improving OEE from 65% to 85%`,
            `• Partnered with maintenance and engineering teams to optimize equipment performance`
        ];
    }
    return [
        `• Served as Director of Manufacturing Operations, overseeing 100+ machines and $25M production budget`,
        `• Led manufacturing transformation improving productivity by 55% and quality by 40%`,
        `• Built machine operations from ground up, hiring 80+ operators across 6 production lines`,
        `• Presented manufacturing strategy to board and secured $20M for plant modernization`,
        `• Mentored 35 production leads who now manage their own manufacturing teams`
    ];
};