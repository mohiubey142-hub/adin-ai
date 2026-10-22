// src/config/articles.ts
import { article1 } from './articles/article-1';
import { article2 } from './articles/article-2';
import { article3 } from './articles/article-3';
import { article4 } from './articles/article-4';
import { article5 } from './articles/article-5';
import { article6 } from './articles/article-6'; // ✅ Naya Article Import

// ✅ Article ke bottom par kaunsa CTA button dikhana hai
export type BlogCta = 'cv' | 'cover-letter';
export const DEFAULT_BLOG_CTA: BlogCta = 'cv';

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image?: string;
  author: string;
  cta?: BlogCta; // default: 'cv' — Cover Letter articles mein 'cover-letter' set karein
}

export const ARTICLES: BlogArticle[] = [
  article1,
  article2,
  article3,
  article4,
  article5,
  article6, // ✅ List mein add karein
];