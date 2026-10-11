// utils/pools/caregiverPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getCaregiverBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Provided daily care to 50+ elderly and disabled clients at ${company}`,
            `• Assisted with 1,000+ activities of daily living including bathing and dressing`,
            `• Administered 500+ medications ensuring 100% accuracy`,
            `• Prepared 800+ nutritious meals according to dietary requirements`,
            `• Documented 400+ care notes with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed care team of 5 caregivers for 30+ clients at ${company}`,
            `• Developed personalized care plans improving client outcomes by 40%`,
            `• Trained 8 junior caregivers in elderly and disability care`,
            `• Implemented safety protocols reducing falls by 60%`,
            `• Improved client satisfaction scores by 45%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led caregiving team of 15 professionals, serving 100+ clients at ${company}`,
            `• Defined care standards adopted across 3 facilities`,
            `• Drove quality of life improvement for clients by 50%`,
            `• Built relationships with 25+ healthcare providers and families`,
            `• Published 5+ articles on compassionate caregiving`
        ];
    }
    return [
        `• Served as Director of Care Services at ${company}, overseeing 40+ caregivers and $2M budget`,
        `• Led caregiving transformation improving client outcomes by 60%`,
        `• Built caregiving organization from ground up, hiring 35+ caregivers`,
        `• Presented care strategy to board and secured $1.5M for training programs`,
        `• Mentored 20 caregiving leaders who now run their own facilities`
    ];
};