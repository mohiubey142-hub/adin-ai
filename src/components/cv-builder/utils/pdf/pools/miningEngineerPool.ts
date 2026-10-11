// utils/pools/miningEngineerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getMiningEngineerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Assisted in planning and executing 10+ mining operations, ensuring safety and efficiency at ${company}`,
            `• Conducted geological surveys and analyzed 200+ rock samples for mineral content`,
            `• Monitored daily production metrics, achieving 95% of targets for 6 consecutive months`,
            `• Implemented safety protocols reducing incidents by 30% across 3 mine sites`,
            `• Collaborated with environmental teams to ensure compliance with 5+ regulatory requirements`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led mining engineering team of 8 engineers, optimizing production by 25% at ${company}`,
            `• Developed mine plans that increased ore recovery by 18%, adding $5M in value annually`,
            `• Implemented advanced blasting techniques reducing costs by 15%`,
            `• Designed mine ventilation systems improving air quality and worker safety`,
            `• Mentored 4 junior engineers in mine planning and geotechnical analysis`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led mining operations across 3 sites at ${company}, managing $50M budget and 200+ workers`,
            `• Defined mining strategy increasing production by 35% while reducing costs by 20%`,
            `• Implemented automated mining systems improving efficiency by 40%`,
            `• Ensured 100% compliance with environmental and safety regulations`,
            `• Built strong relationships with 5+ local communities, ensuring sustainable operations`
        ];
    }
    return [
        `• Served as Director of Mining Operations, overseeing $200M portfolio and 500+ professionals`,
        `• Led mining transformation increasing profitability by 45% across 7 sites`,
        `• Built mining organization from ground up, hiring 300+ specialists in 5 countries`,
        `• Presented mining strategy to board and secured $80M for expansion`,
        `• Mentored 25 engineering leaders who now manage their own mining operations`
    ];
};