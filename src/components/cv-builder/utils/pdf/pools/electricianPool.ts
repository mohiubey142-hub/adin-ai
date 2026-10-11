// utils/pools/electricianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getElectricianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed and maintained electrical systems in 50+ buildings at ${company}`,
            `• Learned to read electrical blueprints and schematics for 20+ projects`,
            `• Assisted senior electricians with complex installations for 30+ projects`,
            `• Troubleshot and fixed 100+ electrical issues efficiently`,
            `• Worked with construction teams to complete 20+ projects on time`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led electrical installations for 20+ construction projects at ${company}`,
            `• Designed electrical layouts for 10+ residential and commercial buildings`,
            `• Managed 10+ electricians across multiple sites`,
            `• Troubleshot complex electrical issues with 95% first-time fix rate`,
            `• Trained 15 junior electricians through hands-on mentorship`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led electrical department of 50+, overseeing 100+ projects annually`,
            `• Defined electrical safety standards that became industry benchmark`,
            `• Drove innovation that reduced installation time by 25%`,
            `• Developed training program that certified 100+ electricians`,
            `• Built partnerships with suppliers, reducing material costs by 20%`
        ];
    }
    return [
        `• Served as Director of Electrical Operations, overseeing 200+ electricians and $50M portfolio`,
        `• Led electrical transformation improving project delivery by 40%`,
        `• Built electrical organization from ground up, hiring 150+ professionals across 6 cities`,
        `• Presented electrical strategy to board and secured $20M for modernization`,
        `• Mentored 25 electrician leads who now run their own teams`
    ];
};