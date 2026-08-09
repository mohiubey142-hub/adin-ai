// utils/pools/quantitySurveyorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getQuantitySurveyorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Prepared 50+ quantity takeoffs and bill of quantities for 10+ construction projects at ${company}`,
            `• Assisted in cost estimation and budgeting for projects worth $5M`,
            `• Conducted 100+ site measurements and material quantity verifications`,
            `• Reviewed 50+ contractor invoices and verified work progress`,
            `• Maintained cost databases and updated 200+ material and labor rates`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led quantity surveying for 12+ projects worth $20M, achieving 100% cost control at ${company}`,
            `• Prepared tender documents and evaluated 50+ contractor bids`,
            `• Implemented cost control systems reducing project cost overruns by 40%`,
            `• Negotiated contracts with 20+ suppliers and subcontractors, saving $1M annually`,
            `• Mentored 5 junior quantity surveyors in estimation, measurement, and cost management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed quantity surveying operations across 20+ projects, managing 10+ surveyors at ${company}`,
            `• Established cost management standards and procedures adopted organization-wide`,
            `• Led value engineering initiatives saving $5M across 5 major projects`,
            `• Developed automated cost estimation system reducing preparation time by 60%`,
            `• Partnered with executive team to optimize project budgets and financial planning`
        ];
    }
    return [
        `• Served as Director of Quantity Surveying, overseeing 25+ surveyors and $100M project portfolio`,
        `• Led cost management transformation improving budget accuracy by 40%`,
        `• Built quantity surveying practice from ground up, hiring 20+ professionals across 5 locations`,
        `• Presented cost strategy to board and secured $15M for technology and training`,
        `• Mentored 15 quantity surveying leads who now manage their own teams`
    ];
};