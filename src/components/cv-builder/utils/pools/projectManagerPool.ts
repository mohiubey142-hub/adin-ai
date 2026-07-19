// utils/pools/projectManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProjectManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed project schedules and kept everyone accountable for 5+ projects at ${company}`,
            `• Created project documentation that helped teams for 10+ projects`,
            `• Facilitated daily standups that teams actually enjoyed for 5+ teams`,
            `• Tracked project risks and escalated issues before they became problems for 5+ projects`,
            `• Delivered first project on time and under budget`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 10+ projects simultaneously, delivering all on time and within budget at ${company}`,
            `• Implemented project management framework that improved delivery speed by 40%`,
            `• Managed relationships with 10+ stakeholders across 4 departments`,
            `• Reduced project risks by 60% through proactive identification and mitigation`,
            `• Delivered $5M project that became company's flagship product`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led PMO team of 15, managing $100M project portfolio at ${company}`,
            `• Defined project management standards that became company-wide`,
            `• Drove project selection process that prioritized impact over politics`,
            `• Partnered with executive team to align projects with strategy`,
            `• Increased project success rate from 65% to 92%`
        ];
    }
    return [
        `• Served as Director of PMO, overseeing $500M project portfolio and 40+ project managers`,
        `• Led transformation that improved project delivery speed by 60%`,
        `• Built PMO from ground up, hiring 30+ PMs across 6 countries`,
        `• Presented project performance to board and secured $10M for new initiatives`,
        `• Mentored 10 project leads who now run their own PMOs`
    ];
};