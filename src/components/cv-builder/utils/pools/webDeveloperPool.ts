// utils/pools/webDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getWebDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 15+ responsive websites using HTML5, CSS3, and JavaScript at ${company}`,
            `• Implemented 50+ UI components with 100% cross-browser compatibility`,
            `• Optimized website performance achieving 90+ PageSpeed score`,
            `• Collaborated with designers to implement 20+ pixel-perfect designs`,
            `• Maintained 10+ client websites with 99.9% uptime`
        ];
    }
    if (level === 'mid') {
        return [
            `• Built 10+ complex web applications using React, Next.js, and TypeScript at ${company}`,
            `• Improved website performance by 60% through code optimization and caching`,
            `• Implemented SEO best practices increasing organic traffic by 40%`,
            `• Led frontend architecture for 5+ enterprise projects`,
            `• Mentored 5 junior developers in modern web development practices`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led web development team of 12 developers, building 20+ enterprise applications at ${company}`,
            `• Defined web architecture adopted across 5 product lines`,
            `• Improved site performance from 3s to 800ms load time (73% improvement)`,
            `• Established code review process reducing bugs by 50%`,
            `• Partnered with product teams to deliver 15+ major features`
        ];
    }
    return [
        `• Served as Director of Web Engineering at ${company}, overseeing 30+ developers and $8M budget`,
        `• Led web transformation improving conversion rate by 35%`,
        `• Built web development organization from ground up, hiring 25+ developers`,
        `• Presented web strategy to CTO and secured $5M for platform modernization`,
        `• Mentored 15 web development leads who now run their own teams`
    ];
};