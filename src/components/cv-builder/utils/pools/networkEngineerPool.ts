// utils/pools/networkEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getNetworkEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Configured and maintained 100+ network devices including routers and switches at ${company}`,
            `• Resolved 300+ network connectivity issues with 90% first-call resolution`,
            `• Monitored network performance achieving 99.9% uptime`,
            `• Implemented 50+ VLANs and network segments`,
            `• Documented 100+ network configurations and topologies`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed enterprise network of 500+ devices across 10+ locations at ${company}`,
            `• Implemented SD-WAN reducing network costs by 35%`,
            `• Led network security implementation preventing 100+ intrusion attempts`,
            `• Optimized network performance improving throughput by 40%`,
            `• Mentored 5 junior network engineers in routing and switching`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led network team of 12 engineers managing 2,000+ devices at ${company}`,
            `• Defined network architecture adopted across 3 data centers`,
            `• Achieved 99.99% network uptime through redundancy and failover`,
            `• Implemented zero-trust network architecture protecting 10,000+ users`,
            `• Partnered with vendors to optimize network performance and costs`
        ];
    }
    return [
        `• Served as Director of Network Engineering at ${company}, overseeing 30+ engineers and $20M budget`,
        `• Led network transformation achieving 99.999% uptime`,
        `• Built network organization from ground up, hiring 25+ engineers`,
        `• Presented network strategy to CTO and secured $15M for infrastructure upgrade`,
        `• Mentored 15 network leaders who now run their own teams`
    ];
};