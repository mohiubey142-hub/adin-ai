// utils/pools/freelancerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getFreelancerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Started freelancing and built first 5 clients within 3 months at ${company}`,
            `• Learned to manage projects, clients, and finances for 10+ projects`,
            `• Built first network of 50+ clients and collaborators`,
            `• Created portfolio that got me hired for 10+ projects`,
            `• Learned to price services and negotiate with confidence`
        ];
    }
    if (level === 'mid') {
        return [
            `• Grew freelance business to $100K annual revenue at ${company}`,
            `• Managed 15+ clients simultaneously while maintaining quality`,
            `• Built system for client acquisition generating 10+ leads monthly`,
            `• Diversified services across 3 categories, reducing risk`,
            `• Mentored 5 new freelancers and watched them succeed`
        ];
    }
    if (level === 'senior') {
        return [
            `• Built freelance business to $500K annual revenue with 4 subcontractors at ${company}`,
            `• Led 50+ projects across 10+ clients, delivering exceptional quality`,
            `• Created systems that allowed working only 20 hours per week`,
            `• Built network of 100+ clients and collaborators`,
            `• Published 20+ articles and became industry thought leader`
        ];
    }
    return [
        `• Built freelance business generating $1M+ annually with 15+ subcontractors`,
        `• Led 200+ projects across 5 industries, building unmatched expertise`,
        `• Created systems that allowed fully remote, location-independent lifestyle`,
        `• Mentored 20+ freelancers who now earn 6-figure incomes`,
        `• Published book on freelancing and shared lessons with the world`
    ];
};