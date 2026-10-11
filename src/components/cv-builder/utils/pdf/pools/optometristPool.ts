// utils/pools/optometristPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getOptometristBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Performed comprehensive eye examinations for 600+ patients annually at ${company}`,
            `• Prescribed corrective lenses for 400+ patients, achieving 98% satisfaction rate`,
            `• Detected 50+ cases of eye conditions including glaucoma and diabetic retinopathy`,
            `• Fitted 200+ contact lenses and provided proper care and usage education`,
            `• Maintained 10+ diagnostic equipment and ensured compliance with optical standards`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led optometry department of 4 optometrists, managing 800+ patients annually at ${company}`,
            `• Introduced advanced diagnostic testing for 5+ conditions, improving detection rates by 40%`,
            `• Implemented patient education programs reducing eye disease progression in 60+ patients`,
            `• Trained 6+ junior optometrists in advanced diagnostic techniques and clinical care`,
            `• Collaborated with ophthalmologists for 30+ complex cases requiring surgical intervention`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed optometry services across 3 facilities at ${company}, managing 12+ optometrists`,
            `• Established clinical protocols improving patient outcomes for 5+ eye conditions`,
            `• Launched community vision screening programs serving 2,000+ underserved patients annually`,
            `• Developed clinical education program for 8+ optometry interns and residents`,
            `• Led practice expansion with advanced diagnostic technology investment of $1M`
        ];
    }
    return [
        `• Served as Director of Optometry Services, overseeing 25+ optometrists and $5M annual revenue`,
        `• Led practice transformation increasing patient volume by 50% across 5 locations`,
        `• Built optometry practice from ground up, hiring 22+ specialists across 4 locations`,
        `• Presented expansion strategy and secured $3M for new vision centers`,
        `• Mentored 12 practice leads who now manage their own optometry clinics`
    ];
};