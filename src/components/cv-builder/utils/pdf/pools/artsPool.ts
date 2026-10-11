// utils/pools/artsPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getArtsBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Wrote and edited 50+ content pieces for digital and print platforms at ${company}`,
            `• Assisted in research for 10+ publications and academic projects`,
            `• Proofread and edited 200+ documents for accuracy and clarity`,
            `• Conducted research for publications and academic projects`,
            `• Supported senior writers and editors in content development`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led content development projects and managed writing teams of 5+ members at ${company}`,
            `• Developed and edited 20+ academic publications and research papers`,
            `• Created engaging content for digital and print platforms reaching 100K+ readers`,
            `• Mentored junior writers and provided editorial guidance to 8+ team members`,
            `• Ensured quality standards and brand consistency across 100+ content pieces`
        ];
    }
    if (level === 'senior') {
        return [
            `• Directed content strategy and creative operations at ${company}, managing 20+ writers`,
            `• Managed editorial teams and oversaw publication of 50+ major works`,
            `• Developed brand voice and content guidelines adopted organization-wide`,
            `• Established partnerships with 5+ publishers and academic institutions`,
            `• Provided strategic leadership for arts and humanities initiatives`
        ];
    }
    return [
        `• Served as Creative Director at ${company}, leading content strategy for 50+ projects`,
        `• Developed content that reached 1M+ readers across 10+ platforms`,
        `• Established editorial standards adopted across the industry`,
        `• Built teams that produced award-winning publications`,
        `• Mentored writers who became published authors`
    ];
};