// utils/pools/gynecologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getGynecologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided comprehensive women's health care to 400+ patients annually at ${company}`,
            `• Assisted in 100+ deliveries, including 20+ cesarean sections, with 100% maternal safety`,
            `• Performed 200+ routine gynecological exams and screenings`,
            `• Managed 150+ prenatal care patients, achieving 95% full-term deliveries`,
            `• Counseled 200+ women on contraception, fertility, and menopause management`
        ];
    }
    if (level === 'mid') {
        return [
            `• Performed 300+ deliveries and 100+ gynecological surgeries at ${company}`,
            `• Developed high-risk pregnancy program reducing complications by 40%`,
            `• Performed 150+ laparoscopic surgeries with 98% success rate`,
            `• Managed 200+ infertility cases, achieving 45% pregnancy rate`,
            `• Mentored 6 junior gynecologists in obstetrics and surgical procedures`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led obstetrics department performing 2,000+ deliveries annually at ${company}`,
            `• Established IVF center achieving 55% success rate, highest in region`,
            `• Introduced minimally invasive surgery program reducing recovery time by 60%`,
            `• Published 10+ research papers in obstetrics and gynecology`,
            `• Mentored 20+ gynecology residents who now practice across 3 countries`
        ];
    }
    return [
        `• Served as Director of Women's Health at ${company}, overseeing 35+ specialists and $18M budget`,
        `• Built women's hospital from ground up, serving 25,000+ patients annually`,
        `• Led maternal health program reducing maternal mortality by 50%`,
        `• Presented women's health strategy to board and secured $10M for fertility center`,
        `• Mentored 25+ gynecology leaders who now head their own departments`
    ];
};