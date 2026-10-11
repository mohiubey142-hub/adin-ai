// utils/pools/midwifePool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMidwifeBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in 200+ deliveries ensuring safe births at ${company}`,
            `• Provided prenatal care to 300+ expectant mothers`,
            `• Conducted 500+ prenatal checkups with 100% accuracy`,
            `• Educated 400+ mothers on breastfeeding and newborn care`,
            `• Documented 300+ birth records with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed maternity ward of 20 beds at ${company}`,
            `• Assisted in 500+ deliveries including 50+ complicated births`,
            `• Developed prenatal education program reducing complications by 40%`,
            `• Supervised 5+ junior midwives in clinical practice`,
            `• Improved maternal satisfaction scores by 45%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led midwifery team of 15 midwives, assisting 1,000+ deliveries annually at ${company}`,
            `• Defined midwifery protocols adopted across 3 hospitals`,
            `• Drove maternal health improvement reducing mortality by 50%`,
            `• Built relationships with 25+ healthcare organizations`,
            `• Published 10+ articles on midwifery best practices`
        ];
    }
    return [
        `• Served as Director of Midwifery at ${company}, overseeing 40+ midwives and $3M budget`,
        `• Led midwifery transformation improving maternal outcomes by 60%`,
        `• Built midwifery organization from ground up, hiring 35+ midwives`,
        `• Presented midwifery strategy to board and secured $2M for maternal health`,
        `• Mentored 20 midwifery leaders who now run their own departments`
    ];
};