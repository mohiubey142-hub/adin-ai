// utils/pools/mechanicalEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMechanicalEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed 20+ mechanical components using SolidWorks and AutoCAD at ${company}`,
            `• Conducted 50+ performance tests on mechanical systems and equipment`,
            `• Performed root cause analysis on 30+ equipment failures, implementing 20+ corrective actions`,
            `• Assisted in preventive maintenance scheduling for 100+ mechanical assets`,
            `• Created engineering documentation and drawings for 15+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led mechanical design and development for 5+ product lines, improving efficiency by 25% at ${company}`,
            `• Managed installation and commissioning of 10+ mechanical systems worth $5M`,
            `• Developed preventive maintenance programs reducing downtime by 40%`,
            `• Optimized manufacturing processes improving production efficiency by 20%`,
            `• Mentored 5 junior mechanical engineers in design, testing, and troubleshooting`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed mechanical engineering team of 20+ engineers, managing $20M equipment portfolio at ${company}`,
            `• Defined mechanical engineering standards adopted across 10+ manufacturing facilities`,
            `• Led equipment modernization program increasing reliability from 92% to 98%`,
            `• Implemented predictive maintenance using IoT, reducing breakdowns by 60%`,
            `• Partnered with suppliers to develop 15+ custom mechanical solutions`
        ];
    }
    return [
        `• Served as Director of Mechanical Engineering, overseeing 50+ engineers and $50M equipment budget`,
        `• Led mechanical engineering transformation improving asset utilization by 35%`,
        `• Built mechanical engineering organization from ground up, hiring 40+ professionals across 4 countries`,
        `• Presented mechanical strategy to board and secured $15M for modernization`,
        `• Mentored 20 engineering leads who now manage their own mechanical teams`
    ];
};