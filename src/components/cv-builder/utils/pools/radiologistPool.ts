// utils/pools/radiologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRadiologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Interpreted 1,000+ X-rays, CT scans, and MRIs annually at ${company}`,
            `• Performed 200+ ultrasound examinations with 95% diagnostic accuracy`,
            `• Assisted in 100+ interventional radiology procedures`,
            `• Documented 1,500+ radiology reports with 100% accuracy`,
            `• Participated in 50+ multidisciplinary tumor boards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Interpreted 2,500+ advanced imaging studies annually at ${company}`,
            `• Performed 300+ interventional procedures including biopsies and drainages`,
            `• Introduced low-dose CT protocol reducing radiation by 40%`,
            `• Led radiology quality improvement program reducing errors by 60%`,
            `• Mentored 6 junior radiologists in advanced imaging interpretation`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led radiology department of 20 specialists, interpreting 10,000+ studies annually at ${company}`,
            `• Established advanced imaging center with 3T MRI and 256-slice CT`,
            `• Developed AI-assisted diagnosis program improving accuracy by 25%`,
            `• Published 15+ research papers in radiology journals`,
            `• Mentored 25+ radiology residents who now practice across 5 countries`
        ];
    }
    return [
        `• Served as Director of Radiology at ${company}, overseeing 50+ radiologists and $30M budget`,
        `• Built imaging center from ground up, performing 100,000+ studies annually`,
        `• Led radiology research program securing $12M in grants`,
        `• Presented radiology strategy to board and secured $20M for advanced equipment`,
        `• Mentored 35+ radiology leaders who now head their own departments`
    ];
};