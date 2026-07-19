// utils/pools/frontendDeveloperPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFrontendDeveloperBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Built 25+ responsive UI components using React and TypeScript at ${company}`,
            `• Implemented 100+ pixel-perfect designs from Figma mockups`,
            `• Fixed 60+ cross-browser compatibility issues across Chrome, Firefox, and Safari`,
            `• Wrote 150+ unit tests using Jest and React Testing Library, achieving 85% coverage`,
            `• Collaborated with senior developers to learn best practices and improve code quality`
        ];
    }
    if (level === 'mid') {
        return [
            `• Architected reusable component library used by 6 product teams, reducing development time by 45%`,
            `• Implemented global state management using Redux Toolkit for 10+ applications`,
            `• Optimized frontend performance improving Core Web Vitals scores by 55%`,
            `• Integrated RESTful APIs and managed real-time data synchronization for 20+ features`,
            `• Conducted 100+ code reviews and established frontend coding standards`
        ];
    }
    if (level === 'senior') {
        return [
            `• Designed micro-frontend architecture decomposing monolith at ${company}`,
            `• Drove technical roadmap for frontend platform supporting 5M+ users`,
            `• Mentored 15+ frontend engineers and conducted performance reviews`,
            `• Established frontend observability strategy reducing error rates by 45%`,
            `• Led migration from legacy codebase to modern React patterns for 10+ applications`
        ];
    }
    return [
        `• Led frontend engineering organization at ${company}, managing 25+ engineers`,
        `• Defined technical strategy and architecture standards company-wide`,
        `• Reduced bundle size by 60% and improved performance by 45%`,
        `• Established hiring process and grew team from 3 to 25 engineers`,
        `• Partnered with product leadership on 3-year technical roadmap`
    ];
};