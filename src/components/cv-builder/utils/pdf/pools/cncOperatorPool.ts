// utils/pools/cncOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCncOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Operated 5+ CNC machines (milling, turning, grinding) producing 1,000+ precision components monthly at ${company}`,
            `• Set up and calibrated machines for 50+ different production runs`,
            `• Read and interpreted 100+ engineering drawings and G-code programs`,
            `• Performed quality inspections using precision instruments, maintaining 98% quality rate`,
            `• Conducted daily machine maintenance and cleaning, ensuring 95% uptime`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led CNC machine shop with 10+ machines, achieving 25% productivity increase at ${company}`,
            `• Developed and optimized G-code programs for 100+ complex parts, reducing cycle time by 30%`,
            `• Implemented preventive maintenance program reducing machine breakdowns by 60%`,
            `• Trained 8 junior operators in CNC programming, setup, and quality control`,
            `• Achieved 50% reduction in material waste through process optimization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed CNC operations across 3 manufacturing plants, managing 50+ machines and 40+ operators at ${company}`,
            `• Established CNC machining standards and best practices adopted across organization`,
            `• Led automation initiative integrating robotic loading, increasing output by 45%`,
            `• Implemented real-time monitoring system improving OEE from 65% to 85%`,
            `• Partnered with engineering team to design tooling solutions for 100+ complex components`
        ];
    }
    return [
        `• Served as Director of Manufacturing Operations, overseeing 100+ CNC machines and $50M production budget`,
        `• Led manufacturing transformation improving productivity by 50% and quality by 40%`,
        `• Built CNC operations from ground up, hiring 80+ operators and programmers across 6 plants`,
        `• Presented manufacturing strategy to board and secured $30M for plant modernization`,
        `• Mentored 30 production leads who now manage their own manufacturing teams`
    ];
};