// src/config/seoPages.ts
// ============================================================
// seoPages.ts — PER-PAGE SEO CONFIG
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

const DEFAULTS = {
  ogImage: OG_IMAGE,
  ogType: 'website' as const,
  twitterCard: 'summary_large_image' as const,
  noIndex: false,
  noFollow: false,
  applicationName: SITE_CONFIG.name,
  themeColor: SITE_CONFIG.themeColor,
};

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
  // BLOG
  // ══════════════════════════════════════════════
  blog: {
    // ✅ UPDATED: Added Cover Letter in title and description
    title: 'Career Tips, CV & Cover Letter Advice | Adin AI Blog',
    description:
      'Read the latest career tips, CV writing advice, cover letter guides, and AI insights to help you land your dream job in Pakistan.',
    keywords: [
      'career tips',
      'cv advice',
      'cover letter tips',
      'job search pakistan',
      'ai career',
      'adin ai blog',
      'resume tips',
    ].join(', '),
    canonicalUrl: canonicalFor('/blog'),
    ...DEFAULTS,
    ogType: 'website',
  },

  // ══════════════════════════════════════════════
  // TEMPLATES — CV
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
  // PUBLIC SEO LANDING — FREE CV BUILDER
  // ══════════════════════════════════════════════
  'free-cv-builder': {
    title: 'Free CV Builder Online — AI-Powered & ATS-Friendly',
    description:
      'Build a professional, ATS-friendly CV online for free with Adin AI. Pick a template, get AI help with your summary and experience, and download as PDF, PNG or TXT. No signup.',
    keywords: [
      'free cv builder',
      'cv builder online free',
      'ats friendly cv builder',
      'ai cv builder',
      'free cv maker online',
      'free cv builder pakistan',
      'adin ai',
    ].join(', '),
    canonicalUrl: canonicalFor('/free-cv-builder'),
    ...DEFAULTS,
  },

  // ══════════════════════════════════════════════
  // PUBLIC SEO LANDING — FREE COVER LETTER GENERATOR
  // ══════════════════════════════════════════════
  'free-cover-letter-generator': {
    title: 'Free Cover Letter Generator — AI-Powered, No Signup',
    description:
      'Generate a professional, tailored cover letter for free with Adin AI. Add your details and get an editable draft in seconds. No signup, no credit card.',
    keywords: [
      'free cover letter generator',
      'ai cover letter generator',
      'cover letter generator no signup',
      'free cover letter writer',
      'professional cover letter generator',
      'adin ai',
    ].join(', '),
    canonicalUrl: canonicalFor('/free-cover-letter-generator'),
    ...DEFAULTS,
  },

  // ══════════════════════════════════════════════
  // CV BUILDER (editor — indexed)
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
  },

  // ══════════════════════════════════════════════
  // COVER LETTER (editor — indexed)
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
  },

  // ══════════════════════════════════════════════
  // MY DOCUMENTS (indexed — shows onboarding to first-time visitors)
  // ══════════════════════════════════════════════
  'my-documents': {
    title: 'My Documents',
    description: 'Your saved CVs and cover letters.',
    keywords: 'my documents, my cvs, my cover letters',
    canonicalUrl: canonicalFor('/my-documents'),
    ...DEFAULTS,
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
    ogType: 'website',
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
    ogType: 'website',
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
    ogType: 'website',
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
    ogType: 'website',
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
  { path: '/free-cv-builder', priority: '0.95', changefreq: 'monthly' },
  { path: '/free-cover-letter-generator', priority: '0.95', changefreq: 'monthly' },
  { path: '/templates',       priority: '0.95', changefreq: 'weekly'  },
  { path: '/cover-templates', priority: '0.95', changefreq: 'weekly'  },
  { path: '/cv-builder',       priority: '0.90', changefreq: 'monthly' },
  { path: '/cover-letter',    priority: '0.90', changefreq: 'monthly' },
  { path: '/my-documents',    priority: '0.50', changefreq: 'monthly' },
  { path: '/blog',            priority: '0.90', changefreq: 'weekly'  },
  { path: '/founder',         priority: '0.70', changefreq: 'monthly' },
  { path: '/privacy-policy',  priority: '0.40', changefreq: 'monthly' },
  { path: '/terms-of-service',priority: '0.40', changefreq: 'monthly' },
  { path: '/contact',         priority: '0.60', changefreq: 'monthly' },
] as const;

// ─────────────────────────────────────────────
// ROBOTS — disallowed paths (private)
// ─────────────────────────────────────────────
export const ROBOTS_DISALLOW = [
  '/settings',
  '/profile',
] as const;

export { SITE_URL, OG_IMAGE };