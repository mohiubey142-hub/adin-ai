// utils/pools/mechatronicsEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMechatronicsEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Designed and tested 10+ mechatronic systems integrating mechanical, electrical, and software components at ${company}`,
            `• Programmed PLCs and microcontrollers for 5+ automation projects, improving efficiency by 25%`,
            `• Created 3D models and simulations using SolidWorks for 15+ mechanical assemblies`,
            `• Troubleshot 50+ electromechanical issues, reducing downtime by 30%`,
            `• Collaborated with cross-functional teams to deliver 4 successful product launches`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led mechatronics team of 6 engineers, delivering 8+ automation solutions at ${company}`,
            `• Designed and implemented control systems for 3 major production lines, increasing output by 40%`,
            `• Optimized robotic systems reducing cycle time by 35% and saving $200K annually`,
            `• Developed integration strategies for 10+ IoT devices, improving data collection by 50%`,
            `• Mentored 4 junior engineers in PLC programming and system integration`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led mechatronics division of 20+ engineers at ${company}, overseeing $5M in automation projects`,
            `• Architected smart factory solutions that increased productivity by 45% and reduced costs by 30%`,
            `• Defined mechatronics strategy that became company standard for 3 manufacturing plants`,
            `• Implemented predictive maintenance systems reducing unplanned downtime by 60%`,
            `• Partnered with R&D to develop 5 patented mechatronic innovations`
        ];
    }
    return [
        `• Served as Director of Mechatronics Engineering, overseeing $20M automation portfolio and 50+ engineers`,
        `• Led Industry 4.0 transformation, increasing operational efficiency by 55% across 7 facilities`,
        `• Built mechatronics department from ground up, hiring 40+ specialists across 4 countries`,
        `• Presented automation strategy to board and secured $15M for smart factory initiative`,
        `• Mentored 12 engineering leads who now manage their own automation teams`
    ];
};