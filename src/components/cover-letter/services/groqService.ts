// src/components/cover-letter/services/groqService.ts
// =====================================================
// ✅ Solution B: BACKEND PROXY MODE
// ✅ Browser se direct Groq call NAHI hoti
// ✅ Keys server-side rehti hain (secure)
// ✅ Server handles fallback + model selection + cooldown
// ✅ include_reasoning: false (GPT-OSS fix)
// ✅ MAX_TOKENS = 4000
// ✅ Queue-based concurrency control (via makeRequestWithRetry)
// ✅ AI behavior unchanged — prompts, extraction, cleaning sab same
// =====================================================

import {
  getConfiguredKeyCount,
  hasAnyKey,
} from '../../cv-builder/services/providers/groqKeyManager';
import { enqueue } from '../../../services/aiQueueService';

const GROQ_MODEL = 'openai/gpt-oss-120b';
const MAX_TOKENS = 4000;

// ============================================================
// INTERNAL: Backend proxy call (not queued)
// ============================================================
const runRequestWithRetry = async (requestBody: any): Promise<any> => {
  // ✅ Ab browser se direct Groq call NAHI hoti.
  // Backend /api/ai/generate call hota hai jo keys server-side rakhta hai.
  console.log('📤 Cover Letter: sending to /api/ai/generate');

  const messages = requestBody?.messages || [];
  const systemMsg = messages.find((m: any) => m.role === 'system')?.content;
  const userMsg = messages.find((m: any) => m.role === 'user')?.content;

  if (!userMsg) {
    throw new Error('No user message in request');
  }

  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      feature: 'COVER_LETTER',
      prompt: userMsg,
      systemPrompt: systemMsg || undefined,
      options: {
        temperature: requestBody?.temperature ?? 0.6,
        maxTokens: requestBody?.max_tokens ?? MAX_TOKENS,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error('❌ Cover Letter backend proxy failed:', err);
    throw new Error(err?.error || `Backend proxy failed: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!data?.ok || !data?.text) {
    console.error('❌ Cover Letter backend returned no text:', data);
    throw new Error(data?.error || 'Backend returned no text');
  }

  const content = (data.text || '').trim();
  const words = content.split(/\s+/).filter(Boolean).length;

  console.log(
    `✅ Cover Letter: success via [${data.source}/${data.model}] — ${words} words`
  );

  // ✅ Groq-compatible shape return karo (baaki code same rahe)
  return {
    choices: [
      {
        message: { content },
        finish_reason: 'stop',
      },
    ],
  };
};

// ============================================================
// PUBLIC: queued wrapper
// ============================================================
const makeRequestWithRetry = async (requestBody: any): Promise<any> => {
  return enqueue(() => runRequestWithRetry(requestBody));
};

// ============================================================
// ✅ FRESHER DETECTION
// ============================================================
const detectFresherMode = (
  currentTitle?: string,
  currentCompany?: string,
  yearsOfExperience?: number
): boolean => {
  const hasTitle = !!(currentTitle && currentTitle.trim());
  const hasCompany = !!(currentCompany && currentCompany.trim());
  const hasYears = !!(yearsOfExperience && yearsOfExperience > 0);
  return !hasTitle && !hasCompany && !hasYears;
};

// ============================================================
// ✅ DETECT EXPERIENCE LEVEL → LENGTH TARGET
// ============================================================
interface LengthTarget {
  level: string;
  min: number;
  max: number;
}

const getLengthTarget = (
  years?: number,
  title?: string,
  currentCompany?: string
): LengthTarget => {
  if (detectFresherMode(title, currentCompany, years)) {
    return { level: 'Fresher', min: 250, max: 350 };
  }

  const lowerTitle = (title || '').toLowerCase();
  const isSeniorTitle =
    /senior|lead|principal|head|manager|director|architect|vp|chief/.test(
      lowerTitle
    );
  const isFresherTitle =
    /junior|intern|trainee|graduate|entry|fresher/.test(lowerTitle);

  if (years && years >= 6) return { level: 'Senior', min: 300, max: 400 };
  if (isSeniorTitle && (!years || years >= 1))
    return { level: 'Senior', min: 300, max: 400 };
  if (isFresherTitle) return { level: 'Fresher', min: 250, max: 350 };
  if (!years || years === 0) return { level: 'Mid-level', min: 280, max: 350 };
  if (years >= 1 && years <= 5)
    return { level: 'Mid-level', min: 280, max: 350 };

  return { level: 'Mid-level', min: 280, max: 350 };
};

const escapeRegex = (s: string): string => {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// ============================================================
// ✅ TEXT EXTRACTOR
// ============================================================
const extractTextFromResponse = (
  responseData: any,
  hiringManagerName?: string
): string => {
  const message = responseData?.choices?.[0]?.message;
  if (!message) return '';

  const content = (message.content || '').trim();
  const reasoning = (message.reasoning || '').trim();

  if (content.length >= 50) return content;

  if (reasoning.length > 0) {
    console.log('⚠️ Empty/short content — extracting from reasoning');
    try {
      const extracted = extractFinalAnswerFromReasoning(
        reasoning,
        hiringManagerName
      );
      if (extracted.length >= 50) {
        console.log(
          '🔍 EXTRACTED (first 300 chars):',
          JSON.stringify(extracted.slice(0, 300))
        );
        return extracted;
      }
      return reasoning;
    } catch (err) {
      console.warn('⚠️ Reasoning extraction failed — triggering fallback');
      throw err;
    }
  }

  return '';
};

const extractFinalAnswerFromReasoning = (
  reasoning: string,
  hiringManagerName?: string
): string => {
  const startMarkers = [
    /\*\*Final[^*]*\*\*\s*:?\s*/i,
    /\*\*Cover Letter[^*]*\*\*\s*:?\s*/i,
    /\*\*Response[^*]*\*\*\s*:?\s*/i,
    /Final answer\s*:?\s*/i,
    /Here is the cover letter\s*:?\s*/i,
    /Here's the cover letter\s*:?\s*/i,
    /Here is the letter\s*:?\s*/i,
    /Now,?\s+writing the cover letter\s*:?\s*/i,
    /Now,?\s+the cover letter\s*:?\s*/i,
    /Alright,?\s+writing the cover letter\s*:?\s*/i,
    /Here is the final cover letter\s*:?\s*/i,
    /The final cover letter\s*:?\s*/i,
    /Final version\s*:?\s*/i,
    /Cover letter body\s*:?\s*/i,
    /Body of the cover letter\s*:?\s*/i,
  ];

  let bestIndex = -1;
  let bestLength = 0;

  for (const marker of startMarkers) {
    const matches = [...reasoning.matchAll(new RegExp(marker.source, 'gi'))];
    if (matches.length > 0) {
      const lastMatch = matches[matches.length - 1];
      if (lastMatch.index !== undefined && lastMatch.index > bestIndex) {
        bestIndex = lastMatch.index;
        bestLength = lastMatch[0].length;
      }
    }
  }

  let extracted = '';

  if (bestIndex >= 0) {
    extracted = reasoning.slice(bestIndex + bestLength).trim();
  } else {
    const candidateStarts = [
      /I am writing to apply/i,
      /I am writing to express/i,
      /I am excited to apply/i,
      /I am writing to express my interest/i,
      /I am writing in response to/i,
      /I am writing to apply for/i,
    ];

    let bestStart = -1;
    for (const pattern of candidateStarts) {
      const matches = [...reasoning.matchAll(new RegExp(pattern.source, 'gi'))];
      if (matches.length > 0) {
        const firstMatch = matches[0];
        if (firstMatch.index !== undefined) {
          if (bestStart < 0 || firstMatch.index < bestStart) {
            bestStart = firstMatch.index;
          }
        }
      }
    }

    if (bestStart >= 0) {
      extracted = reasoning.slice(bestStart).trim();
    } else {
      const isInternalNote =
        /Rewrite\s+P\d|Let me\s+think|Now\s+we\s+removed|I\s+need\s+to\s+revise|Hmm,|Okay,\s+let\s+me|Actually,|Wait,|Let me\s+reconsider|I'll\s+now|Let me\s+refine/i.test(
          reasoning
        );
      if (isInternalNote) {
        throw new Error(
          'AI returned reasoning-only response without valid letter body'
        );
      }

      const paragraphs = reasoning
        .split(/\n\n+/)
        .filter((p) => p.trim().length > 0);
      if (paragraphs.length > 3) {
        extracted = paragraphs.slice(-5).join('\n\n').trim();
      } else {
        extracted = reasoning;
      }
    }
  }

  if (hiringManagerName && hiringManagerName.trim()) {
    const name = hiringManagerName.trim();
    const escapedName = escapeRegex(name);

    extracted = extracted.replace(
      new RegExp(`^\\s*${escapedName}\\s*[,:.\\-]?[\\s\\n]+`, 'i'),
      ''
    );

    extracted = extracted.replace(
      new RegExp(`^\\s*Dear\\s+${escapedName}\\s*[,:]?[\\s\\n]+`, 'i'),
      ''
    );
  }

  extracted = extracted.replace(
    /^\s*Dear\s+[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*)*\s*[,:]?[\s\n]+/i,
    ''
  );

  return extracted.trim();
};

const cleanReasoningArtifacts = (text: string): string => {
  let cleaned = text;

  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/(?<!\w)\*(?!\w)/g, '');

  const internalNotePrefixes = [
    /^Rewrite\s+P\d\s*:?\s*/i,
    /^Now\s+we\s+removed\s+[^\n]*\n+/i,
    /^Let me\s+(think|refine|reconsider|revise)[^\n]*\n+/i,
    /^Okay,?\s+(so\s+)?(let me|I need to|I'll|I will)[^\n]*\n+/i,
    /^Alright,?[^\n]*\n+/i,
    /^First,?\s+I[^\n]*\n+/i,
    /^Hmm,?[^\n]*\n+/i,
    /^So,?\s+[^\n]*\n+/i,
    /^Now,?\s+[^\n]*\n+/i,
    /^Actually,?[^\n]*\n+/i,
    /^Wait,?[^\n]*\n+/i,
    /^I\s+(need to|will|am going to|should)[^\n]*\n+/i,
  ];
  for (const prefix of internalNotePrefixes) {
    cleaned = cleaned.replace(prefix, '');
  }

  cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '');
  cleaned = cleaned.replace(/```/g, '');

  const suffixesToRemove = [
    /\n+(That's|This is|Here is|I've)\s+(the|a|my|the final)[^\n]*$/i,
    /\n+(Word count|Length|Total words)[^\n]*$/i,
    /\n+\(?\d+\s+words?\)?\s*$/i,
    /\n+Let me know[^\n]*$/i,
    /\n+Feel free[^\n]*$/i,
    /\n+I hope[^\n]*$/i,
  ];
  for (const suffix of suffixesToRemove) {
    cleaned = cleaned.replace(suffix, '');
  }

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
};

const removeHiringManagerPrefix = (
  text: string,
  hiringManagerName?: string
): string => {
  if (!text) return text;

  let cleaned = text.trim();

  for (let i = 0; i < 3; i++) {
    const before = cleaned;
    cleaned = cleaned.replace(
      /^\s*Dear\s+[A-Za-z][A-Za-z.'-]*(?:\s+[A-Za-z][A-Za-z.'-]*)*\s*[,:]?[\s\n]+/i,
      ''
    );
    if (cleaned === before) break;
  }

  if (hiringManagerName && hiringManagerName.trim()) {
    const name = hiringManagerName.trim();
    const escapedName = escapeRegex(name);

    for (let i = 0; i < 3; i++) {
      const before = cleaned;

      cleaned = cleaned.replace(
        new RegExp(`^\\s*${escapedName}\\s*[,:.\\-]?[\\s\\n]+`, 'i'),
        ''
      );

      cleaned = cleaned.replace(
        new RegExp(`^\\s*${escapedName}\\s*$`, 'i'),
        ''
      );

      const firstName = name.split(/\s+/)[0];
      if (firstName && firstName.length >= 3) {
        const escapedFirst = escapeRegex(firstName);
        cleaned = cleaned.replace(
          new RegExp(`^\\s*${escapedFirst}\\s*[,:.\\-]?[\\s\\n]+`, 'i'),
          ''
        );
      }

      if (cleaned === before) break;
    }

    const lowerName = name.toLowerCase();
    const firstChunk = cleaned.slice(0, 200);
    const idx = firstChunk.toLowerCase().indexOf(lowerName);

    if (idx >= 0 && idx < 100) {
      cleaned =
        cleaned.slice(0, idx) +
        cleaned.slice(idx + name.length).replace(/^[\s,.:;\-]+/, '');
    }
  }

  const firstChar = cleaned.charAt(0);
  if (firstChar && !/[A-Za-z]/.test(firstChar)) {
    cleaned = cleaned.replace(/^[^A-Za-z]+/, '');
  }

  cleaned = cleaned.replace(/^[\s\n]+/, '').trim();
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned;
};

