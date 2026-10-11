// utils/pools/medicalTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMedicalTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 1,000+ diagnostic tests including blood, urine, and tissue analysis at ${company}`,
            `• Operated and maintained 20+ laboratory instruments including analyzers, centrifuges, and microscopes`,
            `• Ensured 99% accuracy in test results through quality control and calibration procedures`,
            `• Prepared 500+ samples and maintained laboratory records with 100% traceability`,
            `• Assisted senior technologists in research and quality assurance activities`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led medical laboratory team of 6 technicians, conducting 5,000+ tests monthly at ${company}`,
            `• Implemented quality assurance program reducing errors by 60%`,
            `• Developed and validated 20+ new testing protocols and procedures`,
            `• Managed laboratory inventory and supply chain, ensuring 100% availability of reagents and consumables`,
            `• Mentored 5 junior technicians in laboratory techniques and quality standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed medical laboratory operations across 3 facilities, managing 20+ technicians at ${company}`,
            `• Established laboratory standards and procedures achieving ISO 15189 accreditation`,
            `• Led automation initiative reducing turnaround time by 50%`,
            `• Implemented Laboratory Information System improving efficiency and data accuracy by 70%`,
            `• Partnered with clinical teams to improve diagnostic services and patient care`
        ];
    }
    return [
        `• Served as Director of Laboratory Services, overseeing 50+ technicians and $10M annual budget`,
        `• Led laboratory transformation improving capacity by 60% and reducing costs by 30%`,
        `• Built laboratory organization from ground up, hiring 40+ professionals across 4 locations`,
        `• Presented laboratory strategy to board and secured $12M for automation and expansion`,
        `• Mentored 25 lab leads who now manage their own laboratory teams`
    ];
};