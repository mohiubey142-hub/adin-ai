// utils/pools/welderPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getWelderBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed MIG, TIG, and arc welding on 200+ structural and mechanical components at ${company}`,
            `• Fabricated 150+ metal structures and assemblies according to engineering drawings`,
            `• Conducted 100+ weld inspections ensuring 98% quality acceptance rate`,
            `• Prepared 200+ metal surfaces through cleaning, grinding, and preheating`,
            `• Maintained welding equipment and ensured 100% compliance with safety procedures`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led welding team of 8 welders, achieving 100% project delivery on time at ${company}`,
            `• Certified in 5+ welding processes including TIG, MIG, Stick, and Flux-Cored`,
            `• Developed welding procedures for 20+ materials and thickness combinations`,
            `• Implemented quality control program reducing rework by 70%`,
            `• Trained 12 junior welders in advanced techniques, safety, and quality standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed welding operations across 3 facilities, managing 35+ welders at ${company}`,
            `• Established welding standards and procedures adopted as company policy`,
            `• Led welding automation initiative improving productivity by 60% and quality by 40%`,
            `• Designed training program producing 25+ certified welders in 2 years`,
            `• Partnered with engineering team to develop welding solutions for 50+ complex projects`
        ];
    }
    return [
        `• Served as Director of Fabrication Operations, overseeing 80+ welders and $20M production budget`,
        `• Led welding transformation improving productivity by 55% and reducing defects by 70%`,
        `• Built welding organization from ground up, hiring 70+ professionals across 5 locations`,
        `• Presented fabrication strategy to board and secured $15M for modernization`,
        `• Mentored 35 welding leads who now manage their own fabrication teams`
    ];
};