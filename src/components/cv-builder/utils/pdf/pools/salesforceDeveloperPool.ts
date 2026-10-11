// utils/pools/salesforceDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSalesforceDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Developed 20+ Salesforce customizations using Apex and Visualforce at ${company}`,
            `• Built 15+ Lightning components with 100% user adoption`,
            `• Created 30+ automation workflows reducing manual effort by 40%`,
            `• Integrated Salesforce with 5+ external systems using REST APIs`,
            `• Documented 25+ technical specifications and user guides`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led Salesforce implementations for 5+ enterprise clients at ${company}`,
            `• Developed complex Apex triggers and batch processes handling 1M+ records`,
            `• Built integration architecture connecting Salesforce with 10+ systems`,
            `• Improved system performance by 50% through optimization`,
            `• Mentored 5 junior Salesforce developers in Apex and LWC`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led Salesforce practice of 15 developers, delivering 20+ enterprise projects at ${company}`,
            `• Defined Salesforce architecture adopted across 10+ implementations`,
            `• Achieved Salesforce Technical Architect certification`,
            `• Developed reusable frameworks reducing development time by 40%`,
            `• Partnered with sales teams to align technical solutions with business goals`
        ];
    }
    return [
        `• Served as Director of Salesforce at ${company}, overseeing 40+ developers and $12M budget`,
        `• Led Salesforce transformation for 50+ enterprise clients`,
        `• Built Salesforce practice from ground up, hiring 35+ developers`,
        `• Presented Salesforce strategy to board and secured $10M for practice expansion`,
        `• Mentored 20 Salesforce leaders who now run their own practices`
    ];
};