// utils/pools/customerSupportSpecialistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCustomerSupportSpecialistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Resolved 200+ customer tickets monthly, achieving 95% satisfaction rate at ${company}`,
            `• Handled 50+ inbound calls daily, providing prompt and professional support`,
            `• Reduced average response time from 24 hours to 4 hours through efficient ticket management`,
            `• Maintained 100% accuracy in documenting customer interactions and resolutions`,
            `• Achieved 98% first-contact resolution rate for technical support queries`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led customer support team of 8 representatives, handling 2,000+ tickets monthly at ${company}`,
            `• Implemented knowledge base reducing ticket volume by 30% through self-service`,
            `• Developed training program improving team CSAT scores from 88% to 95%`,
            `• Analyzed support metrics and implemented process improvements reducing resolution time by 40%`,
            `• Mentored 6 junior support specialists in technical troubleshooting and customer service`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed customer support operations across 3 regions, managing 30+ support representatives at ${company}`,
            `• Established support processes and KPIs adopted as global standards for 5+ offices`,
            `• Launched AI-powered chatbot handling 40% of queries, reducing team workload significantly`,
            `• Achieved 98% CSAT and 100% SLA compliance for 12 consecutive months`,
            `• Built and scaled support team from 10 to 30+ representatives, maintaining high quality`
        ];
    }
    return [
        `• Served as Director of Customer Support, overseeing 60+ representatives and 5 global support centers`,
        `• Led support transformation achieving 40% efficiency improvement and 30% cost reduction`,
        `• Built support organization from ground up, hiring 55+ professionals across 4 countries`,
        `• Presented support strategy to board and secured $10M for AI and automation initiatives`,
        `• Mentored 25 support leaders who now manage their own global support teams`
    ];
};