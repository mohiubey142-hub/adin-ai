// utils/pools/mobileDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMobileDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 8+ mobile apps for iOS and Android using React Native at ${company}`,
            `• Implemented 40+ mobile UI components with 100% platform compliance`,
            `• Published 5+ apps to App Store and Play Store with 4.5+ star ratings`,
            `• Optimized app performance achieving 60fps animations and smooth scrolling`,
            `• Fixed 100+ bugs and crashes improving app stability by 80%`
        ];
    }
    if (level === 'mid') {
        return [
            `• Built 5+ complex mobile applications using Flutter and native technologies at ${company}`,
            `• Led mobile architecture for 3+ enterprise apps serving 100K+ users`,
            `• Improved app performance by 50% through optimization and code refactoring`,
            `• Implemented CI/CD pipeline reducing release time from 2 weeks to 2 days`,
            `• Mentored 4 junior mobile developers in cross-platform development`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led mobile development team of 10 developers, building 15+ mobile apps at ${company}`,
            `• Defined mobile architecture adopted across 3 product lines`,
            `• Improved app retention by 40% through UX optimization`,
            `• Established mobile testing framework reducing bugs by 60%`,
            `• Partnered with product teams to deliver 10+ major mobile features`
        ];
    }
    return [
        `• Served as Director of Mobile Engineering at ${company}, overseeing 25+ developers and $6M budget`,
        `• Led mobile transformation achieving 5M+ app downloads`,
        `• Built mobile development organization from ground up, hiring 20+ developers`,
        `• Presented mobile strategy to CTO and secured $4M for platform development`,
        `• Mentored 12 mobile development leads who now run their own teams`
    ];
};