// services/aiSummaryGenerator.ts
// ============================================
// AI SUMMARY GENERATOR (FRESHER + LEVEL-AWARE)
// ============================================
//
// ✅ KEY PRIORITY: SUMMARY → EXPERIENCE → PROJECT → ACHIEVEMENT → COVER_LETTER
// ✅ Dynamic profession-specific generation
// ✅ Works for ANY unknown profession equally
// ✅ Anti-generic, anti-invention rules
// ✅ Strict length control: 40–45 words, 45 max
// ✅ Fresher-aware (handles 0 years / no experience)
// ✅ Level-aware (junior / mid / senior / manager / director)
// ============================================

import { AIProviderManager } from '../aiProvider';                 // ⬅️ ../ (providers se ek upar)
import { GroqProvider } from './groqProvider';                     // ⬅️ same folder
import { getKeysForFeature } from './groqKeyManager';              // ⬅️ same folder

export interface SummaryParams {
    jobTitle: string;
    company?: string;
    years: number;
    profession: string;
    skills: string[];
    experiences: any[];
    level?: string;
}

export class AISummaryGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();

        // ✅ Register feature-specific Groq provider (SUMMARY priority)
        const keys = getKeysForFeature('SUMMARY');
        if (keys.length > 0 && !this.aiManager.getProviders().includes('groq-summary')) {
            this.aiManager.registerProvider(
                'groq-summary',
                new GroqProvider(keys)
            );
            this.aiManager.setDefaultProvider('groq-summary');
            console.log(
                `✅ AISummaryGenerator: registered groq-summary with keys [${keys
                    .map(k => k.source)
                    .join(' → ')}]`
            );
        }
    }

    async generate(params: SummaryParams, providerName?: string): Promise<string> {
        const { jobTitle, company, years, profession, skills, experiences, level } = params;

        const keySkills = skills.length > 0
            ? skills.slice(0, 6).join(', ')
            : '';

        // ============================================
        // ✅ FRESHER DETECTION
        // ============================================
        const hasRealExperience = experiences?.some((exp: any) =>
            exp.title?.trim() &&
            exp.company?.trim() &&
            exp.startDate?.trim() &&
            exp.endDate?.trim()
        );
        const isFresher = !hasRealExperience || years < 1 || level === 'fresher';

        // ============================================
        // ✅ LEVEL — Use passed level or default
        // ============================================
        const effectiveLevel = level || (isFresher ? 'fresher' : 'mid');

        // ============================================
        // ✅ LEVEL-SPECIFIC INSTRUCTIONS
        // ============================================
        const getLevelInstruction = (lvl: string): string => {
            switch (lvl) {
                case 'fresher':
                    return `This is a FRESHER / entry-level candidate with NO prior work experience.
- Do NOT mention years of experience (no "0 years", no "1+ years").
- Write as if this is a new graduate or someone just starting their career.
- Use natural openings like "Recent ${jobTitle} graduate...", "Aspiring ${jobTitle}...", "Entry-level ${jobTitle}...", or similar.
- Focus on: education foundation, transferable skills, eagerness to learn, profession-specific knowledge.
- Sound motivated and profession-aware, but NOT experienced.`;

                case 'junior':
                    return `This is a JUNIOR-level professional with 1-2 years of experience.
- Write for someone early in their career.
- Focus on: executing assigned tasks, learning, supporting team members, developing foundational skills.
- Use phrases like "Developing expertise in...", "Supporting...", "Building knowledge of..."
- Do NOT sound senior or leadership-focused.
- Mention ~1-2 years of experience naturally.`;

                case 'mid':
                    return `This is a MID-LEVEL professional with 3-6 years of experience.
- Write for someone with solid independent work experience.
- Focus on: owning responsibilities, delivering results independently, contributing to team objectives.
- Use phrases like "Experienced...", "Skilled in...", "Proven ability to..."
- Mention 3-6 years of experience naturally.
- Balance hands-on work with some collaboration.`;

                case 'senior':
                    return `This is a SENIOR-level professional with 7-10 years of experience.
- Write for someone with deep expertise and leadership experience.
- Focus on: leading projects, mentoring juniors, strategic contributions, architecture/design decisions.
- Use phrases like "Senior...", "Expert in...", "Led...", "Mentored..."
- Mention 7+ years of experience naturally.
- Sound authoritative and experienced.`;

                case 'manager':
                    return `This is a MANAGER-level professional with team leadership experience.
- Write for someone managing teams/processes.
- Focus on: team coordination, process improvement, stakeholder management, driving team performance.
- Use phrases like "Managed...", "Led team of...", "Coordinated...", "Drove..."
- Sound like a people and process leader.`;

                case 'director':
                    return `This is a DIRECTOR / EXECUTIVE-level professional with 10+ years of experience.
- Write for someone in strategic leadership.
- Focus on: org-wide strategy, executive decisions, cross-functional leadership, business impact.
- Use phrases like "Executive...", "Strategic...", "Drove organizational...", "Led cross-functional..."
- Sound like a strategic leader with broad scope.`;

                default:
                    return `Write a professional summary for a ${jobTitle}.`;
            }
        };

        const levelInstruction = getLevelInstruction(effectiveLevel);

        const startingInstruction = isFresher
            ? `The summary should naturally begin WITHOUT mentioning years of experience. Use natural fresher openings.`
            : `The summary should naturally begin with the actual job title, e.g.: "${jobTitle} with ${years}+ years of experience..."`;

        const contentPriority = isFresher
            ? `Prioritize ONLY the following information:
1. Job title + education/fresher status
2. 2–3 core responsibilities specific to the profession
3. One relevant professional skill or work area, only if space allows

Do NOT mention years of experience.
Do NOT mention "0 years".
Focus on: education foundation, transferable skills, eagerness to learn, and profession-specific knowledge areas.`
            : `Prioritize ONLY the following information:
1. Job title + years of experience + level-appropriate framing
2. 2–3 core responsibilities specific to the profession
3. One relevant professional skill or work area, only if space allows

Do NOT try to mention every responsibility.
Do NOT add long lists of soft skills.
Do NOT add unnecessary concluding sentences.`;

        const prompt = `You are an experienced professional resume writer with deep knowledge across many industries.

Write a concise professional CV summary for this person.

================================================================
PERSON'S DETAILS
================================================================
Job Title: ${jobTitle}
Experience Level: ${effectiveLevel.toUpperCase()}
Years of Experience: ${years}
Company: ${company || '(not provided)'}
${keySkills ? `Skills listed: ${keySkills}` : ''}

================================================================
⚠️ CRITICAL — EXPERIENCE LEVEL: ${effectiveLevel.toUpperCase()}
================================================================
${levelInstruction}

The summary MUST match this experience level. If you write a junior-level summary for a senior candidate (or vice versa), the response will be rejected.

================================================================
YOUR TASK
================================================================
For the EXACT job title "${jobTitle}", use your own knowledge of that profession to identify a few widely recognized day-to-day responsibilities, activities, or professional areas.

Then write a 40-45 word CV summary that reflects the ${effectiveLevel.toUpperCase()} level.

================================================================
LENGTH REQUIREMENT — ABSOLUTE AND CRITICAL
================================================================
Your final answer MUST be between 40 and 45 words.
45 words is the ABSOLUTE MAXIMUM. Never exceed 45 words.
Aim for approximately 42 words.

Prefer exactly 2 sentences. Use a 3rd sentence ONLY if absolutely necessary and still within the 45-word limit.

The 4000-token generation budget is NOT a target length. It is only the maximum generation budget. The final CV summary itself must contain only 40–45 words.

Before producing the final answer, silently ensure that the summary is within the 40–45 word limit. Do NOT show the counting, the word count, or your reasoning.

================================================================
CONTENT PRIORITY (because the summary is extremely short)
================================================================
${contentPriority}

Concrete profession-specific responsibilities ALWAYS take priority over generic soft skills.

================================================================
STARTING NATURALLY
================================================================
${startingInstruction}

Preserve the user's job title EXACTLY as written: "${jobTitle}".
Do NOT change its capitalization. Do NOT rewrite it. Do NOT misspell it.

================================================================
PROFESSION-SPECIFIC REQUIREMENT
================================================================
The summary MUST be specific to "${jobTitle}".

Think about:
- What does someone with this exact job title actually do day-to-day?
- What are the 2–3 most important core tasks or professional areas?
- What terminology is commonly used in this profession?

Use those specific responsibilities in the summary.

DO NOT use generic filler such as:
- "Strong communication and teamwork"
- "problem-solving and adaptability"
- "time-management and leadership"
- "contributing to organizational goals"
- "driving organizational success"
- "committed to professional growth"
- "delivering exceptional results"
- "highly motivated professional"
- "results-driven professional"
- "Dedicated to delivering exceptional results"
- "Proven ability"
- "Passionate professional"
- "Committed to excellence"
- "handling core responsibilities of the role"
- "applying relevant knowledge"

When a specific responsibility of the profession can be stated instead, ALWAYS state the specific responsibility.

================================================================
SPELLING REQUIREMENT
================================================================
- Spell ALL words correctly.
- Double-check the job title spelling: "${jobTitle}"
- Common typos to AVOID: "machanic" → "mechanic", "enginear" → "engineer", "developper" → "developer"
- Do NOT invent alternative spellings.

================================================================
ACCURACY RULES
================================================================
Only use information that is:
1. Provided by the user (job title, years, skills, company), OR
2. A broadly recognized responsibility naturally associated with the profession.

Broadly recognized responsibilities ARE allowed.

Do NOT invent HIGHLY SPECIFIC unsupported claims such as:
- Named certifications
- Named frameworks or standards
- Specific software or technologies
- Specific employers, companies, or clients
- Specific achievements, metrics, or percentages
- Specific qualifications or regulatory credentials

General profession knowledge is allowed. Highly specific invented details are NOT allowed.

================================================================
OUTPUT FORMAT
================================================================
- Return ONLY the final CV summary.
- Do NOT prefix with "Summary:", "Here is", or any heading.
- Do NOT include analysis, notes, explanations, reasoning, or word counts.
- Do NOT use bullets or numbered lists.
- Do NOT number words, tokens, or phrases.
- Do NOT show your drafting process.
- End with a complete sentence and proper punctuation.
- The final answer must be 45 words or fewer.

================================================================
OUTPUT
================================================================
Write ONLY the final CV summary now. Nothing else.
`;

        try {
            const result = await this.aiManager.generate(prompt, providerName, {
                temperature: 0.7,
                maxTokens: 4000,
                retryCount: 2,
                timeout: 15000
            });
            return this.cleanSummary(result, jobTitle, years, isFresher);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('AI Summary generation failed:', errorMessage);

            if (errorMessage.includes('insufficient') || errorMessage.includes('402')) {
                console.warn('⚠️ AI credits insufficient. Using fallback summary.');
            }

            return this.generateFallbackSummary(jobTitle, company, years, profession, isFresher, effectiveLevel);
        }
    }

    // ============================================
    // ✅ cleanSummary — basic cleanup (fresher-aware)
    // ============================================
    private cleanSummary(text: string, jobTitle: string, years: number, isFresher: boolean = false): string {
        let cleaned = text.trim();

        cleaned = cleaned.replace(/^["'`]+|["'`]+$/g, '').trim();

        cleaned = cleaned.replace(/^(here is|here's|summary:?|professional summary:?)\s*/i, '').trim();

        cleaned = cleaned.replace(/:/g, ' ');

        cleaned = cleaned.replace(/\s+/g, ' ');
        cleaned = cleaned.replace(/[,;]\s*[,;]/g, ',');
        cleaned = cleaned.replace(/\.\s*\./g, '.');
        cleaned = cleaned.replace(/\s+([.,!?;])/g, '$1');

        const TYPO_FIXES: Record<string, string> = {
            'machanic': 'mechanic',
            'mecanic': 'mechanic',
            'mehanic': 'mechanic',
            'machanics': 'mechanics',
            'enginear': 'engineer',
            'enginer': 'engineer',
            'enginears': 'engineers',
            'developper': 'developer',
            'developor': 'developer',
            'accountent': 'accountant',
            'nurce': 'nurse',
            'teecher': 'teacher',
            'professer': 'professor',
            'analist': 'analyst',
            'specialest': 'specialist',
            'managment': 'management',
            'recieve': 'receive',
            'seperate': 'separate',
            'occured': 'occurred',
        };

        for (const [typo, correct] of Object.entries(TYPO_FIXES)) {
            const regex = new RegExp(`\\b${typo}\\b`, 'gi');
            cleaned = cleaned.replace(regex, (match) => {
                if (match === match.toUpperCase()) return correct.toUpperCase();
                if (match[0] === match[0].toUpperCase()) {
                    return correct.charAt(0).toUpperCase() + correct.slice(1);
                }
                return correct;
            });
        }

        if (jobTitle && jobTitle.trim()) {
            const properlyCapitalized = jobTitle
                .split(' ')
                .map((word, index) => {
                    if (word.length === 0) return word;
                    const lowerWords = ['of', 'and', 'the', 'in', 'on', 'at', 'for', 'to', 'a', 'an'];
                    if (index > 0 && lowerWords.includes(word.toLowerCase())) {
                        return word.toLowerCase();
                    }
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                })
                .join(' ');

            const finalTitle = properlyCapitalized.charAt(0).toUpperCase() + properlyCapitalized.slice(1);

            const titleLower = jobTitle.toLowerCase();
            const cleanedLower = cleaned.toLowerCase();

            let searchIndex = 0;
            let result = '';
            let lastIndex = 0;

            while ((searchIndex = cleanedLower.indexOf(titleLower, searchIndex)) !== -1) {
                result += cleaned.substring(lastIndex, searchIndex);
                result += finalTitle;
                searchIndex += titleLower.length;
                lastIndex = searchIndex;
            }
            result += cleaned.substring(lastIndex);
            cleaned = result;
        }

        if (!cleaned.toLowerCase().includes(jobTitle.toLowerCase())) {
            if (isFresher) {
                cleaned = `Recent ${jobTitle} graduate. ${cleaned}`;
            } else {
                cleaned = `${jobTitle} with ${years}+ years of experience. ${cleaned}`;
            }
        }

        if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
            cleaned = cleaned + '.';
        }

        const words = cleaned.split(' ').filter(w => w.length > 0);
        const wordCount = words.length;

        if (wordCount < 30) {
            console.warn(`⚠️ AI summary too short (${wordCount} words). Marking as failed.`);
            throw new Error(`AI summary too short: ${wordCount} words (minimum 30 required)`);
        }

        if (wordCount > 130) {
            cleaned = words.slice(0, 125).join(' ') + '.';
        }

        return cleaned;
    }

    // ============================================
    // ✅ Fallback (Fresher + Level aware)
    // ============================================
    private generateFallbackSummary(
        jobTitle: string,
        company: string | undefined,
        years: number,
        profession: string,
        isFresher: boolean = false,
        level: string = 'mid'
    ): string {
        const companyText = company ? ` at ${company}` : '';

        if (isFresher || level === 'fresher') {
            return `Recent ${jobTitle} graduate with foundational knowledge in the field. Skilled in applying academic training to practical tasks, supporting team objectives, and developing profession-specific expertise. Committed to continuous learning and professional growth.`;
        }

        const yearText = years > 0 ? `${years}+ years of experience` : 'proven experience';

        if (level === 'junior') {
            return `${jobTitle} with ${yearText}${companyText}. Developing expertise in core responsibilities, supporting team objectives, and building profession-specific knowledge. Committed to continuous learning and professional development.`;
        }
        if (level === 'senior' || level === 'manager' || level === 'director') {
            return `${jobTitle} with ${yearText}${companyText}. Expert in leading initiatives, mentoring teams, and driving strategic outcomes. Proven ability to deliver results and contribute to organizational success.`;
        }

        return `${jobTitle} with ${yearText}${companyText}. Skilled in handling core responsibilities of the role, coordinating with teams, and applying relevant knowledge to deliver consistent work. Committed to professional growth and contributing effectively to organizational goals.`;
    }
}