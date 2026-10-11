import { SeniorityLevel } from '../seniorityDetector';

export const getPerformanceMarketerBullets = (level: SeniorityLevel, company: string): string[] => {
    if (level === 'junior') {
        return [
            `📊 Managed $50K+ in ad spend, achieving 3x ROAS. ROAS is the performance marketer's measure.`,
            `📈 Ran 50+ campaigns across Meta and Google Ads. Experience is the performance marketer's teacher.`,
            `📝 Created ad creatives and copy that converted. Creativity is the performance marketer's superpower.`,
            `🔧 Optimized campaigns based on data analysis. Data is the performance marketer's compass.`,
            `🤝 Collaborated with design teams to improve ad performance. Collaboration makes marketing work.`
        ];
    }
    if (level === 'mid') {
        return [
            `📊 Managed $500K+ in ad spend, achieving 4x ROAS. ROI is the performance marketer's measure.`,
            `📈 Led 100+ campaigns generating $5M in revenue. Revenue is the performance marketer's superpower.`,
            `📝 Developed campaign strategies that outperformed industry benchmarks. Strategy is the performance marketer's foundation.`,
            `🔧 Implemented AI-powered bidding that reduced CPA by 40%. AI is the performance marketer's superpower.`,
            `🤝 Mentored 8 junior performance marketers. Mentorship is the performance marketer's legacy.`
        ];
    }
    if (level === 'senior') {
        return [
            `🏛️ Led performance marketing team of 20, managing $10M ad spend. The scale is humbling.`,
            `📊 Defined performance strategy that increased revenue by 150%. Strategy is the performance marketer's superpower.`,
            `📈 Built analytics framework that measured true ROI. Analytics is the performance marketer's foundation.`,
            `📝 Created training program that produced 30+ performance marketers. Training is the performance marketer's legacy.`,
            `🤝 Partnered with product teams to improve conversion rates. Partnership makes performance marketing sustainable.`
        ];
    }
    return [
        `🏆 Served as Director of Performance Marketing, overseeing 50+ marketers and $100M ad spend. The best investment was marketing talent.`,
        `📊 Led performance transformation that increased ROI by 300%. ROI is the performance marketer's measure.`,
        `📈 Built performance marketing organization from ground up, hiring 40+ professionals across 5 countries. Culture is the marketing superpower.`,
        `📝 Presented performance strategy to CEO and secured $50M for growth. When leadership believes, marketing leads.`,
        `💙 Mentored 20 marketing leads who now run their own teams. My greatest legacy is the marketers I helped create.`
    ];
};