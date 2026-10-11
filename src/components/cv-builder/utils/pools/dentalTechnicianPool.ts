// utils/pools/dentalTechnicianPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getDentalTechnicianBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Fabricated 500+ dental prosthetics including crowns, bridges, and dentures at ${company}`,
            `• Used CAD/CAM technology to design 200+ dental restorations`,
            `• Maintained 99% accuracy in dental impressions and models`,
            `• Collaborated with 10+ dentists on complex prosthetic cases`,
            `• Documented 300+ laboratory procedures with 100% accuracy`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led dental laboratory team of 5 technicians at ${company}`,
            `• Fabricated 1,000+ dental prosthetics with 98% patient satisfaction`,
            `• Implemented digital workflow reducing production time by 40%`,
            `• Trained 8 junior technicians in CAD/CAM and 3D printing`,
            `• Improved prosthetic quality reducing remakes by 60%`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led dental laboratory of 15 technicians, producing 5,000+ prosthetics annually at ${company}`,
            `• Defined laboratory standards adopted across 3 facilities`,
            `• Drove innovation in digital dentistry and 3D printing`,
            `• Built relationships with 25+ dental clinics and hospitals`,
            `• Published 10+ articles on dental technology`
        ];
    }
    return [
        `• Served as Director of Dental Laboratory at ${company}, overseeing 30+ technicians and $3M budget`,
        `• Led dental laboratory transformation improving efficiency by 50%`,
        `• Built dental laboratory from ground up, hiring 25+ technicians`,
        `• Presented laboratory strategy to board and secured $2M for equipment`,
        `• Mentored 15 dental technology leaders who now run their own labs`
    ];
};