// src/config/seoPages.ts
// ============================================================
// seoPages.ts — PER-PAGE SEO CONFIG
// ============================================================
// Har page ka unique title, description, keywords, canonical.
// Sab kuch site.ts se derive hota hai — domain change = 1 file.
//
// ✅ UPDATED: `templates` title + description no longer claim a fixed
//             template count. Replaced with a "growing library" framing
//             so the copy stays honest, evergreen, and SEO-safe as the
//             catalogue grows. No other page touched.
// ✅ UPDATED (Oct 2026): removed "no ads" (kept out on purpose) and the
//             "millions of job seekers" claim, removed the "gdpr" keyword
//             (tool is Pakistan-focused), and added noIndex entries for
//             onboarding / profile / settings so they never fall back to
//             the indexable home config.
// ============================================================

import { SITE_CONFIG, SITE_URL, canonicalFor, OG_IMAGE } from './site';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
  applicationName?: string;
  themeColor?: string;
}

// ─────────────────────────────────────────────
// DEFAULT (fallback for unknown pages)
// ─────────────────────────────────────────────
const DEFAULTS = {
  ogImage: OG_IMAGE,
  ogType: 'website' as const,
  twitterCard: 'summary_large_image' as const,
  noIndex: false,
  noFollow: false,
  applicationName: SITE_CONFIG.name,
  themeColor: SITE_CONFIG.themeColor,
};

