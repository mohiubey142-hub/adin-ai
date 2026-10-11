// utils/pools/hrPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getHrBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Coordinated interview scheduling and candidate communication for 100+ candidates at ${company}`,
            `• Prepared offer letters and processed new hire documentation for 50+ employees`,
            `• Assisted with employee onboarding and orientation sessions for 100+ new hires`,
            `• Maintained employee files in HRIS for 200+ employees`,
            `• Responded to basic employee inquiries regarding policies and benefits`
        ];
    }
    if (level === 'mid') {
        return [
            `• Managed full-cycle recruitment for 50+ positions annually at ${company}`,
            `• Developed sourcing strategies and built talent pipelines for 20+ critical roles`,
            `• Partnered with hiring managers to define job requirements and selection criteria for 30+ roles`,
            `• Implemented onboarding program improving new hire retention by 25%`,
            `• Advised employees on HR policies and resolved 100+ workplace issues`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led HR department at ${company}, driving talent strategy and culture initiatives`,
            `• Developed performance management system adopted company-wide for 500+ employees`,
            `• Reduced time-to-hire by 40% through recruitment process optimization`,
            `• Implemented employee engagement programs improving retention by 30%`,
            `• Partnered with leadership on workforce planning for 10+ departments`
        ];
    }
    return [
        `• Served as Chief Human Resources Officer at ${company}, leading global HR strategy`,
        `• Managed $5M+ HR budget and led team of 30+ HR professionals across 5 countries`,
        `• Reduced turnover by 40% through comprehensive retention programs`,
        `• Implemented DEI initiatives increasing diverse hires by 50%`,
        `• Led organizational transformation during merger of 2,000+ employees`
    ];
};