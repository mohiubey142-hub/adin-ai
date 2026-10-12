// api/ai/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

type Feature =
  | 'EXPERIENCE'
  | 'PROJECT'
  | 'ACHIEVEMENT'
  | 'COVER_LETTER'
  | 'SUMMARY';

const FALLBACK_ORDER: Record<Feature, Feature[]> = {
  EXPERIENCE: ['EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  PROJECT: ['PROJECT', 'EXPERIENCE', 'ACHIEVEMENT', 'COVER_LETTER', 'SUMMARY'],
  ACHIEVEMENT: ['ACHIEVEMENT', 'EXPERIENCE', 'PROJECT', 'COVER_LETTER', 'SUMMARY'],
  COVER_LETTER: ['COVER_LETTER', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'SUMMARY'],
  SUMMARY: ['SUMMARY', 'EXPERIENCE', 'PROJECT', 'ACHIEVEMENT', 'COVER_LETTER'],
};

const getKeyFor = (feature: Feature): string | undefined => {
  switch (feature) {
    case 'EXPERIENCE': return process.env.GROQ_API_KEY_EXPERIENCE;
    case 'PROJECT': return process.env.GROQ_API_KEY_PROJECT;
    case 'ACHIEVEMENT': return process.env.GROQ_API_KEY_ACHIEVEMENT;
    case 'COVER_LETTER': return process.env.GROQ_API_KEY_COVER_LETTER;
    case 'SUMMARY': return process.env.GROQ_API_KEY_SUMMARY;
  }
};

const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { feature, prompt, systemPrompt, options } = req.body || {};

  if (!feature || typeof feature !== 'string') {
    return res.status(400).json({ error: 'feature is required' });
  }
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'prompt is required' });
  }

  const order = FALLBACK_ORDER[feature as Feature] || [feature as Feature];
  const errors: string[] = [];

  for (const source of order) {
    const apiKey = getKeyFor(source);
    if (!apiKey || !apiKey.trim()) {
      errors.push(`No key for ${source}`);
      continue;
    }

    for (const model of MODELS) {
      try {
        const body: any = {
          model,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 4000,
          top_p: options?.top_p ?? 0.9,
          include_reasoning: false,
        };

        const groqRes = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          }
        );

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data?.choices?.[0]?.message?.content?.trim() || '';
          const finishReason = data?.choices?.[0]?.finish_reason;

          if (!content || content.length < 10) {
            errors.push(`${source}/${model}: empty content (finish=${finishReason})`);
            continue;
          }
          if (finishReason === 'length') {
            errors.push(`${source}/${model}: hit token limit`);
            continue;
          }

          return res.status(200).json({
            ok: true,
            text: content,
            source,
            model,
          });
        }

        if ([400, 401, 403, 429, 404].includes(groqRes.status)) {
          const txt = await groqRes.text();
          errors.push(`${source}/${model}: HTTP ${groqRes.status} ${txt.slice(0, 100)}`);
          continue;
        }

        const txt = await groqRes.text();
        errors.push(`${source}/${model}: HTTP ${groqRes.status} ${txt.slice(0, 100)}`);
      } catch (err: any) {
        errors.push(`${source}/${model}: ${err?.message || 'fetch failed'}`);
      }
    }
  }

  return res.status(502).json({
    ok: false,
    error: 'All Groq keys and models failed',
    details: errors,
  });
}