// services/aiProjectGenerator.ts
// ============================================
// AI PROJECT GENERATOR (Groq) — SOURCE-GROUNDED + BALANCED BULLETS (v5)
// ============================================
//
// ✅ KEY PRIORITY: PROJECT → EXPERIENCE → ACHIEVEMENT → COVER_LETTER → SUMMARY
//
// Grounding model
//   Project Details  = PRIMARY SOURCE of facts (what the user did)
//   Project Name     = label only
//   Technologies     = METADATA ONLY, never evidence of implementation
//
// Quality model (v5)
//   Target: 5 separate, concise bullets (normally 12–22 words, max 28),
//   each with ONE main idea. Never "3 normal + 2 giant" bullets.
// ============================================

import { AIProviderManager } from './aiProvider';
import { GroqProvider } from './providers/groqProvider';           // ✅
import { getKeysForFeature } from './providers/groqKeyManager';   // ✅;

export interface ProjectParams {
    projectName: string;
    tech: string;
    description?: string;
}

const GENERATOR_VERSION = 'v5';
const TARGET_BULLETS = 5;
const MIN_ACCEPTABLE = 3;

// Length guard (words)
const PREFERRED_MIN_WORDS = 12;
const PREFERRED_MAX_WORDS = 22;
const MAX_WORDS = 28;
const MERGE_MAX_WORDS = 24;
const LIST_GROUP_WORDS = 16;
const SOURCE_LIST_GROUP_WORDS = 10;

const STOPWORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'for', 'to', 'of', 'in',
    'on', 'at', 'by', 'with', 'from', 'as', 'into', 'through',
    'using', 'used', 'via', 'within', 'across', 'over', 'under',
    'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'i', 'my', 'me', 'we', 'our', 'their', 'his', 'her',
    'this', 'that', 'these', 'those', 'it', 'its', 'which', 'who',
    'has', 'have', 'had', 'can', 'will',
    'also', 'then', 'when', 'while',
    'developed', 'built', 'created', 'implemented', 'added',
    'integrated', 'worked', 'connected',
    'developing', 'building', 'creating', 'implementing', 'adding',
    'integrating', 'connecting',
]);

const NEUTRAL_WORDS = new Set(['platform', 'application', 'app', 'project']);

const FILLER_PATTERNS: RegExp[] = [
    /^\s*project\s*:/i,
    /\btechnolog(?:y|ies)\s+(?:used|include|includes|stack)\b/i,
    /\bprovided by the user\b/i,
    /\brefer to (?:the )?project details\b/i,
    /^\s*(?:worked on|contributed to)\s+(?:the |this )?project\.?\s*$/i,
];

const ACTION_VERBS = [
    'developed', 'built', 'created', 'implemented', 'added', 'designed',
    'connected', 'integrated', 'worked', 'led', 'managed', 'wrote',
    'launched', 'configured', 'deployed', 'tested', 'improved',
    'established', 'delivered', 'engineered', 'automated', 'collaborated',
    'contributed', 'maintained', 'enhanced', 'analyzed', 'analysed',
    'conducted', 'coordinated', 'handled', 'performed', 'prepared',
    'produced', 'provided', 'researched', 'supported', 'trained',
    'utilized', 'utilised', 'generated', 'organized', 'organised',
    'completed', 'applied', 'assisted', 'constructed', 'crafted',
    'drafted', 'executed', 'extended', 'fixed', 'formulated', 'initiated',
    'introduced', 'migrated', 'modeled', 'modelled', 'refactored',
    'resolved', 'reviewed', 'optimized', 'optimised', 'shipped',
    'published', 'ran', 'helped',
];
const ACTION_WORD = `(?:${ACTION_VERBS.join('|')}|[a-z]{4,}ed)`;
const ACTION_BOUNDARY = new RegExp(
    `(?:\\s*,\\s*(?:and\\s+)?|\\s+and\\s+|\\s*;\\s*)(?=${ACTION_WORD}\\b)`,
    'i',
);
const VERB_ONLY = new RegExp(`^${ACTION_WORD}$`, 'i');

export class AIProjectGenerator {
    private aiManager: AIProviderManager;

