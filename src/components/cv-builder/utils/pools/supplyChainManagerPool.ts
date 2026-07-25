// utils/pools/supplyChainManagerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSupplyChainManagerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Coordinated 200+ shipments monthly, ensuring 98% on-time delivery at ${company}`,
            `• Monitored inventory levels and maintained optimal stock for 500+ SKUs`,
            `• Processed 150+ purchase orders and tracked shipments from 20+ suppliers`,
            `• Resolved 30+ supply chain issues, minimizing disruption and customer impact`,
            `• Maintained supplier relationships and negotiated pricing for 10+ key vendors`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led supply chain team of 8 professionals, managing $20M annual procurement budget at ${company}`,
            `• Implemented demand forecasting reducing inventory costs by 20% and improving stock turnover by 35%`,
            `• Optimized logistics routes reducing transportation costs by 15% while improving delivery times by 25%`,
            `• Developed supplier scorecard system improving supplier performance by 30% across 50+ vendors`,
            `• Mentored 4 junior supply chain analysts in procurement and inventory management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed supply chain operations across 3 countries, managing 50+ staff and $100M annual spend at ${company}`,
            `• Led digital supply chain transformation, implementing AI-powered forecasting with 90% accuracy`,
            `• Established strategic partnerships with 15+ key suppliers, securing preferential pricing and terms`,
            `• Reduced supply chain costs by 25% while improving service levels to 99%`,
            `• Developed risk management framework mitigating supply chain disruptions for 20+ critical components`
        ];
    }
    return [
        `• Served as VP of Supply Chain, overseeing global operations across 15 countries and $500M annual spend`,
        `• Led supply chain transformation improving efficiency by 35% and reducing costs by 30%`,
        `• Built supply chain organization from ground up, hiring 100+ professionals across 8 countries`,
        `• Presented supply chain strategy to board and secured $50M for digital transformation`,
        `• Mentored 30 supply chain leaders who now manage their own global operations`
    ];
};