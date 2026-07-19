// src/components/cover-letter/services/groqService.ts

// ===== DIRECT GROQ API CALL (NO BACKEND) =====
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ===== API KEYS FROM .ENV =====
const API_KEYS: string[] = [
  import.meta.env.VITE_GROQ_API_KEY_1 || '',
  import.meta.env.VITE_GROQ_API_KEY_2 || '',
  import.meta.env.VITE_GROQ_API_KEY_3 || ''
].filter(key => key && key !== 'your_groq_api_key_here');

let currentKeyIndex = 0;

// ===== KEY COOLDOWN TRACKING =====
interface KeyStatus {
  cooldownUntil: number;
}

const keyStatuses: Map<number, KeyStatus> = new Map();
API_KEYS.forEach((_, index) => {
  keyStatuses.set(index, { cooldownUntil: 0 });
});

const COOLDOWN_DURATION = 60 * 1000;

// ===== GET NEXT AVAILABLE KEY =====
const getNextApiKey = (): { apiKey: string; keyIndex: number } => {
  if (API_KEYS.length === 0) {
    throw new Error('No GROQ API keys configured');
  }

  const now = Date.now();
  let checkedKeys = 0;

  while (checkedKeys < API_KEYS.length) {
    const index = currentKeyIndex % API_KEYS.length;
    const status = keyStatuses.get(index);

    if (!status || status.cooldownUntil <= now) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return { apiKey: API_KEYS[index], keyIndex: index };
    }

    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    checkedKeys++;
  }

  throw new Error('Traffic overload detected. Please try again after a few moments.');
};

const setKeyCooldown = (keyIndex: number): void => {
  const status = keyStatuses.get(keyIndex);
  if (status) {
    status.cooldownUntil = Date.now() + COOLDOWN_DURATION;
  }
};

const clearKeyCooldown = (keyIndex: number): void => {
  const status = keyStatuses.get(keyIndex);
  if (status) {
    status.cooldownUntil = 0;
  }
};

// ===== MAKE REQUEST WITH RETRY =====
const makeRequestWithRetry = async (
  requestBody: any,
  maxRetries: number = API_KEYS.length
): Promise<any> => {
  let lastError: Error | null = null;
  const triedKeys = new Set<number>();

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let apiKey: string;
      let keyIndex: number = -1;
      let keyFound = false;
      let attemptsInLoop = 0;

      while (attemptsInLoop < API_KEYS.length) {
        try {
          const result = getNextApiKey();
          apiKey = result.apiKey;
          keyIndex = result.keyIndex;

          if (!triedKeys.has(keyIndex)) {
            keyFound = true;
            break;
          }
          attemptsInLoop++;
        } catch (error) {
          attemptsInLoop++;
        }
      }

      if (!keyFound || keyIndex === -1) {
        continue;
      }

      triedKeys.add(keyIndex);
      console.log(`🔄 Attempt ${attempt + 1}/${maxRetries} with Key #${keyIndex + 1}`);

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`⚠️ Key #${keyIndex + 1} failed: ${response.status} - ${errorText}`);

        if (response.status === 429) {
          setKeyCooldown(keyIndex);
          lastError = new Error(`API Error: ${response.status} - ${errorText}`);
          continue;
        }

        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log(`✅ Request successful with Key #${keyIndex + 1}`);
      clearKeyCooldown(keyIndex);
      return responseData;

    } catch (error) {
      console.warn(`❌ Key attempt ${attempt + 1} failed:`, error);
      lastError = error as Error;
    }
  }

  throw new Error('Traffic overload detected. Please try again after a few moments.');
};