    constructor() {
        this.aiManager = AIProviderManager.getInstance();

        // ✅ Register feature-specific Groq provider (PROJECT priority)
        const keys = getKeysForFeature('PROJECT');
        if (keys.length > 0 && !this.aiManager.getProviders().includes('groq-project')) {
            this.aiManager.registerProvider(
                'groq-project',
                new GroqProvider(keys)
            );
            this.aiManager.setDefaultProvider('groq-project');
            console.log(
                `✅ AIProjectGenerator: registered groq-project with keys [${keys
                    .map(k => k.source)
                    .join(' → ')}]`
            );
        }
    }

    async generate(params: ProjectParams, providerName?: string): Promise<string[]> {
        const projectName = this.toText(params?.projectName);
        const tech = this.toText(params?.tech);
        const description = this.toText(params?.description);

        // Project Details is OPTIONAL — without it, generate from name + tech.
        if (!description) {
            console.log(`📊 AIProjectGenerator ${GENERATOR_VERSION}: no Project Details — generating from name + tech`);
            return this.generateWithoutDetails(projectName, tech, providerName);
        }

        const techLine = tech || '(none provided)';
        const ctx = { projectName, description, tech };

        try {
            const first = await this.requestBullets(
                this.buildPrompt(projectName, techLine, description, [], [], TARGET_BULLETS),
                providerName,
                ctx,
                2,
            );
            let bullets = first.bullets;
            const tooLong = first.tooLong;

            if (bullets.length > TARGET_BULLETS) {
                bullets = this.balanceToTarget(bullets);
            }

            if (bullets.length < TARGET_BULLETS) {
                try {
                    const second = await this.requestBullets(
                        this.buildPrompt(
                            projectName,
                            techLine,
                            description,
                            bullets,
                            tooLong,
                            TARGET_BULLETS - bullets.length,
                        ),
                        providerName,
                        ctx,
                        1,
                    );
                    bullets = this.removeNearDuplicates([...bullets, ...second.bullets]);
                    if (bullets.length > TARGET_BULLETS) bullets = this.balanceToTarget(bullets);
                } catch (e) {
                    console.warn(
                        `AIProjectGenerator ${GENERATOR_VERSION}: second pass failed:`,
                        e instanceof Error ? e.message : e,
                    );
                }
            }

            if (bullets.length > 0 && bullets.length < TARGET_BULLETS) {
                bullets = this.topUpFromSource(bullets, description);
            }

            bullets = bullets.slice(0, TARGET_BULLETS);

            if (bullets.length > 0) {
                const finalBullets = this.finalizeBullets(bullets);
                console.log(
                    `📊 AIProjectGenerator ${GENERATOR_VERSION}: returned ${finalBullets.length} grounded bullets | word counts: [${finalBullets
                        .map(b => this.wordCount(b))
                        .join(', ')}]`,
                );
                return finalBullets;
            }

            const fallback = this.deriveGroundedFallback(description);
            console.log(`📊 AIProjectGenerator ${GENERATOR_VERSION}: fallback returned ${fallback.length} grounded bullets`);
            return fallback;
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.error('AI Project generation failed:', msg);
            return this.deriveGroundedFallback(description);
        }
    }

