// utils/pools/dataEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDataEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built and maintained 15+ ETL pipelines processing 5M+ records daily at ${company}`,
            `• Wrote 100+ SQL queries for data extraction, transformation, and loading`,
            `• Implemented data quality checks reducing data errors by 50%`,
            `• Documented data lineage and metadata for 20+ data sources`,
            `• Collaborated with data analysts to understand and fulfill data requirements`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected data pipeline infrastructure processing 50M+ records daily at ${company}`,
            `• Designed and implemented data warehouse reducing query time from 45 seconds to 3 seconds`,
            `• Developed data integration framework for 10+ internal and external data sources`,
            `• Implemented data governance policies improving data quality by 70%`,
            `• Mentored 4 junior data engineers in ETL best practices and cloud technologies`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led data engineering team of 12 engineers, managing infrastructure for 100M+ daily records`,
            `• Defined data architecture strategy supporting real-time analytics and machine learning`,
            `• Built data platform reducing data processing time by 75% and costs by 40%`,
            `• Implemented data observability framework ensuring 99.9% pipeline reliability`,
            `• Partnered with business teams to enable data-driven decision making across organization`
        ];
    }
    return [
        `• Served as Director of Data Engineering, overseeing 30+ engineers and $8M annual budget`,
        `• Led data platform transformation increasing data availability from 95% to 99.9%`,
        `• Built data engineering organization from ground up, hiring 25+ engineers across 4 countries`,
        `• Presented data strategy to CTO and secured $12M for data infrastructure investment`,
        `• Mentored 10 data engineering leads who now manage their own teams`
    ];
};