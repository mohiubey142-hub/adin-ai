// utils/pools/windTurbineTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getWindTurbineTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Maintained 20+ wind turbines ensuring optimal performance at ${company}`,
            `• Learned to read schematics and diagnostic tools for 10+ projects`,
            `• Performed routine inspections and preventive maintenance for 50+ turbines`,
            `• Assisted with electrical and mechanical repairs for 30+ turbines`,
            `• Worked at heights up to 100 meters with 100% safety record`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led maintenance teams for 50+ wind turbines at ${company}`,
            `• Diagnosed and repaired complex mechanical issues for 30+ turbines`,
            `• Developed maintenance schedules that reduced downtime by 35%`,
            `• Trained 8 junior technicians on safety protocols`,
            `• Managed inventory and spare parts logistics for 20+ sites`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led wind operations team of 40, overseeing 200+ turbines at ${company}`,
            `• Defined maintenance standards that became industry benchmark`,
            `• Drove innovation that improved turbine efficiency by 15%`,
            `• Created safety training program adopted across the industry`,
            `• Partnered with manufacturers to improve turbine design`
        ];
    }
    return [
        `• Served as Director of Wind Operations, overseeing 150+ technicians and $100M in assets`,
        `• Led wind transformation that increased energy output by 30%`,
        `• Built wind operations from ground up, hiring 120+ professionals across 3 regions`,
        `• Presented wind strategy to board and secured $50M for expansion`,
        `• Mentored 20 wind leads who now run their own operations`
    ];
};