// ─────────────────────────────────────────────
// ALL PAGES
// ─────────────────────────────────────────────
export const SEO_PAGES: Record<string, SEOConfig> = {
  // ══════════════════════════════════════════════
  // HOME
  // ══════════════════════════════════════════════
  home: {
    title: 'Free CV Builder, Cover Letter & Career Assistant',
    description:
      'Adin AI is a 100% free AI CV builder, cover letter generator and career assistant. Build professional, ATS-friendly CVs in minutes — no signup, no credit card.',
    keywords: [
      'free cv builder',
      'free cover letter generator',
      'free resume builder',
      'free career assistant',
      'ai cv builder',
      'ai resume builder',
      'free cv maker online',
      'ats cv builder',
      'professional cv builder free',
      'free cv builder pakistan',
      'adin ai',
    ].join(', '),
    canonicalUrl: canonicalFor('/'),
    ...DEFAULTS,
  },

  // ══════════════════════════════════════════════
  // TEMPLATES — CV
  // ✅ No fixed count in copy. "Growing library" framing keeps the
  //    metadata evergreen and SEO-safe as the catalogue expands.
  // ══════════════════════════════════════════════
  templates: {
    title: 'Free CV Templates — Professional & ATS-Friendly Designs',
    description:
      'Browse our growing library of free professional CV templates. Choose from modern, classic, minimal, executive, and ATS-friendly designs. Download instantly as PDF, PNG, or TXT — 100% free.',
    keywords: [
      'free cv templates',
      'professional cv templates',
      'ats cv templates',
      'modern cv template free',
      'free resume templates',
      'cv format pakistan free',
      'best free cv template',
      'cv template pdf free download',
      'creative cv template free',
      'simple cv template free',
      'growing cv template library',
      'new cv templates 2026',
    ].join(', '),
    canonicalUrl: canonicalFor('/templates'),
    ...DEFAULTS,
  },

  // ══════════════════════════════════════════════
  // TEMPLATES — COVER LETTER
  // ══════════════════════════════════════════════
  'cover-templates': {
    title: 'Free Cover Letter Templates — Professional Designs',
    description:
      'Choose from our growing collection of free professional cover letter templates — classic, modern, minimal, executive, professional, and creative. Generate and download instantly. No signup required.',
    keywords: [
      'free cover letter templates',
      'professional cover letter template',
      'cover letter format free',
      'ai cover letter generator',
      'free cover letter builder',
      'cover letter template pdf free',
      'modern cover letter template',
      'job application letter template free',
      'new cover letter templates 2026',
    ].join(', '),
    canonicalUrl: canonicalFor('/cover-templates'),
    ...DEFAULTS,
  },

  // ══════════════════════════════════════════════
  // CV BUILDER (editor — not indexed)
  // ══════════════════════════════════════════════
  'cv-builder': {
    title: 'Free AI CV Builder — Create a Professional CV in Minutes',
    description:
      'Build a professional, ATS-friendly CV for free with Adin AI. AI-powered summaries, experience descriptions, and skills enhancement. Export as PDF, PNG, or TXT instantly.',
    keywords: [
      'free cv builder',
      'ai cv builder',
      'ats resume builder',
      'free resume builder online',
      'professional cv maker',
      'cv maker free download',
      'cv builder pakistan',
      'free cv maker online',
      'ai resume writer free',
    ].join(', '),
    canonicalUrl: canonicalFor('/cv-builder'),
    ...DEFAULTS,
    noIndex: true, // editor page — not indexed
    noFollow: true,
  },

  // ══════════════════════════════════════════════
  // COVER LETTER (editor — not indexed)
  // ══════════════════════════════════════════════
  'cover-letter': {
    title: 'Free AI Cover Letter Generator',
    description:
      'Generate a tailored, professional cover letter in seconds with Adin AI. Powered by advanced AI — free, no signup required.',
    keywords: [
      'free cover letter generator',
      'ai cover letter writer',
      'cover letter builder free',
      'professional cover letter generator',
    ].join(', '),
    canonicalUrl: canonicalFor('/cover-letter'),
    ...DEFAULTS,
    noIndex: true,
    noFollow: true,
  },

  // ══════════════════════════════════════════════
  // MY DOCUMENTS (private)
  // ══════════════════════════════════════════════
  'my-documents': {
    title: 'My Documents',
    description: 'Your saved CVs and cover letters.',
    keywords: 'my documents, my cvs, my cover letters',
    canonicalUrl: canonicalFor('/my-documents'),
    ...DEFAULTS,
    noIndex: true,
    noFollow: true,
  },

  // ══════════════════════════════════════════════
  // FOUNDER
  // ══════════════════════════════════════════════
  founder: {
    title: 'Founder — Kian Mercer | Adin AI',
    description:
      'Meet Kian Mercer, founder of Adin AI — a free AI-powered career platform helping job seekers build professional CVs and cover letters.',
    keywords: [
      'adin ai founder',
      'kian mercer',
      'adin ai team',
      'career ai founder',
      'free resume builder founder',
    ].join(', '),
    canonicalUrl: canonicalFor('/founder'),
    ...DEFAULTS,
    ogType: 'article',
  },

  // ══════════════════════════════════════════════
  // APP-ONLY PAGES (never indexed)
  // ══════════════════════════════════════════════
  onboarding: {
    title: 'Welcome to Adin AI',
    description: 'Set up your Adin AI workspace.',
    keywords: 'adin ai',
    canonicalUrl: canonicalFor('/'),
    ...DEFAULTS,
    noIndex: true,
    noFollow: true,
  },
  profile: {
    title: 'Profile',
    description: 'Your Adin AI profile.',
    keywords: 'adin ai profile',
    canonicalUrl: canonicalFor('/profile'),
    ...DEFAULTS,
    noIndex: true,
    noFollow: true,
  },
  settings: {
    title: 'Settings',
    description: 'Your Adin AI settings.',
    keywords: 'adin ai settings',
    canonicalUrl: canonicalFor('/settings'),
    ...DEFAULTS,
    noIndex: true,
    noFollow: true,
  },

  // ══════════════════════════════════════════════
  // PRIVACY POLICY
  // ══════════════════════════════════════════════
  'privacy-policy': {
    title: 'Privacy Policy',
    description:
      'Read Adin AI\'s Privacy Policy. Learn how we protect your data, what we collect, and how we keep your CVs and cover letters private and secure.',
    keywords: [
      'adin ai privacy policy',
      'privacy policy',
      'data protection',
    ].join(', '),
    canonicalUrl: canonicalFor('/privacy-policy'),
    ...DEFAULTS,
    ogType: 'article',
  },

  // ══════════════════════════════════════════════
  // TERMS OF SERVICE
  // ══════════════════════════════════════════════
  'terms-of-service': {
    title: 'Terms of Service',
    description:
      'Read the Terms of Service for Adin AI — a free AI-powered CV builder, cover letter generator, and career assistant.',
    keywords: [
      'adin ai terms',
      'terms of service',
      'user agreement',
    ].join(', '),
    canonicalUrl: canonicalFor('/terms-of-service'),
    ...DEFAULTS,
    ogType: 'article',
  },

  // ══════════════════════════════════════════════
  // CONTACT
  // ══════════════════════════════════════════════
  contact: {
    title: 'Contact Us — Adin AI',
    description:
      'Have questions, feedback, or need support? Contact the Adin AI team — we typically respond within 24-48 hours.',
    keywords: [
      'contact adin ai',
      'adin ai support',
      'cv builder support',
      'career assistant contact',
    ].join(', '),
    canonicalUrl: canonicalFor('/contact'),
    ...DEFAULTS,
    ogType: 'article',
  },
};

// ─────────────────────────────────────────────
// HELPER — get config for a page key
// ─────────────────────────────────────────────
export const getSEOConfig = (pageKey: string): SEOConfig => {
  return SEO_PAGES[pageKey] ?? SEO_PAGES.home;
};

// ─────────────────────────────────────────────
// SITEMAP DATA — public, indexable pages only
// ─────────────────────────────────────────────
export const SITEMAP_PAGES = [
  { path: '/',                priority: '1.0',  changefreq: 'daily'   },
  { path: '/templates',       priority: '0.95', changefreq: 'weekly'  },
  { path: '/cover-templates', priority: '0.95', changefreq: 'weekly'  },
  { path: '/founder',         priority: '0.70', changefreq: 'monthly' },
  { path: '/privacy-policy',  priority: '0.40', changefreq: 'monthly' },
  { path: '/terms-of-service',priority: '0.40', changefreq: 'monthly' },
  { path: '/contact',         priority: '0.60', changefreq: 'monthly' },
] as const;

// ─────────────────────────────────────────────
// ROBOTS — disallowed paths (private)
// ─────────────────────────────────────────────
export const ROBOTS_DISALLOW = [
  '/cv-builder',
  '/cover-letter',
  '/my-documents',
  '/settings',
  '/profile',
] as const;

export { SITE_URL, OG_IMAGE };