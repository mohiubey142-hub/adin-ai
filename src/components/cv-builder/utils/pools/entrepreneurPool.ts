// utils/pools/entrepreneurPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getEntrepreneurBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Launched first business and learned what it means to build from ground up at ${company}`,
            `• Learned to validate ideas before building them for 5+ concepts`,
            `• Built first network of 50+ customers who believed in the vision`,
            `• Learned to pitch and raised $50K in pre-seed funding`,
            `• Turned an idea into a product that 100+ people paid for`
        ];
    }
    if (level === 'mid') {
        return [
            `• Grew business from $0 to $1M revenue in 18 months at ${company}`,
            `• Led team of 12 and learned what it means to lead`,
            `• Built partnerships that opened 3+ new markets`,
            `• Raised $2M in seed funding from investors`,
            `• Pivoted business model twice before finding product-market fit`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led company of 50+ employees, scaling revenue to $10M at ${company}`,
            `• Drove strategy that led to successful exit`,
            `• Built culture that employees actually loved with 90% retention`,
            `• Mentored 10+ founders and watched them succeed`,
            `• Raised $10M Series A from top-tier VCs`
        ];
    }
    return [
        `• Built 3 companies with total revenue of $100M`,
        `• Led 2 successful exits totaling $50M`,
        `• Founded and scaled companies across 3 industries`,
        `• Mentored 20+ entrepreneurs who now lead their own companies`,
        `• Wrote 50+ articles and shared lessons learned with the world`
    ];
};