// ===== GENERATE COVER LETTER =====
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
}): Promise<string> => {

  console.log('🔑 Total API Keys available:', API_KEYS.length);

  if (API_KEYS.length === 0) {
    throw new Error('Traffic overload detected. Please try again after a few moments.');
  }

  const skillsList = data.skills ? data.skills.split(',').map(s => s.trim()).filter(s => s.length > 0) : [];
  const formattedSkills = skillsList.length > 0 ? skillsList.join(', ') : 'various skills';

  const educationParts = data.education ? data.education.split(',').map(s => s.trim()) : [];
  const degree = educationParts.length > 0 ? educationParts[0] : '';
  const university = educationParts.length > 1 ? educationParts[1] : '';

  // ===== STYLE FRAMEWORKS =====
  const styleFrameworks: Record<string, string> = {
    'professional': `PROFESSIONAL STYLE FRAMEWORK:
- OPENING: Start with a confident, formal introduction that immediately connects your experience to the company's needs
- VOCABULARY: Use sophisticated business terminology: "strategic," "implemented," "optimized," "delivered," "spearheaded," "exceeded," "streamlined"
- TONE: Balanced confidence with humility - assertive but respectful
- ATS EMPHASIS: Integrate industry-standard keywords naturally: "cross-functional collaboration," "stakeholder engagement," "KPI achievement," "process improvement"
- STRUCTURE: Clear topic sentences with evidence-based support; professional transitions ("Furthermore," "Additionally," "Consequently")
- ACHIEVEMENTS: Quantify results with metrics ($ amounts, percentages, time saved)
- COMPANY ALIGNMENT: Reference company goals and how your background supports them
- CLOSING: Professional call-to-action with confidence in your fit
- SENTENCES: Varied length with smooth, polished flow; occasional complex sentences
- FOCUS: Business outcomes, professional growth, organizational contribution`,

    'executive': `EXECUTIVE STYLE FRAMEWORK:
- OPENING: Start with strategic impact - "As a [role] with [years] of experience driving [business outcome]" or similar high-level positioning
- VOCABULARY: Executive-level language: "orchestrated," "transformed," "architected," "spearheaded," "governance," "strategic alignment," "organizational restructuring," "revenue optimization," "market expansion," "enterprise-wide"
- TONE: Authoritative, visionary, decisive - immediate leadership presence
- LEADERSHIP: Emphasize team management, board-level communication, cross-functional leadership
- STRATEGY: Show big-picture thinking, long-term planning, business transformation
- IMPACT: Focus on enterprise-level results, market share, organizational efficiency
- DECISION-MAKING: Demonstrate executive judgment, risk management, resource allocation
- LANGUAGE: Concise, powerful, forward-looking; avoid operational or tactical language
- STRUCTURE: Strategic overview → organizational impact → leadership achievements → future vision
- CLOSING: Vision-driven call-to-action with emphasis on partnership and strategic value
- SENTENCES: Commanding, authoritative cadence; bold statements with clear direction
- FOCUS: Transformational leadership, business growth, strategic partnerships`,

    'technical': `TECHNICAL STYLE FRAMEWORK:
- OPENING: Start with technical expertise and engineering approach to solving problems
- VOCABULARY: Technical precision: "architected," "implemented," "optimized," "debugged," "scaled," "deployed," "containerized," "automated"
- TECHNOLOGY FOCUS: Explicitly mention specific technologies: programming languages, frameworks, databases, cloud platforms, tools
- ENGINEERING MINDSET: Emphasize problem-solving, system thinking, and technical excellence
- ARCHITECTURE: Reference system design, scalable solutions, performance optimization, security considerations
- ACHIEVEMENTS: Quantify technical impact (performance improvements, error reduction, deployment speed)
- APPROACH: Detail technical challenges and solutions with engineering rigor
- LANGUAGE: Direct, precise, technical but accessible to non-technical readers
- STRUCTURE: Technical problem → innovative solution → measurable technical results
- CLOSING: Focus on technical contribution to the engineering team and product
- SENTENCES: Clear, logical, structured - like good technical documentation
- FOCUS: Code quality, system architecture, technical leadership, innovation`,

    'creative': `CREATIVE STYLE FRAMEWORK:
- OPENING: Start with a compelling hook - a question, observation, or unique perspective that captures attention
- VOCABULARY: Vivid, imaginative language: "crafted," "designed," "sculpted," "envisioned," "orchestrated"
- STORYTELLING: Weave narrative elements - the journey, the challenge, the transformation
- PERSONALITY: Show authentic voice; 80% professional, 20% personal flair
- STRUCTURE: Hook → narrative arc → key achievements → compelling conclusion
- TRANSITIONS: Creative bridges between ideas - "What began as... evolved into..."
- EXAMPLES: Paint vivid pictures of your work experience with specific, colorful details
- ORIGINALITY: Avoid clichés; find unique ways to express professional achievements
- LANGUAGE: Poetic but professional; rhythm and flow matter
- CLOSING: Memorable, resonant closing that leaves a strong impression
- SENTENCES: Varied, musical, sometimes shorter for impact, sometimes flowing and descriptive
- FOCUS: Innovation, creativity, problem-solving, unique perspective
- ATS NOTE: All creative elements must still incorporate relevant keywords`,

    'persuasive': `PERSUASIVE STYLE FRAMEWORK:
- OPENING: Strong value proposition - immediately demonstrate ROI and why you're the solution to their problem
- VOCABULARY: Compelling language: "proven," "demonstrated," "accelerated," "generated," "transformed"
- EMPLOYER FOCUS: Every sentence answers "What's in it for the employer?"
- BUSINESS BENEFITS: Connect every achievement to business value (profit, efficiency, growth)
- CONVINCING ARGUMENTS: Present a logical case with supporting evidence
- IMPACT: Exaggerate nothing - use real metrics and genuine value propositions
- STRUCTURE: Problem → solution → proof of success → irresistible closing
- LANGUAGE: Confident, assertive, persuasive - make them want to hire you immediately
- CALL-TO-ACTION: Strong closing that positions you as the obvious choice
- SENTENCES: Bold, declarative statements; compelling flow with clear logic
- FOCUS: Proven results, business value, competitive advantage, problem solving`,

    'confident': `CONFIDENT STYLE FRAMEWORK:
- OPENING: Bold, authoritative start that establishes credibility and presence
- VOCABULARY: Strong action verbs: "delivered," "achieved," "led," "developed," "implemented," "accelerated"
- OWNERSHIP: Use "I" statements that show responsibility and achievement
- RESULTS: Emphasize outcomes and performance with specific metrics
- ACHIEVEMENT-DRIVEN: Every paragraph highlights significant accomplishments
- LEADERSHIP LANGUAGE: Show initiative, ownership, and ability to drive results
- TONE: Self-assured but authentic - never arrogant or overpromising
- STRUCTURE: Authority → proven results → leadership examples → confident closing
- LANGUAGE: Decisive, direct, powerful - like someone who knows their value
- SENTENCES: Strong, definitive; varied but consistently assertive
- FOCUS: Leadership, results, initiative, professional excellence
- AUTHENTICITY: Ground all confidence in actual achievements`,

    'enthusiastic': `ENTHUSIASTIC STYLE FRAMEWORK:
- OPENING: Energized, passionate introduction that shows genuine excitement for the role
- VOCABULARY: Positive, energetic language: "thrilled," "passionate," "excited," "inspired," "curious," "driven"
- PASSION: Show genuine interest in the work and the company
- CURIOSITY: Express eagerness to learn and grow
- MOTIVATION: Explain what drives you professionally and why this role matters
- EXCITEMENT: Convey authentic enthusiasm for the opportunity
- STRUCTURE: Passionate hook → demonstrated interest → skills and contribution → enthusiastic closing
- LANGUAGE: Warm, engaging, positive - energy without being overwhelming
- SENTENCES: Energetic rhythm; shorter, punchier sentences mixed with flowing enthusiasm
- FOCUS: Passion for the field, desire to contribute, alignment with company mission
- BALANCE: Enthusiasm tempered with professionalism and substance`,

    'empathetic': `EMPATHETIC STYLE FRAMEWORK:
- OPENING: Warm, human-focused start that connects on a personal level
- VOCABULARY: Collaborative, caring language: "supported," "collaborated," "listened," "understood," "advocated"
- HUMAN CONNECTION: Focus on people, relationships, and understanding needs
- COLLABORATION: Emphasize teamwork, partnership, and shared success
- CUSTOMER FOCUS: Show dedication to service, user experience, and meeting needs
- EMOTIONAL INTELLIGENCE: Demonstrate ability to understand, empathize, and connect
- STRUCTURE: Human connection → service mindset → collaborative achievements → relationship-focused closing
- LANGUAGE: Warm, genuine, respectful - builds trust and rapport
- SENTENCES: Softer, more conversational; approachable and friendly cadence
- FOCUS: People, service, collaboration, understanding, team success`
  };

  const styleFramework = styleFrameworks[data.selectedStyle] || styleFrameworks['professional'];

  const systemPrompt = `You are an expert cover letter writer. Write ONLY the BODY of a professional cover letter.

${styleFramework}

IMPORTANT LENGTH GUIDELINES:
- Target length: 230-260 words
- Soft maximum: 280 words
- Hard maximum: 300 words
- If content exceeds 300 words, intelligently compress while preserving quality

COMPRESSION STRATEGY (if needed):
- Remove: repeated ideas, similar achievements, duplicate soft skills, generic motivational sentences, extra adjectives, filler lines, repeated excitement phrasing
- NEVER remove: company personalization, job title, user achievements, metrics, ATS keywords, core experience, technical skills, strong closing paragraph

WRITING QUALITY:
- Maintain natural, human-like English (should NOT sound AI-generated)
- Preserve current grammar quality
- Keep the specified style tone
- Strong opening and closing

IMPORTANT RULES:
1. DO NOT include "Sincerely," or any closing salutation
2. DO NOT include the user's name at the end
3. DO NOT include "Dear Hiring Manager" - it will be added separately
4. ONLY write the 3-4 body paragraphs of the letter
5. Start directly with the introduction paragraph
6. End with the closing paragraph (like "Thank you for your consideration...")
7. Use the style framework provided above
8. Make it unique and tailored to the user
9. Prioritize: Personalization > Job Matching > ATS Keywords > Achievements > Style Application > Professional Tone > Logical Flow
10. CRITICAL: NEVER mention the target company (${data.company}) as your current or past employer in achievements or experience sections
11. The target company should ONLY appear in: introduction, "why this company" paragraph, and closing

Return ONLY the body paragraphs, nothing else.`;

  const userPrompt = `Write the body of a cover letter for:
Name: ${data.userName}
Job: ${data.jobTitle}
Company: ${data.company}
Experience: ${data.experience || 'Not specified'}
Skills: ${formattedSkills}
Education: ${degree}${university ? ` from ${university}` : ''}
Projects: ${data.projects || 'Not specified'}
Achievements: ${data.additionalInfo || 'Not specified'}

Write 3-4 professional paragraphs for the cover letter body.

LENGTH REQUIREMENT:
- Generate approximately 230-260 words
- DO NOT exceed 300 words under any circumstances
- If you have too much content, intelligently summarize and remove redundancies
- Focus on quality over quantity

IMPORTANT: ${data.company} is the company you are applying to. NEVER use it as your current or past employer in your achievements or experience description. If you have current employer info, use that. If not, use generic terms like "Throughout my career" or "In my current role".

DO NOT include "Sincerely," or the name at the end.
DO NOT include "Dear Hiring Manager".
ONLY the body paragraphs.`;

  try {
    const requestBody = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
    };

    console.log('📤 Sending request to Groq with key rotation');

    const responseData = await makeRequestWithRetry(requestBody);

    let generatedText = responseData.choices?.[0]?.message?.content?.trim() || '';

    if (!generatedText || generatedText.length < 50) {
      throw new Error('Traffic overload detected. Please try again after a few moments.');
    }

    // ===== POST-PROCESSING: Length Check =====
    const wordCount = generatedText.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`📊 Generated text word count: ${wordCount}`);

    if (wordCount > 300) {
      const paragraphs = generatedText.split(/\n\n+/).filter(p => p.trim().length > 0);
      if (paragraphs.length > 4) {
        const compressed = [paragraphs[0]];
        const bodyParagraphs = paragraphs.slice(1, -1);
        if (bodyParagraphs.length > 2) {
          const sorted = bodyParagraphs.sort((a, b) => b.split(/\s+/).length - a.split(/\s+/).length);
          compressed.push(sorted[0], sorted[1]);
        } else {
          compressed.push(...bodyParagraphs);
        }
        compressed.push(paragraphs[paragraphs.length - 1]);
        generatedText = compressed.join('\n\n');
      }
    }

    return generatedText;

  } catch (error) {
    console.error('❌ Generate letter error:', error);
    throw new Error('Traffic overload detected. Please try again after a few moments.');
  }
};

