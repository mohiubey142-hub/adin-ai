// utils/pools/fintechPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFintechBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed 10+ fintech features for digital banking and payment platforms at ${company}`,
            `• Integrated 5+ payment gateways and APIs processing $1M+ monthly`,
            `• Implemented 20+ financial calculations and transaction validations`,
            `• Tested 100+ fintech use cases ensuring 99.9% accuracy`,
            `• Documented 50+ technical specifications for financial products`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led development of 5+ fintech products processing $10M+ monthly at ${company}`,
            `• Built real-time payment system reducing transaction time by 70%`,
            `• Implemented fraud detection reducing losses by 60%`,
            `• Managed 5+ fintech engineers on complex financial integrations`,
            `• Mentored 4 junior fintech developers in payment systems`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led fintech team of 15 engineers, building platforms processing $100M+ monthly at ${company}`,
            `• Defined fintech architecture adopted across 5 product lines`,
            `• Drove innovation in blockchain and open banking`,
            `• Achieved PCI DSS compliance for all payment systems`,
            `• Partnered with banks and regulators to launch 10+ financial products`
        ];
    }
    return [
        `• Served as Director of FinTech at ${company}, overseeing 40+ engineers and $20M budget`,
        `• Led fintech transformation processing $1B+ monthly`,
        `• Built fintech organization from ground up, hiring 35+ engineers`,
        `• Presented fintech strategy to board and secured $25M for platform development`,
        `• Mentored 20 fintech leaders who now run their own teams`
    ];
};