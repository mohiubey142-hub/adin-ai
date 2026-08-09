// utils/pools/masonPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMasonBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Laid 5,000+ bricks and blocks for 10+ residential and commercial construction projects at ${company}`,
            `• Performed 50+ concrete works including foundations, slabs, and columns`,
            `• Applied 100+ plastering and finishing works with 98% quality acceptance rate`,
            `• Read and interpreted 50+ construction drawings and specifications`,
            `• Maintained 100% compliance with site safety procedures and quality standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led masonry team of 15 workers across 5+ construction projects worth $3M at ${company}`,
            `• Developed and implemented quality control procedures reducing rework by 60%`,
            `• Managed material estimation and ordering, reducing waste by 25%`,
            `• Trained 20 junior masons in brickwork, plastering, and concrete techniques`,
            `• Achieved 100% project completion within budget and schedule`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed masonry operations across 8 construction projects, managing 50+ masons at ${company}`,
            `• Established masonry standards and best practices adopted across all projects`,
            `• Implemented quality assurance program improving work quality by 45%`,
            `• Led coordination with engineers, architects, and contractors for 10+ major projects`,
            `• Built high-performing team of 40+ masons with 90% retention rate`
        ];
    }
    return [
        `• Served as Director of Construction Operations, overseeing 100+ masons and $20M project portfolio`,
        `• Led construction transformation improving quality by 40% and productivity by 35%`,
        `• Built masonry organization from ground up, hiring 80+ professionals across 5 locations`,
        `• Presented construction strategy to board and secured $10M for equipment and training`,
        `• Mentored 30 construction leads who now manage their own project teams`
    ];
};