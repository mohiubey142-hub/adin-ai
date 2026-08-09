// utils/pools/supplyChainAnalystPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSupplyChainAnalystBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed supply chain data and identified 20+ cost-saving opportunities at ${company}`,
            `• Created 50+ inventory reports and demand forecasts using Excel and ERP systems`,
            `• Monitored supplier performance and prepared 30+ vendor scorecards`,
            `• Assisted in inventory optimization, reducing excess stock by 15%`,
            `• Collaborated with procurement and logistics teams to improve operational efficiency`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led supply chain analytics for 10+ product lines, generating $2M in cost savings at ${company}`,
            `• Developed forecasting models reducing stockouts by 40% and excess inventory by 30%`,
            `• Implemented supply chain KPI dashboards improving decision-making speed by 50%`,
            `• Analyzed supplier performance and negotiated contracts saving $500K annually`,
            `• Mentored 3 junior analysts in supply chain analytics and data visualization`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led supply chain analytics team of 10, driving $8M in annual savings through data-driven decisions`,
            `• Defined supply chain analytics strategy adopted across 5 business units`,
            `• Built predictive analytics models improving demand forecast accuracy by 35%`,
            `• Implemented supply chain control tower providing real-time visibility across 50+ suppliers`,
            `• Partnered with executive team to embed supply chain analytics into strategic planning`
        ];
    }
    return [
        `• Served as Director of Supply Chain Analytics, overseeing 25+ analysts and $5M annual budget`,
        `• Led analytics transformation improving supply chain efficiency by 40% and reducing costs by 25%`,
        `• Built supply chain analytics practice from ground up, hiring 20+ professionals across 3 countries`,
        `• Presented analytics strategy to board and secured $6M for technology investment`,
        `• Mentored 12 analytics leads who now manage their own supply chain teams`
    ];
};