// utils/pools/physicianAssistantPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getPhysicianAssistantBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted 5+ physicians in managing 50+ patients daily at ${company}`,
            `• Performed 200+ patient histories and physical examinations with 100% accuracy`,
            `• Ordered and interpreted 300+ diagnostic tests and lab results`,
            `• Administered 150+ medications and treatments under physician supervision`,
            `• Documented 500+ patient encounters in electronic medical records`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led clinical team of 8 medical assistants, managing 100+ patients daily at ${company}`,
            `• Developed and implemented clinical protocols improving patient care efficiency by 30%`,
            `• Performed 50+ minor surgical procedures and assisted in 100+ major surgeries`,
            `• Managed patient education programs improving treatment compliance by 40%`,
            `• Mentored 6 junior physician assistants in clinical assessment and patient management`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed clinical operations across 3 departments, managing 20+ physician assistants at ${company}`,
            `• Established clinical standards and protocols adopted across 5+ facilities`,
            `• Led quality improvement initiatives reducing patient wait times by 50%`,
            `• Implemented telemedicine program expanding patient access by 60%`,
            `• Partnered with physicians and administration to optimize clinical workflows`
        ];
    }
    return [
        `• Served as Director of Clinical Services, overseeing 50+ physician assistants and $5M clinical budget`,
        `• Led clinical transformation improving patient outcomes by 35% and satisfaction by 45%`,
        `• Built clinical team from ground up, hiring 40+ professionals across 6 locations`,
        `• Presented clinical strategy to board and secured $8M for technology and expansion`,
        `• Mentored 25 clinical leads who now manage their own healthcare teams`
    ];
};