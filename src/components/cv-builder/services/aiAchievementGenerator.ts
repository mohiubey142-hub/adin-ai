// services/aiAchievementGenerator.ts
// ============================================
// AI ACHIEVEMENT GENERATOR (Groq)
// ============================================
//
// ✅ KEY PRIORITY: ACHIEVEMENT → EXPERIENCE → PROJECT → COVER_LETTER → SUMMARY
// ✅ Generates EXACTLY 3 bullet points
// ✅ Each bullet starts with "• "
// ✅ Uses achievement title + date + shortDescription (user context)
// ✅ STRICT: No fake numbers, no fake details, no hallucination
// ✅ Only user-provided information (or generic professional language)
// ✅ 10-15 words per bullet
// ✅ ATS-friendly
// ============================================

import { AIProviderManager } from './aiProvider';
import { GroqProvider } from './providers/groqProvider';           // ✅
import { getKeysForFeature } from './providers/groqKeyManager';   // ✅

export interface AchievementParams {
    title: string;
    date?: string;
    details?: string;
}

export class AIAchievementGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();

        // ✅ Register feature-specific Groq provider (ACHIEVEMENT priority)
        const keys = getKeysForFeature('ACHIEVEMENT');
        if (keys.length > 0 && !this.aiManager.getProviders().includes('groq-achievement')) {
            this.aiManager.registerProvider(
                'groq-achievement',
                new GroqProvider(keys)
            );
            this.aiManager.setDefaultProvider('groq-achievement');
            console.log(
                `✅ AIAchievementGenerator: registered groq-achievement with keys [${keys
                    .map(k => k.source)
                    .join(' → ')}]`
            );
        }
    }

    async generate(params: AchievementParams, providerName?: string): Promise<string[]> {
        const { title, date, details } = params;

        const hasDetails = details && details.trim().length > 0;
        const hasDate = date && date.trim().length > 0;

        const prompt = `You are an experienced professional resume writer.

Generate EXACTLY 3 professional bullet points for this achievement.

================================================================
ACHIEVEMENT DETAILS (ALL INFORMATION USER PROVIDED)
================================================================
Achievement Title: ${title}
Achievement Date: ${hasDate ? date : '(not provided)'}
User's Details: ${hasDetails ? details : '(NOT PROVIDED — DO NOT INVENT)'}

================================================================
⚠️ CRITICAL — READ THIS FIRST
================================================================
You are a STRICT writer. You may ONLY use:
1. The achievement title (verbatim)
2. The date (if provided)
3. The user's details (if provided — rephrase professionally)
4. Generic professional language (ONLY when user provides nothing)

You MUST NOT add any information that is NOT in the three fields above.

${!hasDetails ? `⚠️ THE USER PROVIDED NO DETAILS. This means you have ONLY:
- The title: "${title}"
- The date: ${hasDate ? date : '(no date)'}

You MUST write 3 bullets using ONLY the title and date (if provided).
Use generic, professional recognition language.
DO NOT invent any specific details, responsibilities, projects, teams, or context.` : `✅ The user HAS provided details. You MUST rephrase the user's details into professional CV bullets. Do NOT add any context, teams, projects, methodology, or details NOT in the user's details above.`}

================================================================
YOUR TASK
================================================================
Write EXACTLY 3 professional CV bullet points that describe this achievement.

Each bullet point should:
1. Start with a strong recognition verb (Recognized, Awarded, Honored, Earned, Achieved, Selected, etc.)
2. Be 10-15 words long
3. Be ATS-friendly
4. Include the date naturally ONLY in the first bullet (if provided)
5. Rephrase user's details professionally (if provided)
6. Use generic professional language (if user provided nothing)

================================================================
COUNT REQUIREMENT — ABSOLUTE AND CRITICAL
================================================================
You MUST return EXACTLY 3 bullet points.
NOT 2, NOT 4 — EXACTLY 3.

================================================================
BULLET MARKER REQUIREMENT
================================================================
Each bullet MUST start with "• " (bullet character + space).
Example format:
• Recognized as Employee of the Month in March 2026 for outstanding performance
• Consistently delivered high-quality work and exceeded expectations
• Demonstrated reliability and dedication to team objectives

================================================================
STRICTLY FORBIDDEN — DO NOT INVENT ANYTHING
================================================================
Even if it SOUNDS professional, do NOT add any of these UNLESS they are literally in the user's input above:

FORBIDDEN PHRASES (unless user provided):
- "doctoral research" / "doctoral program" / "PhD" / "academic research"
- "interdisciplinary teams" / "cross-functional teams" / "diverse teams"
- "strategic planning" / "strategic initiatives"
- "execution excellence"
- "innovative problem-solving" / "innovative solutions"
- "rigorous methodology" / "rigorous analysis" / "meticulous methods"
- "comprehensive outcomes" / "comprehensive results" / "comprehensive deliverables"
- "measurable results" / "quantifiable impact"
- "guiding teams" / "leading teams" / "managing teams"
- "delivering projects" / "leading projects"
- "data-driven insights"
- "stakeholder management"

FORBIDDEN NUMBERS (unless user provided):
- Any percentage (e.g., "35%", "40%")
- Any count (e.g., "10+ projects", "5 teams")
- Any dollar amount
- Any metric

FORBIDDEN CONTEXT (unless user provided):
- Any industry-specific detail
- Any specific responsibility
- Any project name
- Any team structure
- Any methodology or framework
- Any outcome or result

================================================================
GOOD vs BAD EXAMPLES
================================================================

USER INPUT:
Title: Employee of the Month
Date: March 2026
Details: (NOT PROVIDED)

❌ BAD OUTPUT (invents fake details):
• Earned Employee of the Month in March 2026 through strategic planning and execution excellence.
• Recognized for leading interdisciplinary teams delivering comprehensive doctoral research outcomes.
• Honored for applying rigorous methodology and innovative problem-solving throughout doctoral program.

✅ GOOD OUTPUT (only uses title + date + generic language):
• Recognized as Employee of the Month in March 2026 for outstanding performance.
• Consistently demonstrated dedication and commitment to professional excellence.
• Acknowledged for reliability, teamwork, and consistent high-quality contributions.

---

USER INPUT:
Title: Best Developer Award
Date: Dec 2024
Details: Recognized for consistently delivering high-quality code.

❌ BAD OUTPUT (invents extra details):
• Earned Best Developer Award in Dec 2024 through innovative problem-solving and strategic planning.

✅ GOOD OUTPUT (only uses user's details):
• Recognized as Best Developer Award recipient in Dec 2024 for consistently delivering high-quality code.
• Acknowledged for strong technical contribution and professional consistency.
• Demonstrated commitment to quality and excellence in software development.

================================================================
USER'S ACTUAL NUMBERS — PRESERVE THEM
================================================================
If the user provided actual numbers/details, preserve and professionally phrase them.

Example:
User: "Increased monthly sales by 25% through customer follow-ups."
AI: "• Increased monthly sales by 25% through consistent customer follow-up."

But if user provided NO numbers, do NOT add any.

================================================================
DATE HANDLING
================================================================
If a date is provided:
- Include it naturally in the FIRST bullet ONLY
- Do NOT repeat the date in every bullet

If no date is provided:
- Do not mention any date

================================================================
OUTPUT FORMAT
================================================================
Return ONLY a JSON array of EXACTLY 3 strings.
Each string MUST start with "• ".
No preamble, no explanation, no numbering.

Example of correct output:
["• Recognized as Employee of the Month in March 2026 for outstanding performance", "• Consistently demonstrated dedication and commitment to professional excellence", "• Acknowledged for reliability, teamwork, and consistent high-quality contributions"]

================================================================
OUTPUT
================================================================
Return ONLY the JSON array with EXACTLY 3 bullet points. Nothing else.`;

        try {
            const result = await this.aiManager.generateJSON<string[]>(prompt, providerName, {
                temperature: 0.5,
                maxTokens: 1500,
                retryCount: 2,
                timeout: 15000
            });

            let bullets = Array.isArray(result) ? result : [];
            bullets = bullets.slice(0, 3);

            bullets = bullets.map((b: any) => {
                let clean = String(b).trim();
                clean = clean.replace(/^[•\-*\d.)\s]+/, '').trim();
                if (clean && !/[.!?]$/.test(clean)) {
                    clean = clean + '.';
                }
                return `• ${clean}`;
            });

            const fallbackBullets = [
                `• Recognized as ${title}${hasDate ? ` in ${date}` : ''} for professional excellence`,
                `• Consistently delivered high-quality work and exceeded expectations`,
                `• Demonstrated reliability and dedication to team objectives`
            ];

            let fallbackIndex = 0;
            while (bullets.length < 3 && fallbackIndex < fallbackBullets.length) {
                bullets.push(fallbackBullets[fallbackIndex]);
                fallbackIndex++;
            }

            console.log(`📊 AIAchievementGenerator: returned ${bullets.length} bullets`);
            return bullets;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('AI Achievement generation failed:', errorMessage);

            return [
                `• Recognized as ${title}${hasDate ? ` in ${date}` : ''} for professional excellence`,
                '• Consistently delivered high-quality work and exceeded expectations',
                '• Demonstrated reliability and dedication to team objectives'
            ];
        }
    }
}