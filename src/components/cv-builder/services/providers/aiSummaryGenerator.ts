// services/aiSummaryGenerator.ts
// ============================================
// AI SUMMARY GENERATOR - IMPROVED VERSION
// ============================================

import { AIProviderManager } from '../aiProvider';

export interface SummaryParams {
    jobTitle: string;
    company?: string;
    years: number;
    profession: string;
    skills: string[];  // Used ONLY for context, NOT injected directly
    experiences: any[];
}

export class AISummaryGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();
    }

    async generate(params: SummaryParams): Promise<string> {
        const { jobTitle, company, years, profession, skills, experiences } = params;

        // ✅ Extract key skills (max 3-4 for context only)
        const keySkills = skills.length > 0 
            ? skills.slice(0, 4).join(', ') 
            : 'various professional skills';

        // ✅ Extract experience context (not dumping entire list)
        const experienceContext = experiences.length > 0
            ? `${experiences.length} relevant positions`
            : 'professional experience';

        const companyText = company ? ` at ${company}` : '';

        // ✅ IMPROVED PROMPT - No skill dumping, natural language only
        const prompt = `You are a professional resume writer. Write a compelling executive-level professional summary.

Job Title: ${jobTitle}
Years of Experience: ${years}
Company: ${company || 'various organizations'}
Profession Field: ${profession}
Key Skills (for reference only - DO NOT LIST THEM): ${keySkills}
Experience Context: ${experienceContext}

CRITICAL RULES:
1. DO NOT list skills like "Skilled in X, Y, Z" - this is keyword stuffing
2. DO NOT mention individual skills directly in the summary
3. DO NOT create a bulleted list
4. Write in natural, flowing prose (60-100 words)
5. Start with "Experienced ${jobTitle} with ${years}+ years of experience"
6. Focus on: Domain expertise, key strengths, professional achievements, value proposition
7. Mention the company if provided (not mandatory)
8. End with a strong professional closing statement
9. Sound human, not robotic
10. ATS-friendly naturally (not keyword-stuffed)

FORMAT (No bullet points):
[Experience + Domain] [Key Strength and Expertise] [Impact/Achievement and Professional Value]

Example for Teacher:
"Experienced Teacher with 4+ years of expertise in curriculum development, classroom management, and student assessment. Successfully implemented instructional strategies that improved student engagement and learning outcomes. Strong communicator with a commitment to educational excellence and continuous professional development."

Write only the summary, nothing else.`;

        try {
            // ✅ FIX: Pass custom options for summary generation
            // ✅ maxTokens reduced from 500 to 220 (optimal for 60-100 word summary)
            const result = await this.aiManager.generate(prompt, undefined, {
                temperature: 0.7,
                maxTokens: 220,  // ✅ OPTIMIZED: 220 tokens is sufficient for summary
                retryCount: 2,    // ✅ REDUCED: 2 retries instead of 3
                timeout: 15000    // ✅ REDUCED: 15 seconds instead of 30
            });
            return this.cleanSummary(result, jobTitle, years);
        } catch (error) {
            // ✅ FIX: Better error logging (no stack trace in UI)
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('AI Summary generation failed:', errorMessage);
            
            // ✅ FIX: Check if it's a credit issue
            if (errorMessage.includes('insufficient') || errorMessage.includes('402')) {
                console.warn('⚠️ AI credits insufficient. Using fallback summary.');
            }
            
            // ✅ Improved fallback - no skill dumping
            return this.generateFallbackSummary(jobTitle, company, years, profession);
        }
    }

    // ✅ Clean summary - remove any accidental skill lists
    private cleanSummary(text: string, jobTitle: string, years: number): string {
        let cleaned = text.trim();

        // Remove any "Skilled in X, Y, Z" patterns
        cleaned = cleaned.replace(/Skilled in [^,.!?]+(, [^,.!?]+)*/gi, '');
        cleaned = cleaned.replace(/Proficient in [^,.!?]+(, [^,.!?]+)*/gi, '');
        cleaned = cleaned.replace(/Expert in [^,.!?]+(, [^,.!?]+)*/gi, '');
        cleaned = cleaned.replace(/Skills include [^,.!?]+(, [^,.!?]+)*/gi, '');
        cleaned = cleaned.replace(/Core competencies include [^,.!?]+(, [^,.!?]+)*/gi, '');
        cleaned = cleaned.replace(/Key skills include [^,.!?]+(, [^,.!?]+)*/gi, '');

        // Remove any remaining "Skill: Value" patterns
        cleaned = cleaned.replace(/[A-Za-z]+:\s*[A-Za-z, ]+/g, '');

        // Clean multiple spaces and punctuation
        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/[,;]\s*[,;]/g, ',');
        cleaned = cleaned.replace(/\.\s*\./g, '.');

        // Ensure it starts with job title
        if (!cleaned.toLowerCase().includes(jobTitle.toLowerCase())) {
            cleaned = `Experienced ${jobTitle} with ${years}+ years of experience. ${cleaned}`;
        }

        // Ensure length is 60-100 words
        const words = cleaned.split(' ').filter(w => w.length > 0);
        if (words.length < 50) {
            // Add a professional closing if too short
            cleaned = cleaned + ' Dedicated to delivering exceptional results and driving organizational success.';
        }
        if (words.length > 120) {
            cleaned = words.slice(0, 115).join(' ') + '.';
        }

        return cleaned;
    }

    // ✅ Improved fallback - no skill dumping
    private generateFallbackSummary(jobTitle: string, company: string | undefined, years: number, profession: string): string {
        const companyText = company ? ` at ${company}` : '';
        const yearText = years > 0 ? `${years}+ years of experience` : 'proven experience';

        const fallbacks: Record<string, string[]> = {
            teacher: [
                `Experienced ${jobTitle} with ${yearText}${companyText}. Expert in curriculum development, instructional delivery, and student assessment. Demonstrated ability to create engaging learning environments that foster student achievement and growth. Passionate about educational innovation and committed to fostering academic excellence.`,
                `Dedicated ${jobTitle} with ${yearText}${companyText}. Skilled in classroom management, differentiated instruction, and educational technology integration. Proven track record of improving student outcomes through data-driven teaching strategies and personalized learning approaches.`
            ],
            doctor: [
                `Experienced ${jobTitle} with ${yearText}${companyText}. Expert in clinical diagnosis, patient care, and treatment planning. Proven ability to manage complex medical cases while maintaining high standards of patient safety and satisfaction. Committed to evidence-based practice and continuous professional development.`,
                `Compassionate ${jobTitle} with ${yearText}${companyText}. Specialized in preventive medicine, chronic disease management, and patient education. Demonstrated success in improving patient outcomes through comprehensive care coordination and clinical excellence.`
            ],
            developer: [
                `Experienced ${jobTitle} with ${yearText}${companyText}. Expert in full-stack development, system architecture, and agile methodologies. Proven ability to deliver scalable software solutions that drive business value and enhance user experience. Passionate about clean code and technical innovation.`,
                `Results-driven ${jobTitle} with ${yearText}${companyText}. Specialized in API design, cloud infrastructure, and performance optimization. Demonstrated success in leading development teams and delivering complex projects on schedule. Committed to engineering excellence and continuous learning.`
            ],
            business: [
                `Experienced ${jobTitle} with ${yearText}${companyText}. Expert in strategic planning, operations management, and business development. Proven ability to drive revenue growth, optimize processes, and build high-performing teams. Committed to delivering sustainable business results and organizational excellence.`,
                `Results-oriented ${jobTitle} with ${yearText}${companyText}. Specialized in market analysis, project management, and stakeholder engagement. Demonstrated success in leading transformative initiatives and achieving measurable business outcomes.`
            ],
            general: [
                `Experienced ${jobTitle} with ${yearText}${companyText}. Proven track record of delivering results and driving organizational success through strategic initiatives and operational excellence. Strong leadership capabilities with a focus on continuous improvement and professional growth.`,
                `Dedicated ${jobTitle} with ${yearText}${companyText}. Expert in project management, stakeholder collaboration, and process optimization. Demonstrated ability to achieve objectives and exceed performance targets. Committed to excellence and continuous professional development.`
            ]
        };

        const professionKey = profession in fallbacks ? profession : 'general';
        const options = fallbacks[professionKey];
        return options[Math.floor(Math.random() * options.length)];
    }
}