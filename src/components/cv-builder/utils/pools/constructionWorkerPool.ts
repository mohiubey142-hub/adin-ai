// utils/pools/constructionWorkerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getConstructionWorkerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Worked on 20+ construction projects including residential and commercial buildings at ${company}`,
            `• Operated construction equipment and tools with 100% safety`,
            `• Assisted in 50+ concrete pours, framing, and finishing tasks`,
            `• Maintained 98% attendance and punctuality on all projects`,
            `• Completed OSHA safety training with 100% compliance`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led construction crew of 8 workers on 15+ projects at ${company}`,
            `• Managed materials and equipment for projects worth $5M`,
            `• Trained 10 junior workers in construction techniques and safety`,
            `• Improved project efficiency by 25% through better coordination`,
            `• Maintained 100% safety record across all projects`
        ];
    }
    if (level === 'senior') {
        return [
            `• Supervised construction sites with 50+ workers on projects worth $50M at ${company}`,
            `• Ensured project completion within budget and schedule`,
            `• Implemented safety programs reducing accidents by 60%`,
            `• Coordinated with contractors, engineers, and architects`,
            `• Managed equipment worth $10M ensuring optimal utilization`
        ];
    }
    return [
        `• Served as Construction Director at ${company}, overseeing 200+ workers and $100M projects`,
        `• Led construction transformation delivering 50+ major projects on time`,
        `• Built construction organization from ground up, hiring 150+ workers`,
        `• Presented construction strategy to board and secured $50M for new projects`,
        `• Mentored 30 construction leaders who now run their own sites`
    ];
};