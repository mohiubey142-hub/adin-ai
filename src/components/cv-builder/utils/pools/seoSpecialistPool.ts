// utils/pools/seoSpecialistPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSeoSpecialistBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Optimized 100+ web pages, improving search rankings by 40% at ${company}`,
            `• Conducted keyword research for 10+ clients with 95% accuracy`,
            `• Wrote SEO-friendly content that increased organic traffic by 50%`,
            `• Analyzed website performance using Google Analytics and Search Console for 20+ sites`,
            `• Collaborated with content teams to implement SEO strategies for 15+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led SEO strategy for 20+ clients, increasing organic revenue by 60% at ${company}`,
            `• Developed comprehensive SEO plans that secured $1M in new business`,
            `• Created content strategy that generated 50K+ monthly visitors`,
            `• Implemented technical SEO improvements that reduced load time by 40%`,
            `• Mentored 5 junior SEO specialists through professional development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led SEO team of 15, driving $10M in organic revenue at ${company}`,
            `• Defined SEO strategy that became agency standard`,
            `• Built SEO framework that improved ROI by 200%`,
            `• Created training program that certified 50+ SEO professionals`,
            `• Partnered with product teams to embed SEO in product development`
        ];
    }
    return [
        `• Served as Director of SEO, overseeing 50+ specialists and $50M organic revenue`,
        `• Led SEO transformation that increased market share by 35%`,
        `• Built SEO organization from ground up, hiring 40+ professionals across 4 countries`,
        `• Presented SEO strategy to CEO and secured $10M for innovation`,
        `• Mentored 15 SEO leads who now run their own agencies`
    ];
};