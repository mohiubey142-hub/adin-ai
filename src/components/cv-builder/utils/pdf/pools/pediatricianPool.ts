// utils/pools/pediatricianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPediatricianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided comprehensive pediatric care to 500+ children from newborns to adolescents at ${company}`,
            `• Performed 300+ well-child checkups, tracking growth and developmental milestones`,
            `• Administered 1,000+ vaccinations with 99.5% compliance to immunization schedules`,
            `• Managed 200+ common childhood illnesses, achieving 95% recovery rate`,
            `• Counseled 150+ parents on nutrition, safety, and developmental concerns`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed pediatric ward of 25 beds, treating 1,000+ children annually at ${company}`,
            `• Developed asthma management program reducing ER visits by 50%`,
            `• Led vaccination campaign achieving 95% coverage in target population`,
            `• Managed 100+ NICU cases with 92% survival rate for premature infants`,
            `• Mentored 8 junior pediatricians in neonatal care and child development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led pediatric department of 20 physicians, treating 10,000+ children annually at ${company}`,
            `• Established pediatric ICU reducing mortality by 35%`,
            `• Developed childhood obesity program that improved BMI in 70% of participants`,
            `• Published 12+ research papers in pediatric journals`,
            `• Mentored 25+ pediatric residents who now practice across 4 countries`
        ];
    }
    return [
        `• Served as Director of Pediatrics at ${company}, overseeing 50+ pediatricians and $20M budget`,
        `• Built children's hospital from ground up, serving 50,000+ children annually`,
        `• Led pediatric research program securing $10M in grants`,
        `• Presented pediatric strategy to board and secured $12M for NICU expansion`,
        `• Mentored 35+ pediatric leaders who now head their own departments`
    ];
};