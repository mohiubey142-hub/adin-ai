// utils/pools/hotelReceptionistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHotelReceptionistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Greeted and checked in 100+ guests daily at ${company}`,
            `• Managed reservations and room assignments with 99% accuracy`,
            `• Handled 200+ phone calls and emails daily`,
            `• Achieved 95% guest satisfaction rating`,
            `• Processed 100+ payments and invoices daily`
        ];
    }
    if (level === 'mid') {
        return [
            `• Supervised reception team of 5 receptionists at ${company}`,
            `• Managed 300+ guest check-ins and check-outs daily`,
            `• Improved guest satisfaction by 40% through quality service`,
            `• Trained 8 junior receptionists in customer service`,
            `• Implemented booking system reducing errors by 50%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led front desk team of 12 receptionists at ${company}`,
            `• Managed 500+ guest interactions daily with 98% satisfaction`,
            `• Defined guest service standards adopted across 3 hotels`,
            `• Drove guest satisfaction improvement to 98%`,
            `• Built relationships with 25+ vendors and travel agencies`
        ];
    }
    return [
        `• Served as Front Office Manager at ${company}, overseeing 30+ receptionists`,
        `• Led front office transformation improving efficiency by 50%`,
        `• Built reception team from ground up, hiring 25+ professionals`,
        `• Presented front office strategy to board and secured $1M for upgrades`,
        `• Mentored 15 front office leaders who now run their own departments`
    ];
};