// ============================================================
// ✅ STYLE FRAMEWORKS
// ============================================================
const styleFrameworks: Record<string, string> = {
  professional: `PROFESSIONAL STYLE:
- Confident but natural introduction
- Simple, direct business English
- Warm and professional tone
- Concrete over abstract`,

  executive: `EXECUTIVE STYLE:
- High-level positioning (only if user data supports leadership)
- Authoritative but not arrogant tone
- Direct, decisive language
- Focus on strategic context only when supported by user data`,

  technical: `TECHNICAL STYLE:
- Engineering-minded tone
- Precise technical vocabulary
- Mention only technologies the user actually listed
- Focus on practical problem-solving`,

  creative: `CREATIVE STYLE:
- Engaging but professional tone
- 80% professional, 20% personality
- Natural flow, not overly poetic
- Genuine interest in the work`,

  persuasive: `PERSUASIVE STYLE:
- Strong value proposition (using real data)
- Confident, direct statements
- Every sentence adds value
- No filler or generic claims`,

  confident: `CONFIDENT STYLE:
- Bold but grounded tone
- Strong action verbs
- Self-assured without exaggeration
- Specific over generic`,

  enthusiastic: `ENTHUSIASTIC STYLE:
- Warm, genuine energy
- Positive but professional
- Real interest in the role
- Not overly emotional`,

  empathetic: `EMPATHETIC STYLE:
- Warm, human-centered tone
- Collaborative language
- Genuine and respectful
- Conversational but professional`,
};

