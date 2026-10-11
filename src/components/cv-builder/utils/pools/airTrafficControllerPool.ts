// utils/pools/airTrafficControllerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAirTrafficControllerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed 500+ aircraft movements daily ensuring safe separation at ${company}`,
            `• Communicated with 200+ pilots daily providing clear instructions`,
            `• Monitored radar and flight data for 1,000+ flights`,
            `• Maintained 100% safety record in all operations`,
            `• Documented 300+ flight movements with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed air traffic operations for 1,000+ daily movements at ${company}`,
            `• Trained 5+ junior controllers in radar and communication procedures`,
            `• Improved traffic flow reducing delays by 30%`,
            `• Handled 50+ emergency situations with 100% safety`,
            `• Maintained 99.99% safety record over 5 years`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led air traffic control team of 15 controllers, managing 2,000+ daily movements at ${company}`,
            `• Defined ATC procedures adopted across the facility`,
            `• Drove safety improvements reducing incidents by 60%`,
            `• Built relationships with 25+ airlines and aviation authorities`,
            `• Published 10+ articles on air traffic management`
        ];
    }
    return [
        `• Served as Director of Air Traffic Control at ${company}, overseeing 50+ controllers and $10M budget`,
        `• Led ATC transformation improving efficiency by 50%`,
        `• Built ATC organization from ground up, hiring 40+ controllers`,
        `• Presented ATC strategy to board and secured $15M for modernization`,
        `• Mentored 20 ATC leaders who now run their own facilities`
    ];
};