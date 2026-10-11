// utils/pools/surveyorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSurveyorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted 200+ land surveys for construction and development at ${company}`,
            `• Measured 500+ plot boundaries with 99.9% accuracy`,
            `• Prepared 100+ survey maps and reports`,
            `• Operated surveying equipment including total stations and GPS`,
            `• Documented 300+ survey data points with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led survey team of 5 surveyors on major projects at ${company}`,
            `• Managed 50+ land surveys with 99.95% accuracy`,
            `• Implemented survey procedures reducing errors by 60%`,
            `• Trained 8 junior surveyors in surveying techniques`,
            `• Improved survey efficiency by 45% through technology adoption`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led surveying department of 15 surveyors, managing 500+ surveys annually at ${company}`,
            `• Defined surveying standards adopted across 5 projects`,
            `• Drove survey accuracy improvement to 99.99%`,
            `• Built relationships with 25+ developers and government agencies`,
            `• Published 10+ articles on land surveying`
        ];
    }
    return [
        `• Served as Director of Surveying at ${company}, overseeing 40+ surveyors and $5M budget`,
        `• Led surveying transformation improving efficiency by 60%`,
        `• Built surveying organization from ground up, hiring 35+ surveyors`,
        `• Presented surveying strategy to board and secured $3M for technology`,
        `• Mentored 20 surveying leaders who now run their own departments`
    ];
};