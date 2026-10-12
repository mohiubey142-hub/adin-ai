// api/ai/groq-keys.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const mask = (k?: string) =>
    k && k.length > 10 ? `${k.slice(0, 6)}…${k.slice(-4)}` : null;

  const experience = process.env.GROQ_API_KEY_EXPERIENCE;
  const project = process.env.GROQ_API_KEY_PROJECT;
  const achievement = process.env.GROQ_API_KEY_ACHIEVEMENT;
  const coverLetter = process.env.GROQ_API_KEY_COVER_LETTER;
  const summary = process.env.GROQ_API_KEY_SUMMARY;

  const count = [experience, project, achievement, coverLetter, summary].filter(
    (k) => !!k && k.trim().length > 0
  ).length;

  res.status(200).json({
    ok: true,
    count,
    features: {
      EXPERIENCE: mask(experience),
      PROJECT: mask(project),
      ACHIEVEMENT: mask(achievement),
      COVER_LETTER: mask(coverLetter),
      SUMMARY: mask(summary),
    },
  });
}