// utils/pools/radiologyTechnologistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getRadiologyTechnologistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed 500+ diagnostic imaging examinations including X-ray, CT, and MRI at ${company}`,
            `• Ensured patient safety by maintaining ALARA principles and using proper radiation protection`,
            `• Produced high-quality diagnostic images with 98% first-time success rate`,
            `• Maintained 15+ imaging equipment and performed daily quality control checks`,
            `• Provided compassionate care to 300+ patients, reducing anxiety by 40% through clear communication`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led radiology department of 8 technologists, managing 1,000+ imaging studies monthly at ${company}`,
            `• Introduced 5+ new imaging protocols, improving diagnostic quality by 35%`,
            `• Implemented patient positioning and comfort protocols reducing scan times by 20%`,
            `• Trained 10+ junior technologists in advanced imaging techniques and safety procedures`,
            `• Collaborated with radiologists to optimize imaging protocols for 15+ clinical indications`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed radiology services across 3 facilities at ${company}, managing 25+ technologists`,
            `• Established imaging protocols that became standards for 8+ healthcare facilities`,
            `• Implemented dose monitoring program reducing patient radiation exposure by 30%`,
            `• Developed clinical education program for 15+ radiology technology students`,
            `• Led equipment modernization project, transitioning to digital radiography across all facilities`
        ];
    }
    return [
        `• Served as Director of Radiology Services, overseeing 50+ technologists and $15M equipment portfolio`,
        `• Led radiology transformation improving diagnostic quality by 35% across 7 facilities`,
        `• Built radiology department from ground up, hiring 45+ specialists across 5 locations`,
        `• Presented radiology strategy to board and secured $20M for advanced imaging expansion`,
        `• Mentored 18 radiology leads who now manage their own imaging departments`
    ];
};