// ============================================================
// ✅ GENERATE COVER LETTER
// ============================================================
export const generateCoverLetterWithAI = async (data: {
  userName: string;
  jobTitle: string;
  company: string;
  experience: string;
  skills: string;
  education: string;
  projects: string;
  additionalInfo: string;
  selectedStyle: string;
  hiringManagerName?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  jobDescription?: string;
}): Promise<string> => {
  console.log('🔑 Total configured keys:', getConfiguredKeyCount());
  console.log(
    '🔍 hiringManagerName value:',
    JSON.stringify(data.hiringManagerName)
  );
  console.log('🔍 Using model:', GROQ_MODEL);

  if (!hasAnyKey()) {
    throw new Error('AI service not configured. Please contact support.');
  }

  const skillsList = data.skills
    ? data.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];
  const formattedSkills =
    skillsList.length > 0 ? skillsList.join(', ') : '(none provided)';

  const styleFramework =
    styleFrameworks[data.selectedStyle] || styleFrameworks['professional'];

  const isFresherMode = detectFresherMode(
    data.currentTitle,
    data.currentCompany,
    data.yearsOfExperience
  );

  const hasExperience = !!(
    data.currentTitle?.trim() || data.currentCompany?.trim()
  );
  const years =
    data.yearsOfExperience && data.yearsOfExperience > 0
      ? data.yearsOfExperience
      : null;

  const lengthTarget = getLengthTarget(
    data.yearsOfExperience,
    data.currentTitle,
    data.currentCompany
  );

  console.log(
    `🧭 Experience mode: ${isFresherMode ? 'FRESHER' : 'EXPERIENCED'}`
  );
  console.log(
    `📏 Detected level: ${lengthTarget.level} → ${lengthTarget.min}-${lengthTarget.max} words`
  );

  const experienceModeBlock = isFresherMode
    ? `═══════════════════════════════════════════════
🚫 FRESHER MODE — NO EXPERIENCE PROVIDED (CRITICAL)
═══════════════════════════════════════════════
The applicant has NOT provided ANY experience information:
   - Current / Most Recent Job Title: EMPTY
   - Company Name: EMPTY
   - Years of Experience: EMPTY

You MUST treat this applicant as a FRESHER / ENTRY-LEVEL / JUNIOR candidate.

⚠️ EMPTY EXPERIENCE ≠ SHORT OR GENERIC LETTER (CRITICAL)
A fresher MUST still receive a strong, complete, personalized cover
letter. Do NOT write a weak, generic, or thin letter simply because
experience is missing.

You SHOULD use:
   - Personal information (name)
   - Target job title
   - Target company
   - Job description
   - Skills explicitly provided by the applicant
   - Motivation, enthusiasm, willingness to learn
   - Readiness to contribute
   - Alignment between provided skills and job requirements
   - Professional growth mindset

✅ ALLOWED — describing provided skills as a foundation:
   "My foundation in HTML5, CSS3, JavaScript, TypeScript, and Angular
    has prepared me to contribute to modern web development."
   "I am familiar with HTML5, CSS3, JavaScript, TypeScript, and Angular."
   "I am eager to apply my existing technical foundation while
    contributing to the web development responsibilities outlined for
    this role."

❌ Do NOT claim HOW or WHERE the skills were acquired or used.
   ❌ "I used Angular at my last job to build..."
   ❌ "I learned these skills in university..."
   ❌ "I applied these skills during an internship..."

═══════════════════════════════════════════════
🚫 DO NOT INVENT BACKGROUND (CRITICAL)
═══════════════════════════════════════════════
When Experience is empty, DO NOT invent:
   ❌ employment
   ❌ previous jobs
   ❌ "X years of experience"
   ❌ "With X years of experience"
   ❌ "I have X years of experience"
   ❌ "several years of experience"
   ❌ "extensive experience"
   ❌ "professional experience"
   ❌ "my current role" / "my previous role"
   ❌ "in my current position" / "in my previous position"
   ❌ employers
   ❌ internships
   ❌ education / degrees
   ❌ graduation status
   ❌ university / college
   ❌ coursework
   ❌ academic projects
   ❌ personal projects
   ❌ extracurricular activities
   ❌ certifications
   ❌ achievements
   ❌ clients
   ❌ professional responsibilities
   ❌ professional results
   ❌ metrics
   ❌ practical / clinical / technical / business experience

❌ FORBIDDEN PHRASINGS (unless explicitly provided):
   ❌ "I recently graduated..."
   ❌ "My coursework taught me..."
   ❌ "During university, I built..."
   ❌ "I have built several Angular applications..."
   ❌ "During my internship..."
   ❌ "Through my studies..."
   ❌ "As a recent graduate..."
   ❌ "In my personal projects..."
   ❌ "While building X..."
   ❌ "I developed these skills during..."
   ❌ "I gained experience with X by..."
   ❌ any sentence that claims WHERE or HOW the applicant acquired or
      used the provided skills

═══════════════════════════════════════════════
🚫 JOB DESCRIPTION ≠ APPLICANT EXPERIENCE (CRITICAL)
═══════════════════════════════════════════════
The Job Description describes what the EMPLOYER wants.
It is NOT evidence that the applicant has done those things.

❌ FORBIDDEN — converting JD responsibilities into applicant experience:
   JD says: "Responsibilities include developing new web features, fixing bugs, optimizing performance, integrating APIs, ensuring cross-browser compatibility."
   You MUST NOT write: "I have experience developing web features, fixing bugs, optimizing performance, integrating APIs, and ensuring cross-browser compatibility."

✅ ALLOWED — connecting skills to the JD without claiming experience:
   "I am eager to apply my existing technical foundation while
    contributing to the web development responsibilities outlined
    for this role."

The candidate's skills may be connected to the JD, but the JD must
NEVER be converted into fabricated applicant experience.`
    : `═══════════════════════════════════════════════
✅ EXPERIENCED MODE — EXPERIENCE METADATA PROVIDED
═══════════════════════════════════════════════
The applicant HAS provided experience METADATA:
${data.currentTitle?.trim() ? `   - Current / Most Recent Job Title: ${data.currentTitle.trim()}` : ''}
${data.currentCompany?.trim() ? `   - Company Name: ${data.currentCompany.trim()}` : ''}
${years ? `   - Years of Experience: ${years}` : ''}

═══════════════════════════════════════════════
🧭 METADATA vs RESPONSIBILITIES (CRITICAL SPLIT)
═══════════════════════════════════════════════
METADATA is FACTUAL and may be stated directly:
   ✅ Job Title
   ✅ Company Name
   ✅ Years of Experience

RESPONSIBILITIES / DETAILS require EXPLICIT user-provided information.
The user has NOT provided any responsibility details.

✅ ALLOWED — using metadata:
   "With ${years || 'my'} years of experience as a ${data.currentTitle?.trim() || 'professional'}${data.currentCompany?.trim() ? ` at ${data.currentCompany.trim()}` : ''}..."
   "As a ${data.currentTitle?.trim() || 'professional'}${data.currentCompany?.trim() ? ` at ${data.currentCompany.trim()}` : ''}, I focus on..."

❌ FORBIDDEN — inventing responsibilities the user did NOT provide:
   ❌ "I regularly collaborate with designers."
   ❌ "I routinely test pages."
   ❌ "I keep documentation current."
   ❌ "I optimize website performance."
   ❌ "I developed modular Angular components."
   ❌ "I fixed bugs and integrated APIs."
   ❌ "I led a team."
   ❌ "I managed clients."
   ❌ "I improved performance by X%."
   ❌ any specific task, project, product, responsibility, achievement,
      metric, client, result, or activity not explicitly supplied

You do NOT know:
   - what exact tasks the applicant performed
   - what projects they worked on
   - what products they built
   - whether they worked with APIs, testing, accessibility, docs,
     design collaboration, performance, clients, or leadership

Therefore you MUST NOT state any of these as the applicant's
experience.

═══════════════════════════════════════════════
🚫 OTHER PROHIBITIONS (EXPERIENCED MODE)
═══════════════════════════════════════════════
You MUST NOT invent:
   ❌ additional responsibilities
   ❌ achievements
   ❌ metrics
   ❌ projects
   ❌ clients
   ❌ technologies not listed in the applicant's skills
   ❌ outcomes
   ❌ education, graduation status, coursework, internships, or
      academic background (not provided)
   ❌ any fact not supplied by the user

═══════════════════════════════════════════════
✅ ALLOWED — CONNECTING EXPERIENCE + SKILLS TO THE JD
═══════════════════════════════════════════════
You MAY:
   - State the metadata (title, company, years)
   - Mention provided skills
   - Connect metadata + skills to the JD's needs
   - Express professional alignment and motivation

You MUST NOT convert the JD's responsibilities into the applicant's
past responsibilities. The JD is what the EMPLOYER wants — not what
the applicant has done.

If only SOME metadata is provided (e.g., title only, no company/years),
use only what is provided. Do NOT invent the missing fields.`;

  const systemPrompt = `You are an experienced career coach writing a cover letter for a real candidate. Write the BODY ONLY — natural, specific, and grounded in the user's actual data.

${styleFramework}

${experienceModeBlock}

═══════════════════════════════════════════════
🚫 OUTPUT = BODY ONLY (CRITICAL)
═══════════════════════════════════════════════
The PDF/preview template ALREADY provides:
   - Date
   - Recipient ("Hiring Manager" / "[Name]")
   - Company name
   - RE: Application for [Role]
   - Greeting ("Dear Hiring Manager," / "Dear [Name],")
   - Contact details in header
   - "Sincerely," signoff
   - Signature (name + title)

So you MUST NOT output ANY of these. Output ONLY the body paragraphs.

Do NOT output:
   ❌ "Dear Hiring Manager," or "Dear Hiring Team," or "Dear [Name],"
   ❌ Any date
   ❌ Any recipient name or hiring manager name
   ❌ Any "RE:" or "Application for" line
   ❌ Any email, phone, or location
   ❌ "Sincerely," or "Regards," or any signoff
   ❌ User's name at end
   ❌ Any header, footer, or meta-info
   ❌ Any reasoning, notes, or meta-commentary (e.g., "Rewrite P4:", "Let me think")

═══════════════════════════════════════════════
🚫 HIRING MANAGER NAME — DO NOT REPEAT (CRITICAL)
═══════════════════════════════════════════════
The PDF/template ALREADY renders the greeting.

You MUST NOT include any greeting in your output.
You MUST NOT repeat the hiring manager name anywhere in the body.
You MUST NOT start your output with any name (hiring manager or otherwise).

❌ WRONG:
   "Midhat Sultan I am writing to express my interest..."
   "Midhat Sultan, I am writing to express my interest..."
   "Dear Midhat Sultan, I am writing..."
   "Dear Hiring Manager, I am writing..."

✅ CORRECT (start directly with the first sentence):
   "I am writing to express my interest in the [Role] position at [Company]..."
   "I am excited to apply for the [Role] position at [Company]..."

Your output MUST start with the actual first sentence of the letter body,
NOT with any name, greeting, or salutation.

═══════════════════════════════════════════════
🚫 ABSOLUTE PROHIBITIONS
═══════════════════════════════════════════════
Never invent, assume, or infer:
   1. Skills, technologies, tools, frameworks, languages
   2. Job responsibilities (unless explicitly provided)
   3. Achievements, metrics, numbers
   4. Projects
   5. Certifications
   6. Education, degrees
   7. Graduation status
   8. Coursework
   9. Internships
   10. Team size
   11. Leadership claims
   12. Agile/Scrum/Kanban
   13. CI/CD, DevOps, cloud
   14. Company history, reputation, culture, mission, products
   15. JD requirements as user's skills
   16. Any practical experience, activities, or application of skills

═══════════════════════════════════════════════
🚫 JOB DESCRIPTION RULE
═══════════════════════════════════════════════
The JD tells you what the EMPLOYER wants — NOT what the user HAS.
If the JD mentions a skill NOT in the user's list → write AROUND it, do NOT claim it.

Only mention a skill if it is BOTH:
   (a) In the user's provided list, AND
   (b) Relevant to the JD.

═══════════════════════════════════════════════
🚫 WHEN INFORMATION IS MISSING → OMIT IT
═══════════════════════════════════════════════
Do NOT assume, infer, or guess. If information is missing, write around it. Never invent.

═══════════════════════════════════════════════
🚫 PLACEHOLDERS FORBIDDEN
═══════════════════════════════════════════════
Never output placeholders such as:
   ❌ X years
   ❌ [Your Name]
   ❌ [Company Name]
   ❌ [Job Title]
   ❌ [Insert Name]
   ❌ [Insert Company]
   ❌ [Your Experience]

If information is missing, simply omit that information.
Use the actual applicant name when it is available.

═══════════════════════════════════════════════
🔄 DO NOT REPEAT INFORMATION
═══════════════════════════════════════════════
Each piece of information appears ONCE:
   - A skill mentioned in P2 → do NOT re-list in P3
   - Role mentioned in P1 → do NOT restate in P3
   - "React.js" in P2 → do NOT mention again in P3/P4

Each paragraph has UNIQUE information.

═══════════════════════════════════════════════
📝 WEAK WORDING — REPLACE WITH CONFIDENT
═══════════════════════════════════════════════
❌ "learning how to"           → ✅ "developing skills in" / "building expertise in"
❌ "I enjoy and want to continue pursuing" → ✅ "I am committed to" / "I focus on"
❌ "I am eager to learn"       → ✅ "I am ready to contribute and grow"
❌ "trying to"                 → ✅ "working to" / "focused on"
❌ "getting better at"         → ✅ "strengthening my skills in"
❌ "I hope to"                 → ✅ "I look forward to" / "I am ready to"
❌ "I want to"                 → ✅ "I aim to" / "I plan to"

Confident but truthful. Never overpromise.

═══════════════════════════════════════════════
📝 NATURAL HUMAN-WRITTEN FEEL
═══════════════════════════════════════════════
Read your output aloud. If it sounds like a corporate template, rewrite.

AVOID these overused phrases:
- "technical acumen"
- "collaborative spirit"
- "strategic goals"
- "professional aspirations"
- "driving organizational success"
- "leveraging my expertise"
- "I am confident that I would be an excellent addition"
- "contribute to the continued success"
- "dynamic and fast-paced environment"
- "dynamic environment"
- "leverage my skills"
- "synergy"
- "results-driven"
- "detail-oriented professional"
- "proven track record"
- "proven ability to"
- "strong track record of"
- "excellent communication skills"
- "team player"
- "passionate about leveraging"

Write like an experienced professional emailing a hiring manager.
Simple. Specific. Confident. Human.

═══════════════════════════════════════════════
🎯 BE SPECIFIC, NOT GENERIC
═══════════════════════════════════════════════
- Read the JD carefully.
- Pick 2-4 most relevant skills from the user's list.
- Connect them naturally to JD requirements.
- Do NOT force-list every skill.

═══════════════════════════════════════════════
📝 JOB TITLE FORMATTING
═══════════════════════════════════════════════
Silently fix obvious typos:
   "software enginner" → "Software Engineer"
Do NOT change meaning or seniority.

═══════════════════════════════════════════════
📐 STRUCTURE (3-4 PARAGRAPHS, UNIQUE INFO EACH)
═══════════════════════════════════════════════
P1 — Opening (2-3 sentences):
   - Role + company
   - Brief professional positioning
   - Do NOT list skills here
   - MUST start with "I am writing..." or "I am excited..." (no names before)
   ${
     isFresherMode
       ? '- FRESHER: express genuine interest + readiness to contribute; NO experience claims, NO education/graduation/coursework claims'
       : '- EXPERIENCED: may state title/company/years factually; NO invented responsibilities'
   }

P2 — Relevant Background (3-4 sentences):
   - ${
     isFresherMode
       ? 'FRESHER: frame provided skills as a current foundation (no origin/use claims, no education/projects/internships)'
       : 'EXPERIENCED: state metadata (title/company/years) + 2-3 most relevant provided skills — do NOT invent tasks/projects/responsibilities'
   }
   - Connect skills to JD needs
   - Do NOT repeat P1 content

P3 — Fit (2-3 sentences):
   - How the applicant aligns (new angle, not skill re-list)
   - Confident but grounded
   - Do NOT repeat P1/P2 content

P4 — Closing (2 sentences):
   - Genuine interest
   - Thanks
   - Do NOT re-summarize

═══════════════════════════════════════════════
📐 LENGTH TARGET
═══════════════════════════════════════════════
Level: ${lengthTarget.level}
Target: ${lengthTarget.min}-${lengthTarget.max} words

Aim for the middle of the range (ideally 280-350 words when enough
information exists). Do NOT pad with filler. Never exceed
${lengthTarget.max} words.

═══════════════════════════════════════════════
🔍 SELF-CHECK (INTERNAL, BEFORE OUTPUT)
═══════════════════════════════════════════════
1. Is every claim supported by user data?
2. Is any skill/tech invented?
3. Is any JD req falsely claimed as user's experience?
4. Are only RELEVANT skills mentioned?
5. Are title/company/years accurate?
6. Any unsupported company claims?
7. Is wording natural (not corporate)?
8. Any info repeated across paragraphs?
9. Length within ${lengthTarget.min}-${lengthTarget.max}?
10. Any prohibited phrases used?
11. Does the body start directly with "I am..." (no name/greeting before)?
${
  isFresherMode
    ? '12. FRESHER MODE: Am I 100% free of any experience claim, years, employer, role, project, internship, achievement, education, graduation, coursework, application, or activity the user did NOT provide?\n13. FRESHER MODE: Did I claim HOW or WHERE the applicant acquired or used their provided skills? (Must be NO — skills may only be stated as skills/foundation.)\n14. FRESHER MODE: Is the letter strong, complete, and personalized (NOT short/generic) despite empty experience?'
    : "12. EXPERIENCED MODE: Did I only state METADATA (title/company/years) and provided skills — without inventing any responsibility, task, project, achievement, metric, client, result, or activity?\n13. EXPERIENCED MODE: Did I convert any JD responsibility into the applicant's past experience? (Must be NO.)\n14. EXPERIENCED MODE: Is the letter strong, complete, and personalized?"
}

⚠️ CRITICAL: Output ONLY the final letter body. Do NOT include any reasoning, planning, notes, or meta-commentary like "Rewrite P4:", "Let me think", "Now we removed..." etc.

Return ONLY the body paragraphs. Nothing else.`;

  const fresherExtraInstruction = isFresherMode
    ? `16. FRESHER MODE: The Job Description is what the EMPLOYER wants — it is NOT the applicant's experience. Never say "I have experience developing/fixing/integrating/optimizing..." just because the JD lists those responsibilities.
17. FRESHER MODE: Do NOT invent education, graduation status, coursework, personal projects, internships, applications, practical experience, or previous activities.
18. FRESHER MODE: You may describe the provided skills as skills / a current foundation, but you MUST NOT claim HOW or WHERE the applicant acquired or used those skills (no "through my studies", "during my degree", "in my personal projects", "during my internship", "while building X", etc.).
19. FRESHER MODE: Empty experience does NOT mean a short or generic letter. Produce a strong, complete, personalized letter (target ${lengthTarget.min}-${lengthTarget.max} words) using skills + JD + motivation + alignment.`
    : `16. EXPERIENCED MODE: You may state the experience METADATA (job title, company, years) factually.
17. EXPERIENCED MODE: You MUST NOT invent responsibilities, tasks, projects, products, achievements, metrics, clients, results, or activities — the user did NOT provide them.
18. EXPERIENCED MODE: Do NOT convert JD responsibilities into the applicant's past experience. The JD is what the EMPLOYER wants, not what the applicant has done.
19. EXPERIENCED MODE: Use provided skills to connect the applicant's background to the JD. Produce a strong, complete, personalized letter (target ${lengthTarget.min}-${lengthTarget.max} words).`;

  const userPrompt = `Write a cover letter body for a real candidate using ONLY the information below.

═══════════════════════════════════════════════
🧭 EXPERIENCE MODE: ${isFresherMode ? 'FRESHER / ENTRY-LEVEL (no experience provided)' : 'EXPERIENCED (experience metadata provided)'}
═══════════════════════════════════════════════
${
  isFresherMode
    ? '⚠️ The applicant has NOT provided ANY experience information. Treat as FRESHER. Do NOT claim or imply any experience, years, employer, role, project, internship, achievement, education, graduation, coursework, application, or activity. Skills may be stated as skills/foundation only — never claim how/where they were acquired or used. Still write a strong, complete, personalized letter.'
    : "✅ The applicant HAS provided experience METADATA (title / company / years). You may state that metadata factually. You MUST NOT invent responsibilities, tasks, projects, products, achievements, metrics, clients, results, or activities. Do NOT convert JD responsibilities into the applicant's past experience."
}

═══════════════════════════════════════════════
👤 APPLICANT
═══════════════════════════════════════════════
Name: ${data.userName}
${data.currentTitle ? `Current/Recent Title: ${data.currentTitle}` : ''}
${data.currentCompany ? `Current/Recent Company: ${data.currentCompany}` : ''}
${
  years
    ? `Years of Experience: ${years}`
    : isFresherMode
    ? 'Years of Experience: (NOT PROVIDED — FRESHER)'
    : 'Years of Experience: (Not specified)'
}

═══════════════════════════════════════════════
🎯 TARGET ROLE
═══════════════════════════════════════════════
Company: ${data.company}
Job Title: ${data.jobTitle}
${data.jobDescription ? `\nJob Description:\n${data.jobDescription}` : ''}

═══════════════════════════════════════════════
🛠️ APPLICANT'S SKILLS (ONLY SOURCE OF TRUTH)
═══════════════════════════════════════════════
${formattedSkills}

═══════════════════════════════════════════════
📋 FINAL INSTRUCTIONS
═══════════════════════════════════════════════
1. Use ONLY the skills listed above.
2. Do NOT invent skills, technologies, or experience.
3. If the JD mentions something NOT in the list → write around it.
4. ${
    isFresherMode
      ? 'Do NOT reference any current/recent role, employer, or years of experience (none provided).'
      : 'You may state the provided title/company/years factually. Do NOT invent responsibilities or tasks.'
  }
5. Do NOT include metrics, achievements, or company facts not provided.
6. Do NOT include email/phone/location in the body.
7. ${lengthTarget.level} level — write ${lengthTarget.min}-${lengthTarget.max} words (ideally 280-350).
8. Natural, simple, confident English — no corporate jargon.
9. ${
    isFresherMode
      ? 'Write as an ENTRY-LEVEL / FRESHER candidate: enthusiasm + provided skills as current foundation + alignment with the JD. NO experience claims. NO education/graduation/coursework/projects/internships/activities claims. NO origin/use context for skills.'
      : hasExperience
      ? 'Write as an EXPERIENCED candidate. State only the provided METADATA (title/company/years) and provided skills. Do NOT invent responsibilities, tasks, projects, achievements, metrics, clients, or results.'
      : 'Write as an early-career candidate using only provided skills.'
  }
10. Do NOT use the target company (${data.company}) as a past/current employer.
11. Do NOT include greeting, date, RE line, or signoff (template provides).
12. Do NOT start with any name, greeting, or salutation.
13. Start DIRECTLY with the first sentence of the body — typically
    "I am writing to..." or "I am excited to apply...".
14. Do NOT output placeholders like X years, [Your Name], [Company Name], etc.
15. Output ONLY the final body. Do NOT include reasoning, notes, or meta-commentary.
${fresherExtraInstruction}

Return ONLY the body paragraphs.`;

  try {
    const requestBody = {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: MAX_TOKENS,
      top_p: 0.9,
      include_reasoning: false,
    };

    console.log('📤 Sending cover letter request to backend proxy');

    const responseData = await makeRequestWithRetry(requestBody);

    let generatedText = extractTextFromResponse(
      responseData,
      data.hiringManagerName
    );

    if (!generatedText || generatedText.length < 50) {
      console.warn(
        '⚠️ Empty or too-short response. Full response:',
        responseData
      );
      throw new Error('AI returned empty response. Please try again.');
    }

    generatedText = cleanReasoningArtifacts(generatedText);
    generatedText = removeHiringManagerPrefix(
      generatedText,
      data.hiringManagerName
    );

    console.log(
      '🔍 AFTER CLEANUP (first 200 chars):',
      JSON.stringify(generatedText.slice(0, 200))
    );

    const stillHasInternalNotes =
      /Rewrite\s+P\d|Let me\s+think|Now\s+we\s+removed|I\s+need\s+to\s+revise/i.test(
        generatedText
      );
    if (stillHasInternalNotes) {
      throw new Error(
        'AI returned reasoning-only response without valid letter body'
      );
    }

    const wordCount = generatedText
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    console.log(
      `📊 Generated text word count: ${wordCount} (target: ${lengthTarget.min}-${lengthTarget.max})`
    );

    if (wordCount > lengthTarget.max + 80) {
      const paragraphs = generatedText
        .split(/\n\n+/)
        .filter((p) => p.trim().length > 0);
      if (paragraphs.length > 4) {
        const compressed = [paragraphs[0]];
        const bodyParagraphs = paragraphs.slice(1, -1);
        if (bodyParagraphs.length > 2) {
          const sorted = bodyParagraphs.sort(
            (a, b) => b.split(/\s+/).length - a.split(/\s+/).length
          );
          compressed.push(sorted[0], sorted[1]);
        } else {
          compressed.push(...bodyParagraphs);
        }
        compressed.push(paragraphs[paragraphs.length - 1]);
        generatedText = compressed.join('\n\n');
      }
    }

    return generatedText;
  } catch (error: any) {
    console.error('❌ Generate letter error:', error);

    const msg = error?.message || '';

    if (msg.includes('Model not found')) {
      throw new Error('AI model unavailable. Please contact support.');
    }
    if (msg.includes('Rate limit') || msg.includes('429')) {
      throw new Error('AI is busy. Please try again in a moment.');
    }
    if (msg.includes('not configured')) {
      throw new Error('AI service not configured. Please contact support.');
    }
    if (msg.includes('empty response')) {
      throw new Error('AI response was empty. Please try again.');
    }
    if (msg.includes('reasoning-only')) {
      throw new Error('AI returned invalid response. Please try again.');
    }

    throw new Error('AI is busy. Please try again in a moment.');
  }
};