// ===== ENHANCE COVER LETTER =====
export const enhanceCoverLetter = async (
  originalLetter: string,
  optionId: string,
  userName: string,
  jobTitle: string,
  company: string
): Promise<string> => {

  if (API_KEYS.length === 0) {
    throw new Error('Traffic overload detected. Please try again after a few moments.');
  }

  const enhancementFrameworks: Record<string, string> = {
    'professional': `PROFESSIONAL ENHANCEMENT:
- Make language more sophisticated and polished
- Strengthen business vocabulary and professional terminology
- Improve flow with better transitions
- Enhance ATS optimization with relevant keywords
- Balance confidence with professional humility
- Sharpen achievements with clearer metrics
- Maintain formal business tone throughout`,

    'persuasive': `PERSUASIVE ENHANCEMENT:
- Strengthen the value proposition
- Make every sentence employer-focused
- Add compelling arguments for why you're the best fit
- Connect achievements directly to business outcomes
- Create a stronger case for your candidacy
- Add conviction to the writing
- Strengthen the call to action`,

    'ats': `ATS OPTIMIZATION ENHANCEMENT:
- Add more relevant keywords and phrases
- Include industry-standard terminology
- Enhance keyword density without sounding unnatural
- Align with common ATS scanning patterns
- Add measurable metrics where possible
- Include specific technical and soft skills
- Ensure key qualifications are clearly stated`,

    'formal': `FORMAL ENHANCEMENT:
- Make language more formal and polished
- Use more sophisticated vocabulary
- Add professional business terminology
- Enhance the formality of transitions
- Make structure more traditional
- Add a more formal tone throughout
- Ensure proper business etiquette`,

    'human': `HUMANIZING ENHANCEMENT:
- Make it warmer and more personal
- Add more personality and authenticity
- Create more emotional connection
- Make it sound less AI-generated
- Add natural, conversational elements
- Include genuine enthusiasm
- Make it feel more authentic`,

    'expand': `EXPANSION ENHANCEMENT:
- Add more detail and depth to achievements
- Expand on key experiences
- Add more specific examples
- Provide more context for achievements
- Add supporting details to claims
- Strengthen the narrative with more information
- Ensure expansion stays within word limits`,

    'shorten': `CONCISE ENHANCEMENT:
- Make it more concise and direct
- Remove redundant phrases
- Tighten the language
- Make each sentence more efficient
- Remove any filler content
- Focus only on the most impactful information
- Make it more scannable and direct`,

    'closing': `CLOSING STRENGTHENING:
- Make the closing more impactful
- Add a stronger call to action
- Emphasize eagerness to contribute
- Make the closing more memorable
- Add confidence about fit
- Strengthen the final impression
- End on a powerful note`,

    'grammar': `GRAMMAR AND CLARITY ENHANCEMENT:
- Fix any grammar or spelling issues
- Improve sentence structure
- Enhance clarity and readability
- Fix any awkward phrasing
- Ensure proper punctuation
- Improve flow and coherence
- Polish the writing style`,

    'executive': `EXECUTIVE ENHANCEMENT:
- Rewrite at executive leadership level
- Focus on strategic and organizational impact
- Emphasize leadership and vision
- Add strategic planning language
- Focus on business transformation
- Include executive vocabulary
- Make it sound like C-level communication`
  };

  const enhancementFramework = enhancementFrameworks[optionId] || `Apply ${optionId} enhancement style`;

  const systemPrompt = `You are an expert cover letter writer. Enhance the cover letter body.

${enhancementFramework}

LENGTH GUIDELINES:
- Maintain professional length: 230-260 words
- Do NOT exceed 300 words
- If enhancing increases length, intelligently compress redundancies
- Preserve all critical content: personalization, ATS keywords, achievements

CRITICAL: NEVER mention the target company (${company}) as current or past employer in achievements. Target company should ONLY appear in introduction, "why this company" paragraph, and closing.

Return ONLY the enhanced body text. Do NOT add "Sincerely," or the name.`;

  const userPrompt = `Original letter body:
${originalLetter}

Enhancement: ${optionId}

IMPORTANT: Keep the enhanced version professionally optimized (230-260 words). Do not exceed 300 words.

IMPORTANT: ${company} is the company you are applying to. NEVER use it as your current or past employer in achievements. Use generic terms like "Throughout my career" if current employer is not specified.

Return ONLY the enhanced body text.`;

  try {
    const requestBody = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      top_p: 0.9,
    };

    const responseData = await makeRequestWithRetry(requestBody);

    let enhancedText = responseData.choices?.[0]?.message?.content?.trim() || '';

    if (!enhancedText) {
      throw new Error('Traffic overload detected. Please try again after a few moments.');
    }

    const wordCount = enhancedText.split(/\s+/).filter(w => w.length > 0).length;
    console.log(`📊 Enhanced text word count: ${wordCount}`);

    if (wordCount > 300) {
      const sentences = enhancedText.match(/[^.!?]+[.!?]+/g) || [enhancedText];
      if (sentences.length > 8) {
        const keep = [
          sentences[0], sentences[1],
          ...sentences.slice(2, -2).filter((_, i) => i % 2 === 0),
          sentences[sentences.length - 2], sentences[sentences.length - 1]
        ];
        enhancedText = keep.join(' ');
      }
    }

    return enhancedText;

  } catch (error) {
    console.error('Enhance error:', error);
    throw new Error('Traffic overload detected. Please try again after a few moments.');
  }
};

// ===== CHECK CONFIGURATION =====
export const isGroqConfigured = (): boolean => {
  const isConfigured = API_KEYS.length > 0;
  console.log('🔑 isGroqConfigured:', isConfigured, `(${API_KEYS.length} keys available)`);
  return isConfigured;
};