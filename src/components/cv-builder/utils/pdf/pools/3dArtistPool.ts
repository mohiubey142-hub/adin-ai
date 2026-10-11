// utils/pools/3dArtistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const get3dArtistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Created 50+ 3D models for games, products, and animations at ${company}`,
            `• Textured and shaded 100+ 3D assets using Substance Painter`,
            `• Rendered 200+ high-quality 3D images for various clients`,
            `• Collaborated with 10+ teams on 3D projects`,
            `• Built a portfolio of 30+ published 3D artworks`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led 3D art for 10+ major projects including games and films at ${company}`,
            `• Developed 3D pipelines reducing production time by 35%`,
            `• Created 300+ high-quality 3D models and environments`,
            `• Managed 5+ junior 3D artists on complex projects`,
            `• Won 3 3D art awards for creative excellence`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led 3D art team of 15 artists, producing 1,000+ 3D assets annually at ${company}`,
            `• Defined 3D art style adopted across 5 product lines`,
            `• Drove innovation in real-time 3D and VR`,
            `• Built relationships with 20+ studios and clients`,
            `• Published 10+ articles on 3D art techniques`
        ];
    }
    return [
        `• Served as 3D Art Director at ${company}, overseeing 30+ artists and $5M budget`,
        `• Led 3D art transformation delivering 10,000+ 3D assets`,
        `• Built 3D art studio from ground up, hiring 25+ artists`,
        `• Presented creative vision to clients and secured $8M in new projects`,
        `• Mentored 15 3D art leaders who now run their own studios`
    ];
};