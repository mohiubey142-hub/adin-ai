// services/aiExperienceGenerator.ts
// ============================================
// AI EXPERIENCE GENERATOR (Groq, Level-Aware)
// ============================================
//
// ✅ KEY PRIORITY: EXPERIENCE → PROJECT → ACHIEVEMENT → COVER_LETTER → SUMMARY
// ✅ Generates EXACTLY 5 bullet points
// ✅ Each bullet starts with "• "
// ✅ Level-aware (fresher/junior/mid/senior/manager/director)
// ✅ 10-15 words per bullet
// ✅ ATS-friendly
// ✅ NEW: Profession-aware (profession-specific bullets)
// ============================================

import { AIProviderManager } from './aiProvider';
import { GroqProvider } from './providers/groqProvider';
import { getKeysForFeature } from './providers/groqKeyManager';

export interface ExperienceParams {
    title: string;
    company: string;
    description: string;
    level: string;
    years?: number;
    profession?: string;  // ✅ NEW: profession-specific bullets ke liye
}

export class AIExperienceGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();

        const keys = getKeysForFeature('EXPERIENCE');
        if (keys.length > 0 && !this.aiManager.getProviders().includes('groq-experience')) {
            this.aiManager.registerProvider(
                'groq-experience',
                new GroqProvider(keys)
            );
            this.aiManager.setDefaultProvider('groq-experience');
            console.log(
                `✅ AIExperienceGenerator: registered groq-experience with keys [${keys
                    .map(k => k.source)
                    .join(' → ')}]`
            );
        }
    }

    private getLevelInstruction(level: string, title: string): string {
        switch (level) {
            case 'fresher':
                return `This is a FRESHER / entry-level candidate with NO prior work experience.
- Write bullets as if this is a new graduate or someone just starting their career.
- Focus on: academic foundation, foundational skills, eagerness to learn, supporting team tasks.
- Use verbs like: Assisted, Learned, Supported, Contributed, Developed knowledge of...
- Do NOT sound experienced or senior.`;

            case 'junior':
                return `This is a JUNIOR-level professional with 1-2 years of experience.
- Write bullets for someone early in their career.
- Focus on: executing assigned tasks, learning, supporting team members, developing skills.
- Use verbs like: Assisted, Supported, Contributed, Developed, Participated in...
- Mention foundational, hands-on tasks.
- Do NOT sound senior or leadership-focused.`;

            case 'mid':
                return `This is a MID-LEVEL professional with 3-6 years of experience.
- Write bullets for someone with solid independent work experience.
- Focus on: owning responsibilities, delivering results independently, contributing to team objectives.
- Use verbs like: Managed, Developed, Designed, Implemented, Delivered, Owned...
- Balance hands-on work with some collaboration.
- Sound competent and independent.`;

            case 'senior':
                return `This is a SENIOR-level professional with 7+ years of experience.
- Write bullets for someone with deep expertise and leadership experience.
- Focus on: leading projects, mentoring juniors, strategic contributions, architecture/design decisions.
- Use verbs like: Led, Architected, Mentored, Drove, Established, Scaled...
- Sound authoritative and experienced.
- Include leadership/mentoring responsibilities.`;

            case 'manager':
                return `This is a MANAGER-level professional with team leadership experience.
- Write bullets for someone managing teams/processes.
- Focus on: team coordination, process improvement, stakeholder management, driving team performance.
- Use verbs like: Managed, Led team of..., Coordinated, Drove, Established...
- Sound like a people and process leader.`;

            case 'director':
                return `This is a DIRECTOR / EXECUTIVE-level professional with 10+ years of experience.
- Write bullets for someone in strategic leadership.
- Focus on: org-wide strategy, executive decisions, cross-functional leadership, business impact.
- Use verbs like: Spearheaded, Drove organizational..., Led cross-functional..., Established...
- Sound like a strategic leader with broad scope.`;

            default:
                return `Write bullets appropriate for a ${title} role.`;
        }
    }

    // ============================================
    // ✅ NEW: Profession-specific examples
    // ============================================
    private getProfessionExamples(profession: string, level: string): string {
        const examples: Record<string, string> = {
            softwareEngineer: `Examples of PROFESSION-SPECIFIC bullets for "Software Engineer":
- "Assisted senior engineers in developing REST APIs using Java and Spring Boot"
- "Wrote JUnit and Mockito test cases to verify service layer functionality"
- "Supported debugging of production issues using logs, stack traces, and debuggers"
- "Learned Git workflows, performed feature-branch commits, and resolved merge conflicts"
- "Contributed to code reviews by identifying edge cases and suggesting optimizations"`,

            developer: `Examples of PROFESSION-SPECIFIC bullets for "Developer":
- "Assisted in building responsive web interfaces using React and TypeScript"
- "Wrote unit tests with Jest to verify component behavior and edge cases"
- "Supported debugging of UI issues using browser DevTools and React Profiler"
- "Learned Git workflows, performed feature-branch commits, and resolved merge conflicts"
- "Contributed to code reviews by suggesting component reusability improvements"`,

            doctor: `Examples of PROFESSION-SPECIFIC bullets for "Doctor":
- "Assisted senior physicians in diagnosing patients and ordering lab tests"
- "Wrote patient progress notes and discharge summaries in the EMR system"
- "Supported clinical rounds by presenting patient cases and treatment plans"
- "Learned hospital protocols, performed patient intakes, and coordinated with nursing staff"
- "Contributed to case discussions by reviewing imaging and lab results"`,

            teacher: `Examples of PROFESSION-SPECIFIC bullets for "Teacher":
- "Assisted senior teachers in delivering lessons and managing classroom activities"
- "Wrote lesson plans and assessment rubrics aligned with curriculum standards"
- "Supported students during individual and group learning sessions"
- "Learned classroom management techniques and educational technology tools"
- "Contributed to parent-teacher meetings and student progress discussions"`,

            accountant: `Examples of PROFESSION-SPECIFIC bullets for "Accountant":
- "Assisted senior accountants in preparing financial statements and reconciliations"
- "Wrote journal entries and maintained general ledger accounts in QuickBooks"
- "Supported month-end closing by verifying transactions and resolving discrepancies"
- "Learned tax filing procedures and prepared supporting documentation for audits"
- "Contributed to budget variance analysis and expense report reviews"`,

            sales: `Examples of PROFESSION-SPECIFIC bullets for "Sales":
- "Assisted senior sales reps in prospecting leads and scheduling client demos"
- "Wrote follow-up emails and maintained CRM records in Salesforce"
- "Supported pipeline management by tracking deal stages and updating forecasts"
- "Learned negotiation techniques and closing strategies through shadowing"
- "Contributed to quarterly sales reports and customer feedback analysis"`,

            designer: `Examples of PROFESSION-SPECIFIC bullets for "Designer":
- "Assisted senior designers in creating wireframes and high-fidelity mockups in Figma"
- "Wrote design specifications and maintained component libraries for consistency"
- "Supported user research sessions and synthesized feedback into design iterations"
- "Learned design systems, typography principles, and accessibility best practices"
- "Contributed to design reviews by presenting concepts and incorporating feedback"`,

            marketing: `Examples of PROFESSION-SPECIFIC bullets for "Marketing":
- "Assisted in planning social media campaigns and creating content calendars"
- "Wrote copy for email newsletters, landing pages, and ad creatives"
- "Supported SEO efforts by conducting keyword research and optimizing meta tags"
- "Learned Google Analytics and tracked campaign performance metrics"
- "Contributed to marketing reports and A/B testing analysis"`,

            hr: `Examples of PROFESSION-SPECIFIC bullets for "HR":
- "Assisted in screening resumes and scheduling interviews for open positions"
- "Wrote job descriptions and posted openings on multiple job boards"
- "Supported onboarding by preparing welcome kits and coordinating orientation"
- "Learned HRIS systems and maintained accurate employee records"
- "Contributed to employee engagement surveys and feedback analysis"`,

            general: `Examples of PROFESSION-SPECIFIC bullets:
- "Assisted senior team members with daily tasks and project deliverables"
- "Wrote reports and maintained accurate documentation for team records"
- "Supported team operations by coordinating schedules and tracking progress"
- "Learned industry-specific tools and workflows through hands-on training"
- "Contributed to team meetings by sharing observations and asking questions"`
        };

        return examples[profession] || examples.general;
    }

    async generate(params: ExperienceParams, providerName?: string): Promise<string[]> {
        const { title, company, description, level, years, profession } = params;

        const levelInstruction = this.getLevelInstruction(level, title);
        const yearsText = years !== undefined && years > 0 ? `${years}+ years of experience` : '';
        const professionExamples = this.getProfessionExamples(profession || 'general', level);

        const prompt = `You are an experienced professional resume writer.

Generate EXACTLY 5 bullet points for this work experience.

================================================================
WORK EXPERIENCE DETAILS
================================================================
Job Title: ${title}
Profession: ${profession || 'General'}
Company: ${company}
Experience Level: ${level.toUpperCase()}
${yearsText ? `Years of Experience: ${yearsText}` : ''}
Current Description: ${description || '(not provided)'}

================================================================
⚠️ CRITICAL — EXPERIENCE LEVEL: ${level.toUpperCase()}
================================================================
${levelInstruction}

The bullet points MUST match this experience level. If you write senior-level bullets for a junior candidate (or vice versa), the response will be rejected.

================================================================
YOUR TASK
================================================================
Write EXACTLY 5 professional bullet points that describe what someone with this exact job title does day-to-day AT THIS LEVEL.

Each bullet point should:
1. Start with a strong action verb appropriate for the level
2. Be 10-15 words long
3. Focus on profession-specific responsibilities
4. Be ATS-friendly (use relevant keywords naturally)
5. Sound professional and realistic for the ${level} level

================================================================
COUNT REQUIREMENT — ABSOLUTE AND CRITICAL
================================================================
You MUST return EXACTLY 5 bullet points.
NOT 4, NOT 6 — EXACTLY 5.

================================================================
BULLET MARKER REQUIREMENT
================================================================
Each bullet MUST start with "• " (bullet character + space).
Example format:
• Led development of REST APIs using Node.js and Express
• Collaborated with cross-functional teams to deliver features

================================================================
DO NOT USE THESE GENERIC PHRASES
================================================================
- "Delivered high-quality results"
- "Collaborated with cross-functional teams" (unless genuinely specific)
- "Achieved project milestones"
- "Maintained professional standards"
- "Worked effectively in a team"
- "Demonstrated strong communication skills"
- "Committed to excellence"
- "Results-driven professional"
- "Assisted senior team members with tasks" (too generic)
- "Wrote reports to verify functionality" (too generic)
- "Supported daily operations" (too generic)
- "Learned workflows and performed duties" (too generic)
- "Contributed to meetings and discussions" (too generic)

Instead, write SPECIFIC, profession-relevant responsibilities for the ${level} level.

================================================================
PROFESSION-SPECIFIC REQUIREMENT — CRITICAL
================================================================
For the EXACT job title "${title}" at the ${level} level, you MUST:

1. Write bullets that ONLY apply to "${title}" — NOT any other profession.
2. Include profession-specific TOOLS, TECHNOLOGIES, and TERMINOLOGY.
3. If a bullet could apply to ANY office job, DELETE IT and rewrite.

${professionExamples}

NOW write bullets for "${title}" — be SPECIFIC to this profession.

================================================================
ACCURACY RULES
================================================================
Only use information that is:
1. Provided by the user (job title, company, level), OR
2. A broadly recognized responsibility naturally associated with the profession.

Do NOT invent:
- Specific certifications
- Named frameworks or standards
- Specific software (unless widely known for this role)
- Specific employers, companies, or clients
- Specific achievements, metrics, or percentages
- Specific qualifications

================================================================
OUTPUT FORMAT
================================================================
Return ONLY a JSON array of EXACTLY 5 strings.
Each string MUST start with "• ".
No preamble, no explanation, no numbering.
Example:
["• Assisted senior engineers in developing REST APIs using Java and Spring Boot", "• Wrote JUnit and Mockito test cases to verify service layer functionality", "• Supported debugging of production issues using logs and stack traces", "• Learned Git workflows, performed feature-branch commits, and resolved merge conflicts", "• Contributed to code reviews by identifying edge cases and suggesting optimizations"]

================================================================
OUTPUT
================================================================
Return ONLY the JSON array with EXACTLY 5 bullet points. Nothing else.`;

        try {
            const result = await this.aiManager.generateJSON<string[]>(prompt, providerName, {
                temperature: 0.7,
                maxTokens: 2000,
                retryCount: 2,
                timeout: 15000
            });

            let bullets = Array.isArray(result) ? result : [];
            bullets = bullets.slice(0, 5);

            bullets = bullets.map((b: any) => {
                let clean = String(b).trim();
                clean = clean.replace(/^[•\-*\d.)\s]+/, '').trim();
                if (clean && !/[.!?]$/.test(clean)) {
                    clean = clean + '.';
                }
                return `• ${clean}`;
            });

            const fallbackBullets = [
                `• Contributed to ${title} responsibilities at ${company}.`,
                `• Supported daily operations and team objectives.`,
                `• Applied professional knowledge to deliver consistent results.`,
                `• Collaborated with team members to achieve shared goals.`,
                `• Maintained high standards of quality and professionalism.`
            ];

            let fallbackIndex = 0;
            while (bullets.length < 5 && fallbackIndex < fallbackBullets.length) {
                bullets.push(fallbackBullets[fallbackIndex]);
                fallbackIndex++;
            }

            console.log(`📊 AIExperienceGenerator: returned ${bullets.length} bullets (level: ${level}, profession: ${profession || 'general'})`);
            return bullets;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('AI Experience generation failed:', errorMessage);

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