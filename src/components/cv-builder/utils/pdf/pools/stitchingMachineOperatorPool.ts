// utils/pools/stitchingMachineOperatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getStitchingMachineOperatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Operated 10+ industrial sewing machines (overlock, flatlock, and single needle) producing 500+ garments daily at ${company}`,
            `• Set up machines for 50+ different garment styles and fabric types`,
            `• Maintained 98% quality standard through regular stitching inspections and tension adjustments`,
            `• Performed daily machine cleaning and basic maintenance, ensuring 95% uptime`,
            `• Achieved 100% production targets for 6 consecutive months`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led stitching section with 15+ machines, achieving 30% productivity increase at ${company}`,
            `• Trained 10+ junior operators in machine setup, stitching techniques, and quality standards`,
            `• Implemented preventive maintenance schedule reducing machine breakdowns by 60%`,
            `• Reduced fabric waste by 25% through optimized cutting and stitching processes`,
            `• Coordinated with quality control team to maintain 99% first-pass quality rate`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed stitching operations across 3 production lines, managing 50+ machines and 40+ operators at ${company}`,
            `• Established stitching standards and SOPs adopted across all production units`,
            `• Led automation initiative introducing 10+ new machines, increasing output by 50%`,
            `• Implemented real-time production monitoring system improving OEE from 70% to 88%`,
            `• Partnered with merchandising team to optimize production planning for 100+ styles monthly`
        ];
    }
    return [
        `• Served as Director of Garment Production, overseeing 150+ stitching machines and $20M annual production`,
        `• Led manufacturing transformation improving productivity by 60% and quality by 40%`,
        `• Built stitching operations from ground up, hiring 120+ operators across 5 production lines`,
        `• Presented production strategy to board and secured $10M for factory modernization`,
        `• Mentored 35 production leads who now manage their own stitching teams`
    ];
};