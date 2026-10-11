// utils/pools/supplyChainPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSupplyChainBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Managed procurement of 500+ SKUs worth $2M annually at ${company}`,
            `• Coordinated 200+ shipments ensuring 95% on-time delivery`,
            `• Analyzed inventory data identifying $500K in cost savings opportunities`,
            `• Maintained supplier relationships with 50+ vendors`,
            `• Processed 1,000+ purchase orders with 99% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led supply chain operations for $20M inventory across 3 warehouses at ${company}`,
            `• Implemented demand forecasting reducing stockouts by 45%`,
            `• Negotiated contracts with 20+ suppliers saving $3M annually`,
            `• Optimized logistics network reducing transportation costs by 25%`,
            `• Mentored 5 junior supply chain analysts in procurement and logistics`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led supply chain department of 25 professionals managing $100M inventory at ${company}`,
            `• Defined supply chain strategy adopted across 5 business units`,
            `• Implemented ERP system improving planning accuracy by 60%`,
            `• Achieved 30% reduction in total supply chain costs through optimization`,
            `• Partnered with executive team to align supply chain with business goals`
        ];
    }
    return [
        `• Served as VP of Supply Chain at ${company}, overseeing 60+ professionals and $50M budget`,
        `• Led supply chain transformation improving efficiency by 50%`,
        `• Built supply chain organization from ground up, hiring 50+ professionals across 8 countries`,
        `• Presented supply chain strategy to board and secured $20M for technology investment`,
        `• Mentored 25 supply chain leaders who now run their own organizations`
    ];
};