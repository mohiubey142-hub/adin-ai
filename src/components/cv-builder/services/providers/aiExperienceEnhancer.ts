// services/aiExperienceEnhancer.ts
// ============================================
// AI EXPERIENCE ENHANCER
// ============================================

import { AIProviderManager } from '../aiProvider';

export interface ExperienceParams {
    title: string;
    company: string;
    description: string;
    level: string;
}

export class AIExperienceEnhancer {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();
    }

    async enhance(params: ExperienceParams): Promise<string[]> {
        const { title, company, description, level } = params;

        const prompt = `You are a professional resume writer. Enhance the following job description into 5-6 powerful bullet points.

Job Title: ${title}
Company: ${company}
Level: ${level}
Current Description: ${description || 'Not provided'}

Requirements:
1. Each bullet must start with a strong action verb
2. Include quantifiable results where possible
3. Professional tone
4. 10-15 words per bullet
5. No emojis or informal language
6. ATS-friendly

Format: Return bullet points as an array of strings (JSON format).
Example: ["Led team of 10 developers...", "Increased efficiency by 30%..."]`;

        try {
            const result = await this.aiManager.generateJSON<string[]>(prompt);
            return result;
        } catch (error) {
            console.error('AI Experience enhancement failed:', error);
            // Fallback
            if (description) {
                return description.split('\n').filter(b => b.trim());
            }
            return [
                `• ${title} at ${company}`,
                '• Delivered high-quality results',
                '• Collaborated with cross-functional teams',
                '• Achieved project milestones',
                '• Maintained professional standards'
            ];
        }
    }
}