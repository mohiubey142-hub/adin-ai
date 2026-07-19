// utils/pools/doctorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDoctorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Conducted patient history assessments and physical examinations for 500+ patients under senior supervision at ${company}`,
            `• Assisted senior physicians with 200+ routine medical procedures and patient documentation`,
            `• Ordered and interpreted diagnostic tests including blood work and imaging studies for 300+ patients`,
            `• Participated in daily rounds and presented 100+ patient cases to attending physicians`,
            `• Provided patient education on treatment plans and medication adherence to 150+ patients`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed independent outpatient clinic handling 25+ patients daily at ${company}`,
            `• Developed treatment plans for 500+ acute and chronic conditions following evidence-based guidelines`,
            `• Performed 100+ routine medical procedures including suturing and minor surgeries`,
            `• Supervised 10+ medical students and interns during clinical rotations`,
            `• Collaborated with specialists for 50+ complex case management and referrals`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led department of 15+ physicians at ${company}, overseeing clinical operations and quality metrics`,
            `• Developed clinical protocols and treatment guidelines adopted department-wide, improving outcomes by 25%`,
            `• Mentored 20+ junior physicians and conducted performance evaluations`,
            `• Presented grand rounds on 30+ complex cases and emerging treatment modalities`,
            `• Reduced hospital readmission rates by 30% through comprehensive discharge planning`
        ];
    }
    return [
        `• Served as Chief of Medical Services at ${company}, driving strategic healthcare initiatives`,
        `• Established quality assurance programs improving patient outcomes by 25% across 5 departments`,
        `• Managed budget of $5M+ and led team of 50+ physicians and support staff`,
        `• Represented hospital at 10+ national healthcare conferences and policy boards`,
        `• Implemented telemedicine program expanding patient access by 40% to rural areas`
    ];
};