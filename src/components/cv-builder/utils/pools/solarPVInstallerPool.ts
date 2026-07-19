// utils/pools/solarPVInstallerPool.ts

import { SeniorityLevel } from '../seniorityDetector';

export const getSolarPVInstallerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `• Installed 50+ solar panel systems with zero safety incidents at ${company}`,
            `• Learned to read technical diagrams and installation manuals for 20+ projects`,
            `• Assisted senior technicians with system testing and commissioning for 30+ projects`,
            `• Connected wiring and ensured proper grounding for 50+ installations`,
            `• Worked with teams to complete installations on time for 20+ projects`
        ];
    }
    if (level === 'mid') {
        return [
            `• Led installation teams for 100+ residential projects at ${company}`,
            `• Designed system layouts for optimal sun exposure and efficiency for 50+ projects`,
            `• Trained 10 junior installers on safety and best practices`,
            `• Troubleshot system issues and reduced downtime by 40%`,
            `• Managed project timelines and budgets for 20+ installations`
        ];
    }
    if (level === 'senior') {
        return [
            `• Led solar operations team of 30, overseeing 500+ installations annually at ${company}`,
            `• Defined installation standards that became company-wide`,
            `• Drove efficiency improvement that reduced installation time by 30%`,
            `• Developed training program that certified 50+ installers`,
            `• Built partnerships with suppliers, reducing material costs by 20%`
        ];
    }
    return [
        `• Served as Director of Solar Operations, overseeing 100+ installers and $50M in projects`,
        `• Led solar transformation that increased revenue by 60%`,
        `• Built solar installation organization from ground up, hiring 80+ professionals across 5 cities`,
        `• Presented solar strategy to board and secured $20M for expansion`,
        `• Mentored 15 solar leads who now run their own teams`
    ];
};