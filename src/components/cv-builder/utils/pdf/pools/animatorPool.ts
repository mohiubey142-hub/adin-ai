// utils/pools/animatorPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getAnimatorBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 50+ 2D and 3D animations for various projects at ${company}`,
            `• Produced 100+ motion graphics for social media and advertising`,
            `• Animated 30+ characters for games and videos`,
            `• Collaborated with 10+ clients on animation projects`,
            `• Built a portfolio of 20+ published animations`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led animation for 10+ major projects including games and films at ${company}`,
            `• Developed animation pipelines reducing production time by 40%`,
            `• Created 200+ high-quality animations using Maya and Blender`,
            `• Managed 5+ junior animators on complex projects`,
            `• Won 3 animation awards for creative excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led animation team of 15 artists, producing 500+ animations annually at ${company}`,
            `• Defined animation style adopted across 5 product lines`,
            `• Drove innovation in real-time animation and VR`,
            `• Built relationships with 20+ studios and clients`,
            `• Published 10+ articles on animation techniques`
        ];
    }
    return [
        `• Served as Animation Director at ${company}, overseeing 30+ animators and $5M budget`,
        `• Led animation transformation delivering 5,000+ animations`,
        `• Built animation studio from ground up, hiring 25+ artists`,
        `• Presented animation vision to clients and secured $8M in new projects`,
        `• Mentored 15 animation leaders who now run their own studios`
    ];
};