// src/config/articles.ts
import { cvMistakesPakistan } from './articles/cv-mistakes-pakistan-job-rejection';
import { fresherCvPakistan } from './articles/fresher-cv-pakistan-no-experience';
import { atsFriendlyCvPakistan } from './articles/ats-friendly-cv-pakistan-guide';
import { howToWriteCoverLetterPakistan } from './articles/how-to-write-cover-letter-pakistan';
import { topSkillsPakistan2026 } from './articles/top-10-in-demand-skills-pakistan-2026';
import { coverLetterMistakesPakistan } from './articles/cover-letter-mistakes-pakistan';
import { onlineJobsPakistan } from './articles/how-to-apply-online-jobs-pakistan-rozee-linkedin-indeed';
import { atsKeywordOptimization } from './articles/ats-keyword-optimization-pakistan-step-by-step';
import { willAiTakeJobsPakistan } from './articles/will-ai-take-jobs-pakistan-2026';
import { chatgptForCvPakistan } from './articles/how-to-use-chatgpt-for-cv-pakistan';
import { remoteJobsPakistan } from './articles/how-to-find-remote-jobs-pakistan-avoid-scams';
import { cvGapPakistan } from './articles/how-to-explain-cv-gap-pakistan';
import { coverLetterTemplatePakistan } from './articles/cover-letter-template-pakistan-fresh-graduates';
import { pakistanJobMarketReality } from './articles/pakistan-job-market-reality-2026';
import { photoOnCvPakistan } from './articles/should-you-put-photo-on-cv-pakistan';
import { personalDetailsCvPakistan } from './articles/what-personal-details-to-put-on-cv-pakistan';
import { cvKaiseBanayePakistan } from './articles/cv-kaise-banaye-pakistan-guide';
import { jobApplicationLetterPakistan } from './articles/job-application-letter-format-pakistan';
import { interviewQuestionsPakistan } from './articles/common-interview-questions-pakistan-freshers';
import { cvForGulfJobsPakistan } from './articles/cv-for-gulf-jobs-from-pakistan';

export type BlogCta = 'cv' | 'cover-letter';
export const DEFAULT_BLOG_CTA: BlogCta = 'cv';

export interface BlogArticle {
  slug: string;
  title: string;
  /** Optional shorter title for the <title> tag / search results (keep <= 60 chars incl. brand). */
  seoTitle?: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image?: string;
  author: string;
  cta?: BlogCta;
}

export const ARTICLES: BlogArticle[] = [
  photoOnCvPakistan,
  personalDetailsCvPakistan,
  cvKaiseBanayePakistan,
  jobApplicationLetterPakistan,
  interviewQuestionsPakistan,
  cvForGulfJobsPakistan,
  cvMistakesPakistan,
  fresherCvPakistan,
  atsFriendlyCvPakistan,
  howToWriteCoverLetterPakistan,
  topSkillsPakistan2026,
  coverLetterMistakesPakistan,
  onlineJobsPakistan,
  atsKeywordOptimization,
  willAiTakeJobsPakistan,
  chatgptForCvPakistan,
  remoteJobsPakistan,
  cvGapPakistan,
  coverLetterTemplatePakistan,
  pakistanJobMarketReality,
];