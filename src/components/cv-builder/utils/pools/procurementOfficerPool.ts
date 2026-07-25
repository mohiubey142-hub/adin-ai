// utils/pools/procurementOfficerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getProcurementOfficerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Processed 200+ purchase requisitions and purchase orders for 50+ vendors at ${company}`,
            `• Negotiated pricing for 100+ routine purchases, achieving 15% cost savings`,
            `• Maintained vendor database and performance records for 80+ suppliers`,
            `• Ensured compliance with procurement policies and procedures for all purchases`,
            `• Assisted in bid evaluation and vendor selection for 30+ procurement projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led procurement team of 5 professionals, managing $15M annual procurement budget at ${company}`,
            `• Developed and executed sourcing strategies for 5+ categories, achieving 18% cost savings`,
            `• Negotiated contracts with 20+ strategic suppliers, securing $2M in annual savings`,
            `• Implemented e-procurement system reducing processing time by 50%`,
            `• Mentored 4 junior procurement officers in strategic sourcing and contract negotiation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed procurement operations across 5 facilities, managing $50M annual spend at ${company}`,
            `• Established global sourcing strategy reducing costs by 25% while improving quality by 30%`,
            `• Built strategic supplier partnerships with 15+ key vendors, improving delivery performance by 40%`,
            `• Implemented sustainable procurement practices achieving 20% reduction in carbon footprint`,
            `• Developed procurement talent program producing 10+ procurement leaders`
        ];
    }
    return [
        `• Served as Chief Procurement Officer, overseeing $200M annual spend and 40+ procurement professionals`,
        `• Led procurement transformation achieving 30% cost reduction across 10+ categories`,
        `• Built procurement organization from ground up, hiring 35+ specialists across 6 countries`,
        `• Presented procurement strategy to board and secured $20M for digital procurement initiatives`,
        `• Mentored 20 procurement leaders who now manage their own procurement teams`
    ];
};