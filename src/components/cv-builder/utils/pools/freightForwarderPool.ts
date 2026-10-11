// utils/pools/freightForwarderPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFreightForwarderBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Arranged 300+ freight shipments by sea, air, and land at ${company}`,
            `• Managed customs documentation for 200+ international shipments`,
            `• Negotiated rates with 50+ carriers saving 15% on freight costs`,
            `• Tracked 500+ shipments ensuring on-time delivery`,
            `• Documented 400+ freight reports with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led freight forwarding team of 5 forwarders at ${company}`,
            `• Managed 1,000+ international shipments with 98% on-time delivery`,
            `• Negotiated contracts with 20+ carriers saving $500K annually`,
            `• Implemented freight management systems reducing costs by 25%`,
            `• Trained 8 junior forwarders in international trade`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led freight forwarding department of 15 forwarders, managing $50M in freight at ${company}`,
            `• Defined freight forwarding standards adopted across 5 regions`,
            `• Drove cost reduction of 40% through strategic partnerships`,
            `• Built relationships with 30+ international carriers and customs brokers`,
            `• Published 10+ articles on freight forwarding`
        ];
    }
    return [
        `• Served as Director of Freight Forwarding at ${company}, overseeing 40+ forwarders and $20M budget`,
        `• Led freight transformation improving efficiency by 60%`,
        `• Built freight forwarding organization from ground up, hiring 35+ forwarders`,
        `• Presented freight strategy to board and secured $15M for expansion`,
        `• Mentored 20 freight forwarding leaders who now run their own companies`
    ];
};