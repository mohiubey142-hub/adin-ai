// utils/pools/firefighterPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFirefighterBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Responded to 500+ emergency calls including fires, accidents, and medical emergencies at ${company}`,
            `• Rescued 100+ people from dangerous situations with 100% safety record`,
            `• Operated firefighting equipment and vehicles with precision`,
            `• Conducted 200+ fire safety inspections and prevention education`,
            `• Maintained physical fitness and training to highest standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led firefighting team of 8 firefighters at emergency scenes at ${company}`,
            `• Developed fire prevention programs reducing incidents by 40%`,
            `• Trained 15+ junior firefighters in advanced rescue techniques`,
            `• Managed 5+ major fire incidents with zero casualties`,
            `• Implemented equipment maintenance program reducing failures by 60%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led fire station of 50+ firefighters, managing 2,000+ emergency responses annually at ${company}`,
            `• Defined fire safety standards adopted across 5 stations`,
            `• Drove emergency response improvement by 50%`,
            `• Built relationships with 25+ emergency service organizations`,
            `• Published 10+ articles on firefighting best practices`
        ];
    }
    return [
        `• Served as Fire Chief at ${company}, overseeing 200+ firefighters and $20M budget`,
        `• Led fire service transformation reducing fire deaths by 60%`,
        `• Built fire service organization from ground up, hiring 150+ firefighters`,
        `• Presented fire safety strategy to government and secured $15M for equipment`,
        `• Mentored 20 fire service leaders who now run their own departments`
    ];
};