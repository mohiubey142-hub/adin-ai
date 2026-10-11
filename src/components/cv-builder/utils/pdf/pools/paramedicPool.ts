// utils/pools/paramedicPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getParamedicBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Responded to 300+ emergency calls, providing advanced life support and pre-hospital care at ${company}`,
            `• Performed 150+ patient assessments and interventions including airway management, CPR, and trauma care`,
            `• Assisted in 200+ ambulance transfers, ensuring patient stability and comfort during transport`,
            `• Documented 300+ patient care reports with 100% accuracy and completeness`,
            `• Collaborated with emergency room teams to ensure smooth patient handover`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led paramedic team of 6, responding to 1,000+ emergency calls annually at ${company}`,
            `• Developed and delivered emergency response training to 30+ team members`,
            `• Implemented quality improvement program reducing response times by 20%`,
            `• Coordinated with hospitals and emergency services for 100+ mass casualty incidents`,
            `• Mentored 8 junior paramedics in advanced life support and trauma care`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed paramedic operations across 3 locations, managing 25+ paramedics at ${company}`,
            `• Established emergency response protocols and standards adopted region-wide`,
            `• Led preparedness planning for natural disasters and mass casualty events, training 100+ first responders`,
            `• Implemented ambulance tracking system improving dispatch efficiency by 40%`,
            `• Partnered with hospitals and government agencies to enhance emergency medical services`
        ];
    }
    return [
        `• Served as Director of Emergency Medical Services, overseeing 60+ paramedics and $5M annual budget`,
        `• Led EMS transformation improving response times by 30% and survival rates by 25%`,
        `• Built EMS organization from ground up, hiring 50+ paramedics across 5 stations`,
        `• Presented EMS strategy to board and secured $8M for fleet and equipment modernization`,
        `• Mentored 20 EMS leads who now manage their own emergency response teams`
    ];
};