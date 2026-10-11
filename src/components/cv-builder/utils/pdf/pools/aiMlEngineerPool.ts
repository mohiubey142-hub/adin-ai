// utils/pools/aiMlEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAiMlEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 10+ ML models using Python and Scikit-learn at ${company}`,
            `• Processed and cleaned 1M+ records for model training and validation`,
            `• Evaluated model performance using accuracy, precision, and recall metrics`,
            `• Deployed 5+ models to production with 99.5% uptime`,
            `• Collaborated with data scientists to understand business problems and requirements`
        ];
    }
    if (level === 'mid') {
        return [
            `• Built ML models that improved business outcomes by 30% at ${company}`,
            `• Built ETL pipelines that processed 100M+ records daily`,
            `• Deployed 10+ models to production with 99.9% uptime`,
            `• Implemented MLOps practices reducing model deployment time from 2 weeks to 2 hours`,
            `• Mentored 5 junior ML engineers through pair programming sessions`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led ML team of 15 engineers, building models that generated $50M in value`,
            `• Defined ML strategy adopted as company standard for AI development`,
            `• Architected AI platform reducing model development time by 60%`,
            `• Presented AI vision to board and secured $10M for AI innovation`,
            `• Partnered with product teams to embed AI into 5+ products`
        ];
    }
    return [
        `• Served as Director of AI, overseeing $50M AI portfolio and 60+ AI professionals`,
        `• Led AI transformation increasing company valuation by $500M`,
        `• Built AI organization from ground up, hiring 50+ engineers across 6 countries`,
        `• Presented AI strategy to CEO and secured $20M for AI innovation`,
        `• Mentored 12 AI leads who now run their own AI teams`
    ];
};