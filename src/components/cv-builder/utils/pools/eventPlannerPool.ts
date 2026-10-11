// utils/pools/eventPlannerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEventPlannerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Planned and executed 30+ events including corporate and social gatherings at ${company}`,
            `• Managed event budgets totaling $500K with 100% accountability`,
            `• Coordinated with 50+ vendors and suppliers`,
            `• Achieved 95% client satisfaction through attention to detail`,
            `• Documented 100+ event plans and checklists`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led planning and execution of 20+ major events at ${company}`,
            `• Managed event budgets totaling $5M with 15% cost savings`,
            `• Coordinated 5+ event teams on complex multi-day events`,
            `• Delivered 3+ award-winning events for major clients`,
            `• Mentored 5 junior planners in event management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led event planning team of 15 planners, managing 100+ events annually at ${company}`,
            `• Defined event management standards adopted across the organization`,
            `• Drove client satisfaction improvement to 98%`,
            `• Built relationships with 50+ vendors and venues`,
            `• Published 10+ articles on event planning best practices`
        ];
    }
    return [
        `• Served as Director of Events at ${company}, overseeing 40+ planners and $20M budget`,
        `• Led event transformation delivering 500+ successful events`,
        `• Built event planning organization from ground up, hiring 35+ planners`,
        `• Presented event strategy to board and secured $15M for event expansion`,
        `• Mentored 20 event leaders who now run their own event companies`
    ];
};