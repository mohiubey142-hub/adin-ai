// utils/pools/dataScientistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDataScientistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Analyzed datasets and discovered 10+ patterns that improved business decisions at ${company}`,
            `• Wrote Python scripts that turned hours of manual work into minutes for 5+ projects`,
            `• Built dashboards that executives used for 10+ decisions`,
            `• Conducted A/B tests and discovered 5+ insights`,
            `• Collaborated with product teams to define metrics for 5+ features`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led projects to predict customer churn with 85% accuracy at ${company}`,
            `• Built machine learning models that increased revenue by 15% in 6 months`,
            `• Presented findings to C-suite and influenced 10+ strategic decisions`,
            `• Developed ETL pipelines that processed 10M+ records daily`,
            `• Mentored 3 junior data scientists through pair programming`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led data science team of 12, building models that drove $50M in annual revenue`,
            `• Architected data infrastructure reducing time-to-insight from weeks to hours`,
            `• Defined data strategy for entire organization`,
            `• Implemented MLOps pipeline reducing model deployment time from 2 weeks to 2 hours`,
            `• Partnered with product and engineering teams to embed data into every decision`
        ];
    }
    return [
        `• Served as Director of Data Science, overseeing 30+ data professionals and $5M budget`,
        `• Drove data strategy increasing company valuation by $200M`,
        `• Built data science center of excellence from ground up, recruiting top talent from 5 countries`,
        `• Presented to board members and secured $10M for AI innovation`,
        `• Mentored 5 data science leads who now run their own teams`
    ];
};