// ============================================================
// ✅ ENHANCE COVER LETTER
// ============================================================
export const enhanceCoverLetter = async (
  originalLetter: string,
  optionId: string,
  userName: string,
  jobTitle: string,
  company: string
): Promise<string> => {
  if (!hasAnyKey()) {
    throw new Error('AI service not configured. Please contact support.');
  }

  const enhancementFrameworks: Record<string, string> = {
    professional:
      'Polished, natural professional tone. Simple, direct sentences. No corporate jargon.',
    persuasive:
      'Stronger value proposition using EXISTING facts only. No new claims.',
    ats: 'Better structure and clarity for ATS. Do NOT add new skills or metrics.',
    formal:
      'More formal but still natural. Professional vocabulary without jargon.',
    human: 'Warmer, more personal. Natural conversational tone.',
    expand: 'Add detail to EXISTING achievements only. No invented facts.',
    shorten: 'Tighter, more direct. Remove filler. Preserve facts.',
    closing: 'Stronger, more confident closing using existing facts.',
    grammar: 'Fix grammar, spelling, clarity. Do not add content.',
    executive:
      'More senior tone (only if user data supports it). No invented leadership.',
  };

  const enhancementFramework =
    enhancementFrameworks[optionId] || `Apply ${optionId} enhancement style`;

  const systemPrompt = `You are a career coach refining a cover letter.

${enhancementFramework}

═══════════════════════════════════════════════
🚫 OUTPUT = BODY ONLY
═══════════════════════════════════════════════
Do NOT include greeting, date, RE line, contact info, signoff, or signature.
Do NOT start with any name or greeting.
Output ONLY the body paragraphs.

═══════════════════════════════════════════════
🚫 PROHIBITIONS
═══════════════════════════════════════════════
- NEVER invent skills, achievements, metrics, projects, education, or company facts
- NEVER add facts not already in the original letter
- ONLY improve wording and structure of EXISTING content
- NEVER add experience, years, employers, or responsibilities not already present in the original letter
- NEVER add education, graduation status, coursework, internships, or academic background not already present in the original letter
- NEVER claim HOW or WHERE the applicant acquired or used their skills unless the original letter already states it
- NEVER convert the JD into the applicant's past responsibilities

═══════════════════════════════════════════════
📝 AVOID THESE PHRASES
═══════════════════════════════════════════════
technical acumen, collaborative spirit, strategic goals, professional aspirations, leveraging my expertise, synergy, results-driven, detail-oriented professional, proven track record, dynamic environment, excellent addition, contribute to continued success

═══════════════════════════════════════════════
📐 LENGTH
═══════════════════════════════════════════════
Preserve the original length (within 10%). Preserve all factual content.

Return ONLY the enhanced body text.`;

  const userPrompt = `Original letter body:
${originalLetter}

Enhancement: ${optionId}

Instructions:
1. Preserve length and factual content
2. Improve language per enhancement style
3. NEVER add fake information (no experience, years, employers, responsibilities, metrics, projects, education, graduation, coursework, internships)
4. NEVER add origin/use context for skills not already in the original letter
5. Target company "${company}" is NOT a past/current employer
6. Output ONLY the body
7. Do NOT start with any name or greeting

Return ONLY the enhanced body text.`;

  try {
    const requestBody = {
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: MAX_TOKENS,
      top_p: 0.9,
      include_reasoning: false,
    };

    const responseData = await makeRequestWithRetry(requestBody);

    let enhancedText = extractTextFromResponse(responseData);

    if (!enhancedText) {
      console.warn('⚠️ Empty enhance response. Full response:', responseData);
      throw new Error('AI returned empty response. Please try again.');
    }

    enhancedText = cleanReasoningArtifacts(enhancedText);
    enhancedText = removeHiringManagerPrefix(enhancedText);

    const wordCount = enhancedText
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
    console.log(`📊 Enhanced text word count: ${wordCount}`);

    return enhancedText;
  } catch (error: any) {
    console.error('Enhance error:', error);

    const msg = error?.message || '';
    if (msg.includes('Model not found')) {
      throw new Error('AI model unavailable. Please contact support.');
    }
    if (msg.includes('Rate limit') || msg.includes('429')) {
      throw new Error('AI is busy. Please try again in a moment.');
    }
    if (msg.includes('empty response')) {
      throw new Error('AI response was empty. Please try again.');
    }

    throw new Error('AI is busy. Please try again in a moment.');
  }
};

// ===== CHECK CONFIGURATION =====
export const isGroqConfigured = (): boolean => {
  const configured = hasAnyKey();
  console.log(
    '🔑 isGroqConfigured:',
    configured,
    `(${getConfiguredKeyCount()} available)`
  );
  return configured;
};