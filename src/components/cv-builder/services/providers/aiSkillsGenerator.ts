// services/aiSkillsGenerator.ts
// ============================================
// AI SKILLS GENERATOR - FIXED DUPLICATES
// ============================================

import { AIProviderManager } from '../aiProvider';

export interface SkillsParams {
    jobTitle: string;
    profession: string;
    existingSkills: string[];
    industry: string;
}

export class AISkillsGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();
    }

    async generate(params: SkillsParams): Promise<string[]> {
        const { jobTitle, profession, existingSkills, industry } = params;

        // ✅ Only send top 5 existing skills as reference (not all)
        const topExisting = existingSkills.slice(0, 5);
        const existingText = topExisting.length > 0 
            ? topExisting.join(', ') 
            : 'None provided';

        // ✅ IMPROVED PROMPT - Tell AI to avoid duplicates
        const prompt = `You are a professional resume writer. Generate a comprehensive list of 10-15 relevant skills for a ${jobTitle} in the ${industry} industry.

Current Skills (already in CV - DO NOT REPEAT THESE): ${existingText}
Profession: ${profession}

CRITICAL RULES:
1. DO NOT include any skill already listed in "Current Skills"
2. Include both technical and soft skills
3. Include industry-relevant skills
4. Return as JSON array of strings
5. No emojis or informal language
6. ATS-friendly

Format: Return skills as an array of strings (JSON format).
Example: ["JavaScript", "React", "Project Management", "Communication"]`;

        try {
            const result = await this.aiManager.generateJSON<string[]>(prompt);
            
            // ✅ Deduplicate with existing skills (case insensitive)
            const existingLower = existingSkills.map(s => s.toLowerCase().trim());
            const uniqueNew = result.filter(s => 
                !existingLower.includes(s.toLowerCase().trim())
            );
            
            return uniqueNew;
        } catch (error) {
            console.error('AI Skills generation failed:', error);
            // ✅ FALLBACK - Return skills not already in existing
            const fallbackSkills: Record<string, string[]> = {
                developer: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL', 'TypeScript', 'REST APIs', 'Docker'],
                teacher: ['Teaching', 'Lesson Planning', 'Communication', 'Mentoring', 'Assessment', 'Curriculum Design', 'Classroom Management'],
                doctor: ['Patient Care', 'Diagnosis', 'Communication', 'EMR Systems', 'Clinical Skills', 'Treatment Planning', 'Medical Documentation'],
                accountant: ['QuickBooks', 'Financial Reporting', 'Tax Preparation', 'Excel', 'Auditing', 'Compliance', 'Budgeting'],
                sales: ['Sales Strategy', 'CRM Software', 'Negotiation', 'Communication', 'Lead Generation', 'Closing', 'Account Management'],
                hr: ['Recruiting', 'Onboarding', 'Employee Relations', 'Performance Management', 'Compliance', 'Training', 'Talent Acquisition'],
                general: ['Communication', 'Problem Solving', 'Team Collaboration', 'Time Management', 'Leadership', 'Adaptability', 'Critical Thinking']
            };
            const fallback = fallbackSkills[profession] || fallbackSkills.general;
            
            // ✅ Deduplicate with existing skills
            const existingLower = existingSkills.map(s => s.toLowerCase().trim());
            return fallback.filter(s => !existingLower.includes(s.toLowerCase().trim()));
        }
    }
}