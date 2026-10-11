// utils/pools/callCenterAgentPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCallCenterAgentBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Handled 200+ customer calls daily with 95% satisfaction rate at ${company}`,
            `• Resolved 500+ customer issues efficiently and professionally`,
            `• Maintained 98% attendance and punctuality`,
            `• Achieved 90% first-call resolution rate`,
            `• Documented 1,000+ customer interactions with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led call center team of 10 agents at ${company}`,
            `• Managed 300+ calls daily while coaching 5 junior agents`,
            `• Improved customer satisfaction by 40% through quality assurance`,
            `• Implemented call handling procedures reducing average handle time by 25%`,
            `• Trained 8 new agents on customer service best practices`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led call center operations of 50+ agents, handling 10,000+ calls daily at ${company}`,
            `• Defined customer service standards adopted across 3 centers`,
            `• Drove customer satisfaction improvement to 95%`,
            `• Built relationships with 25+ clients and stakeholders`,
            `• Published 10+ articles on call center management`
        ];
    }
    return [
        `• Served as Director of Call Center Operations at ${company}, overseeing 100+ agents and $5M budget`,
        `• Led call center transformation improving efficiency by 50%`,
        `• Built call center from ground up, hiring 80+ agents`,
        `• Presented operations strategy to board and secured $3M for technology`,
        `• Mentored 25 call center leaders who now run their own centers`
    ];
};