    // ------------------------------------------------------------
    // NO-DETAILS MODE (Project Details left empty by the user)
    // Uses Project Name + Technologies only. Stays conservative:
    // no metrics, no invented outcomes, no team/client claims.
    // ------------------------------------------------------------
    private async generateWithoutDetails(
        projectName: string,
        tech: string,
        providerName?: string,
    ): Promise<string[]> {
        if (!projectName && !tech) return [];

        try {
            const prompt = `You are a professional resume bullet writer.
The user did NOT provide Project Details, so you only know:
Project Name: ${projectName || '(none provided)'}
Technologies / Tools Used: ${tech || '(none provided)'}

Write ${TARGET_BULLETS} concise, resume-ready bullets (${PREFERRED_MIN_WORDS}-${PREFERRED_MAX_WORDS} words each, max ${MAX_WORDS}) describing what a typical developer would do building a project like this with these technologies.

RULES
- Each bullet starts with a strong action verb and covers ONE idea.
- Mention only technologies from the list above.
- Keep claims general and plausible for this kind of project.
- DO NOT invent metrics, percentages, user counts, clients, revenue, team size, awards or business impact.
- No two bullets may say the same thing.
- No leading bullet markers or numbering.

Return ONLY a JSON array of strings, no commentary, no markdown fences.`;

            const result = await this.aiManager.generateJSON<string[]>(prompt, providerName, {
                temperature: 0.4,
                maxTokens: 1200,
                retryCount: 2,
                timeout: 15000,
            });

            let bullets = this.normalizeBullets(this.coerceToArray(result))
                .filter(b => !/\d+\s*%/.test(b) && this.wordCount(b) <= MAX_WORDS);
            bullets = this.removeNearDuplicates(bullets).slice(0, TARGET_BULLETS);

            if (bullets.length > 0) {
                return this.finalizeBullets(bullets);
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            console.warn(`AIProjectGenerator ${GENERATOR_VERSION}: no-details generation failed:`, msg);
        }

        return this.basicFallbackWithoutDetails(projectName, tech);
    }

    private basicFallbackWithoutDetails(projectName: string, tech: string): string[] {
        const techs = tech.split(/[,;|/]+/).map(t => t.trim()).filter(Boolean);
        if (!projectName || techs.length === 0) return [];
        const list =
            techs.length === 1
                ? techs[0]
                : `${techs.slice(0, -1).join(', ')} and ${techs[techs.length - 1]}`;
        return this.finalizeBullets([
            `Developed ${projectName} using ${list}`,
            `Built core features of ${projectName} with ${list}`,
            `Designed and implemented the functionality of ${projectName}`,
        ]);
    }

    private async requestBullets(
        prompt: string,
        providerName: string | undefined,
        ctx: { projectName: string; description: string; tech: string },
        retryCount: number,
    ): Promise<{ bullets: string[]; tooLong: string[] }> {
        const result = await this.aiManager.generateJSON<string[]>(prompt, providerName, {
            temperature: 0.3,
            maxTokens: 1800,
            retryCount,
            timeout: 15000,
        });

        const normalized = this.normalizeBullets(this.coerceToArray(result));

        const expanded: string[] = [];
        const tooLong: string[] = [];
        for (const b of normalized) {
            const parts = this.splitLongBullet(b);
            if (parts.length > 1) {
                console.log(
                    `✂️ AIProjectGenerator ${GENERATOR_VERSION}: split ${this.wordCount(b)}-word bullet into ${parts.length} bullets`,
                );
            }
            for (const part of parts) {
                if (this.wordCount(part) > MAX_WORDS) tooLong.push(part);
                else expanded.push(part);
            }
        }

        const kept = this.keepOnlyTraceableBullets(
            expanded,
            ctx.projectName,
            ctx.description,
            ctx.tech,
        );
        return { bullets: this.removeNearDuplicates(kept), tooLong };
    }

    private toText(value: unknown): string {
        if (typeof value === 'string') return value.trim();
        if (Array.isArray(value)) {
            return value
                .filter(v => typeof v === 'string')
                .map(v => (v as string).trim())
                .filter(Boolean)
                .join(', ');
        }
        return '';
    }

    private buildPrompt(
        projectName: string,
        techLine: string,
        detailsLine: string,
        existing: string[],
        tooLong: string[],
        needed: number,
    ): string {
        const alreadyWritten = existing.length
            ? `
================================================================
ALREADY WRITTEN — DO NOT REPEAT OR REPHRASE THESE
================================================================
${existing.map(b => `- ${b}`).join('\n')}

Write ONLY bullets about DIFFERENT facts from Project Details that
are not covered above. If every fact is already covered, return [].
`
            : '';

        const tooLongBlock = tooLong.length
            ? `
================================================================
TOO LONG — REDO CONCISELY
================================================================
These earlier bullets were too long (over ${MAX_WORDS} words):
${tooLong.map(b => `- ${b}`).join('\n')}

Cover their facts again as SEPARATE concise bullets, using ONLY facts
from Project Details, and skip any fact already covered above.
`
            : '';

        return `You are a professional resume bullet writer. You write ONLY what the user's own words support. You NEVER add facts.

================================================================
INPUTS — READ THE ROLE OF EACH ONE CAREFULLY
================================================================
Project Name:
${projectName || '(none provided)'}

Technologies / Tools Used:
${techLine}

Project Details (this is the PRIMARY SOURCE OF TRUTH):
${detailsLine}

================================================================
ROLE OF EACH INPUT — MEMORIZE THIS
================================================================
1. Project Name — establishes ONLY the identity of the project.
   It is a label. It is NOT evidence of features or implementation.

2. Technologies / Tools Used — METADATA ONLY.
   It tells you which tools the user listed. It says NOTHING about
   what the user did with them, how they were used, what was built
   with them, or what they achieved. Do NOT mention any technology
   in a bullet unless the Project Details themselves mention it.

3. Project Details — the ONLY source of facts about what the user
   actually did. Every action, feature, contribution, and outcome in
   your bullets MUST come from here.

================================================================
ABSOLUTE PROHIBITIONS
================================================================
You are FORBIDDEN from converting a technology name into an
implementation claim. Examples of the kind of HALLUCINATION you must
never produce (they sound plausible, but the user never said them):

- "React" listed        ⇒ FORBIDDEN: "Built responsive UI with React",
                                   "Implemented scalable architecture with React"
- "TypeScript" listed   ⇒ FORBIDDEN: "Wrote type-safe code"
- "Vite" listed         ⇒ FORBIDDEN: "Configured Vite for rapid module bundling"
- "Tailwind CSS" listed ⇒ FORBIDDEN: "Built a responsive interface with Tailwind CSS"
- "Groq API" listed     ⇒ FORBIDDEN: "Integrated data retrieval via Groq API"
- "Google Apps Script"  ⇒ FORBIDDEN: "Automated backend processes using Apps Script"
- ANY technology        ⇒ FORBIDDEN: "Built the project using <tech list>",
                                   "Technologies used include <tech list>"

You are also FORBIDDEN from inventing anything the user did not write:
- metrics, percentages, user counts, customers, clients, revenue, growth
- performance, speed, scalability, reliability, maintainability
- security, authentication, testing, deployment, automation
- APIs, integrations, architecture, team size, responsibilities
- outcomes, awards, rankings, organizations, business impact

Numbers and quantities are facts: if you use one, it must be exactly
as the user wrote it.

Before writing each bullet, ask: "Which words of the Project Details
support this claim?" If you cannot point to them, do not write it.

================================================================
HOW TO BUILD THE BULLETS — FOLLOW THESE STEPS
================================================================
STEP 1 (silently): List every DISTINCT fact in Project Details — what
  the project is or does, and each separate action, feature or
  deliverable the user mentions.
STEP 2: Group ONLY closely related facts (at most TWO per bullet),
  e.g. "resume content and support for less common professions".
STEP 3: Spread the facts across the ${needed} bullet${needed === 1 ? '' : 's'} so that each bullet is ONE
  separate idea of similar size. Leftover facts must NOT be dumped
  into the last bullets.
STEP 4: Write each bullet as one concise, resume-ready sentence.

LENGTH RULES
- Normal length: ${PREFERRED_MIN_WORDS}–${PREFERRED_MAX_WORDS} words (shorter is fine when the fact itself is short).
- HARD MAXIMUM: ${MAX_WORDS} words. A bullet over ${MAX_WORDS} words is a failure.
- A bullet with three or more independent actions or features is TOO
  BIG. Split it into separate bullets.
- Never shorten by deleting facts. Move them into another bullet.

FORBIDDEN SHAPE: several short bullets followed by one or two giant
"everything else" bullets.

ILLUSTRATION OF THE STRUCTURE (invented example — do NOT reuse its content):
Source: "Built an inventory tracking web app for small shops. Wrote the stock-count screens, added low-stock alerts, barcode lookup, CSV export and supplier notes, and fixed reported bugs."
BAD (giant last bullet): ["Built an inventory tracking web app for small shops.", "Wrote the stock-count screens, added low-stock alerts, barcode lookup, CSV export and supplier notes, and fixed reported bugs."]
GOOD (5 separate bullets): ["Built an inventory tracking web app for small shops.", "Wrote the stock-count screens for the app.", "Added low-stock alerts and barcode lookup.", "Added CSV export and supplier notes.", "Fixed reported bugs."]

WORDING RULES
- Professional rewriting IS allowed: fix grammar, tense and flow, and
  choose a strong opening verb that matches the user's action
  (e.g. "Built" → "Developed").
- Reuse the user's own key terms and nouns. Do NOT add new descriptive
  adjectives, benefits, or nouns that the user did not write.
- The factual meaning must stay identical to the source.
- Use an action verb only when the Project Details describe an action.
- No two bullets may convey the same fact.
${alreadyWritten}${tooLongBlock}
================================================================
IF PROJECT DETAILS IS THIN
================================================================
- Do NOT invent features or implementation.
- It is CORRECT to return fewer than ${needed} bullets, or an empty array,
  if the source cannot support that many distinct facts.
- NEVER pad with filler like "Project: X", "Technologies used:",
  "Details are provided by the user", "Worked on the project" or
  "Contributed to the project".

================================================================
COUNT
================================================================
- Write exactly ${needed} bullet${needed === 1 ? '' : 's'} when Project Details contains that many
  distinct facts (at least ${Math.min(MIN_ACCEPTABLE, needed)} when the source supports it).
- Fabricating to reach the count is a failure.

================================================================
OUTPUT FORMAT
================================================================
Return ONLY a JSON array of strings.
Each string = ONE resume bullet, WITH NO leading bullet marker,
NO numbering, NO extra commentary, NO markdown fences.

Example of the exact shape (contents are illustrative only):
["Built an inventory tracking web app for small shops.", "Added low-stock alerts and barcode lookup.", "..."]

Return ONLY the JSON array now.`;
    }

    private coerceToArray(result: unknown): any[] {
        if (Array.isArray(result)) return result;
        if (typeof result === 'string') return [result];
        if (result && typeof result === 'object') {
            const o = result as Record<string, unknown>;
            for (const key of ['bullets', 'suggestions', 'items', 'points', 'result']) {
                if (Array.isArray(o[key])) return o[key] as any[];
            }
        }
        return [];
    }

    private normalizeBullets(raw: any[]): string[] {
        const flat: string[] = [];

        const push = (s: string) => {
            s.split(/\r?\n/).forEach(line => {
                const t = line.trim();
                if (t) flat.push(t);
            });
        };

        const visit = (item: any): void => {
            if (item == null) return;
            if (typeof item === 'string') push(item);
            else if (Array.isArray(item)) item.forEach(visit);
            else if (typeof item === 'object') {
                const text = item.bullet ?? item.text ?? item.content;
                if (typeof text === 'string') push(text);
            }
        };
        raw.forEach(visit);

        const seen = new Set<string>();
        const out: string[] = [];
        for (const line of flat) {
            const s = this.stripMarkers(line);
            if (!s) continue;
            const k = s.toLowerCase();
            if (seen.has(k)) continue;
            seen.add(k);
            out.push(s);
        }
        return out;
    }

    private stripMarkers(line: string): string {
        let s = line.trim();
        let prev: string;
        do {
            prev = s;
            s = s
                .replace(/^\s*[•●▪◦·‣∙]\s*/, '')
                .replace(/^\s*[-–—*]\s+/, '')
                .replace(/^\s*\(?\d+[.)]\s+/, '')
                .trim();
        } while (s !== prev);

        return s
            .replace(/\*\*|__/g, '')
            .replace(/^["'`“”]+|["'`“”,]+$/g, '')
            .trim();
    }

    private wordCount(text: string): number {
        return text.trim().split(/\s+/).filter(Boolean).length;
    }

    private capitalize(s: string): string {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
    }

    private isVerb(word: string): boolean {
        return VERB_ONLY.test(word);
    }

    private cleanPiece(s: string): string {
        return this.capitalize(
            s
                .trim()
                .replace(/^(?:and|also)\s+/i, '')
                .replace(/[.,;:\s]+$/, '')
                .trim(),
        );
    }

    private splitSentences(text: string): string[] {
        return text
            .split(/(?<=[.!?])\s+(?=[A-Z0-9])|\s*;\s+/)
            .map(s => s.trim())
            .filter(Boolean);
    }

    private splitAtActions(piece: string): string[] {
        const raw = piece.split(ACTION_BOUNDARY).map(s => s.trim()).filter(Boolean);
        if (raw.length <= 1) return [piece];

        const merged: string[] = [];
        let carry = '';
        for (let i = 0; i < raw.length; i++) {
            const cur = carry ? `${carry} and ${raw[i]}` : raw[i];
            if (this.wordCount(cur) < 3 && i < raw.length - 1) {
                carry = cur;
                continue;
            }
            carry = '';
            merged.push(cur);
        }
        if (merged.length > 1 && this.wordCount(merged[merged.length - 1]) < 3) {
            const last = merged.pop() as string;
            merged[merged.length - 1] = `${merged[merged.length - 1]} and ${last}`;
        }
        return merged.map(p => this.cleanPiece(p)).filter(Boolean);
    }

    private joinList(items: string[]): string {
        if (items.length === 1) return items[0];
        if (items.length === 2) return `${items[0]} and ${items[1]}`;
        return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
    }

    private splitListItems(piece: string, groupWords: number): string[] {
        const trimmed = piece.trim().replace(/[.]+$/, '');
        const firstSpace = trimmed.indexOf(' ');
        if (firstSpace < 0) return [piece];

        const verb = trimmed.slice(0, firstSpace);
        if (!this.isVerb(verb)) return [piece];

        const items = trimmed
            .slice(firstSpace + 1)
            .split(/\s*,\s*(?:and\s+)?/)
            .map(s => s.trim())
            .filter(Boolean);
        if (items.length < 2) return [piece];

        const groups: string[][] = [];
        let cur: string[] = [];
        let curWords = 1;
        for (const item of items) {
            const iw = this.wordCount(item);
            if (cur.length > 0 && curWords + iw > groupWords) {
                groups.push(cur);
                cur = [];
                curWords = 1;
            }
            cur.push(item);
            curWords += iw;
        }
        if (cur.length > 0) groups.push(cur);
        if (groups.length < 2) return [piece];

        return groups.map(g => `${verb} ${this.joinList(g)}`);
    }

    private splitLongBullet(bullet: string): string[] {
        if (this.wordCount(bullet) <= MAX_WORDS) return [bullet];

        const out: string[] = [];
        for (const sentence of this.splitSentences(bullet)) {
            if (this.wordCount(sentence) <= MAX_WORDS) {
                out.push(this.cleanPiece(sentence));
                continue;
            }
            for (const part of this.splitAtActions(sentence)) {
                if (this.wordCount(part) <= MAX_WORDS) out.push(part);
                else out.push(...this.splitListItems(part, LIST_GROUP_WORDS));
            }
        }
        return out.filter(Boolean);
    }

    private mergeBullets(a: string, b: string): string {
        const strip = (s: string) => s.trim().replace(/[.\s]+$/, '');
        const A = strip(a);
        let B = strip(b);

        const firstA = A.split(/\s+/)[0].toLowerCase();
        const spaceB = B.indexOf(' ');
        const firstB = (spaceB < 0 ? B : B.slice(0, spaceB)).toLowerCase();

        if (spaceB > 0 && firstA === firstB) {
            B = B.slice(spaceB + 1);
        } else if (this.isVerb(firstB)) {
            B = firstB + (spaceB < 0 ? '' : B.slice(spaceB));
        }
        return `${A} and ${B}`;
    }

    private balanceToTarget(bullets: string[]): string[] {
        const list = [...bullets];
        while (list.length > TARGET_BULLETS) {
            let bestIdx = -1;
            let bestSize = Infinity;
            for (let i = 0; i < list.length - 1; i++) {
                const size = this.wordCount(list[i]) + this.wordCount(list[i + 1]);
                if (size <= MERGE_MAX_WORDS && size <= bestSize) {
                    bestSize = size;
                    bestIdx = i;
                }
            }
            if (bestIdx < 0) break;
            list.splice(bestIdx, 2, this.mergeBullets(list[bestIdx], list[bestIdx + 1]));
        }
        return list.slice(0, TARGET_BULLETS);
    }

    private deriveSourceAtoms(description: string): string[] {
        const sentences = description
            .split(/(?<=[.!?])\s+|\n+/)
            .map(s => s.trim())
            .filter(Boolean);

        const atoms: string[] = [];
        for (const raw of sentences) {
            const s = this.cleanPiece(this.stripMarkers(raw));
            if (!s || s.length < 8) continue;

            if (this.wordCount(s) <= 16) {
                atoms.push(s);
                continue;
            }
            for (const part of this.splitAtActions(s)) {
                if (this.wordCount(part) > 16) {
                    atoms.push(...this.splitListItems(part, SOURCE_LIST_GROUP_WORDS));
                } else {
                    atoms.push(part);
                }
            }
        }
        return atoms;
    }

    private topUpFromSource(bullets: string[], description: string): string[] {
        const out = [...bullets];
        for (const atom of this.deriveSourceAtoms(description)) {
            if (out.length >= TARGET_BULLETS) break;
            const words = this.meaningfulWords(atom);
            if (out.some(b => this.overlaps(this.meaningfulWords(b), words))) continue;
            out.push(atom);
        }
        return out;
    }

    private keepOnlyTraceableBullets(
        bullets: string[],
        projectName: string,
        description: string,
        tech: string,
    ): string[] {
        const sourceWords = this.contentWords(`${projectName} ${description}`);
        const techWords = this.contentWords(tech);

        const check = (bullet: string): string | null => {
            if (FILLER_PATTERNS.some(re => re.test(bullet))) return 'filler';

            let meaningful = 0;
            for (const w of this.contentWords(bullet)) {
                if (techWords.has(w) && !sourceWords.has(w)) {
                    return `technology "${w}" not in Project Details`;
                }

                if (STOPWORDS.has(w) || NEUTRAL_WORDS.has(w)) continue;

                if (sourceWords.has(w) || this.hasCloseVariant(sourceWords, w)) {
                    meaningful++;
                    continue;
                }
                return `"${w}" not in Project Details`;
            }

            return meaningful >= 2 ? null : 'too little supported content';
        };

        const kept: string[] = [];
        for (const b of bullets) {
            const reason = check(b);
            if (reason === null) kept.push(b);
            else console.warn(`🚫 AIProjectGenerator ${GENERATOR_VERSION}: dropped "${b}" → ${reason}`);
        }
        return kept;
    }

    private contentWords(text: string): Set<string> {
        const set = new Set<string>();
        const tokens = text
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(Boolean);
        for (const t of tokens) {
            if (t.length <= 1) continue;
            set.add(t);
        }
        return set;
    }

    private hasCloseVariant(sourceWords: Set<string>, word: string): boolean {
        if (word.length < 4) return false;

        const stems = new Set<string>([
            word,
            word.replace(/ing$/, ''),
            word.replace(/ing$/, 'e'),
            word.replace(/ed$/, ''),
            word.replace(/ed$/, 'e'),
            word.replace(/ies$/, 'y'),
            word.replace(/ied$/, 'y'),
            word.replace(/es$/, ''),
            word.replace(/s$/, ''),
            word.replace(/ly$/, ''),
        ]);
        for (const s of stems) {
            if (s.length < 3) continue;
            if (sourceWords.has(s)) return true;
        }

        const prefix = word.slice(0, 6);
        if (prefix.length >= 6) {
            for (const s of sourceWords) {
                if (s.startsWith(prefix)) return true;
            }
        }
        return false;
    }

    private meaningfulWords(b: string): Set<string> {
        const set = new Set<string>();
        for (const w of this.contentWords(b)) {
            if (STOPWORDS.has(w) || NEUTRAL_WORDS.has(w)) continue;
            set.add(w);
        }
        return set;
    }

    private overlaps(a: Set<string>, b: Set<string>): boolean {
        const smaller = Math.min(a.size, b.size);
        if (smaller < 3) return false;
        let shared = 0;
        for (const w of b) if (a.has(w)) shared++;
        return shared / smaller >= 0.8;
    }

    private removeNearDuplicates(bullets: string[]): string[] {
        const kept: { text: string; words: Set<string> }[] = [];
        for (const b of bullets) {
            const words = this.meaningfulWords(b);
            if (!kept.some(k => this.overlaps(k.words, words))) {
                kept.push({ text: b, words });
            }
        }
        return kept.map(k => k.text);
    }

    private finalizeBullets(bullets: string[]): string[] {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const b of bullets) {
            const s = this.capitalize(this.stripMarkers(b).replace(/[\s.]+$/, '').trim());
            if (!s) continue;
            const key = s.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            out.push(`${s}.`);
        }
        return out;
    }

    private deriveGroundedFallback(description: string): string[] {
        const details = (description || '').trim();
        if (!details) return [];

        const atoms = this.removeNearDuplicates(this.deriveSourceAtoms(details));
        const balanced = atoms.length > TARGET_BULLETS ? this.balanceToTarget(atoms) : atoms;
        return this.finalizeBullets(balanced.slice(0, TARGET_BULLETS));
    }
}