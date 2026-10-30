// src/config/toolLandingContent.ts
// ============================================================
// toolLandingContent.ts — PUBLIC SEO LANDING PAGES (content only)
//   /free-cv-builder
//   /free-cover-letter-generator
//
// ⚠️ Yeh sirf DATA hai (koi JSX/React nahi) — taake
//    1) src/pages/ToolLandingPage.tsx isse render kare, aur
//    2) scripts/prerender.mjs build ke waqt isi se static HTML bana sake.
//
// Text sirf wahi claims karta hai jo site par pehle se hain
// (free, no signup, PDF/PNG/TXT, ATS-friendly templates, AI writing help).
// ============================================================

import { canonicalFor } from './site';

export interface ToolLandingContent {
  slug: 'free-cv-builder' | 'free-cover-letter-generator';
  path: string;
  /** key in SEO_PAGES (seoPages.ts) */
  seoKey: string;
  /** primary CTA: CV flow ya Cover Letter flow */
  ctaTarget: 'cv' | 'cover-letter';
  breadcrumb: string;
  eyebrow: string;
  h1: string;
  intro: string;
  ctaLabel: string;
  ctaNote: string;
  highlights: string[];
  /** Hero fan: 5 template previews [leftBack, rightBack, midLeft, midRight, center] */
  fan: { src: string; alt: string; pill?: string }[];
  galleryTitle: string;
  gallerySubtitle: string;
  gallery: { name: string; subtitle: string; image: string }[];
  galleryCta: string;
  galleryHref: string;
  tipsTitle: string;
  tips: string[];
  featuresTitle: string;
  features: { title: string; text: string }[];
  stepsTitle: string;
  steps: { title: string; text: string }[];
  faqTitle: string;
  faqs: { q: string; a: string }[];
  guidesTitle: string;
  guides: { label: string; href: string }[];
  related: { label: string; href: string }[];
}

export const TOOL_LANDING_CONTENT: Record<
  'free-cv-builder' | 'free-cover-letter-generator',
  ToolLandingContent
> = {
  // ══════════════════════════════════════════════
  // FREE CV BUILDER
  // ══════════════════════════════════════════════
  'free-cv-builder': {
    slug: 'free-cv-builder',
    path: '/free-cv-builder',
    seoKey: 'free-cv-builder',
    ctaTarget: 'cv',
    breadcrumb: 'Free CV Builder',
    eyebrow: '100% free · No signup',
    h1: 'Free CV Builder: Create a Professional, ATS-Friendly CV Online',
    intro:
      'Adin AI is a 100% free CV builder with AI-powered writing help and a growing library of professional templates. Choose a design, fill in your details and download your CV as PDF, PNG or TXT — no signup and no credit card.',
    ctaLabel: 'Build My CV',
    ctaNote: 'Free · No credit card · No watermark',
    highlights: [
      '100% free',
      'No signup',
      'ATS-friendly templates',
      'PDF, PNG & TXT download',
      'AI writing help',
    ],
    fan: [
      { src: '/Templates/images/classic.webp', alt: 'Classic CV template' },
      { src: '/Templates/images/executive.webp', alt: 'Executive CV template' },
      { src: '/Templates/images/minimal.webp', alt: 'Minimal CV template' },
      { src: '/Templates/images/teal-curve.webp', alt: 'Teal Curve CV template' },
      { src: '/Templates/images/modern.webp', alt: 'Modern CV template', pill: 'CV Template' },
    ],
    galleryTitle: 'Choose a professional CV template',
    gallerySubtitle: 'Hand-crafted, ATS-friendly designs. Pick one and start building instantly.',
    gallery: [
      { name: 'Modern', subtitle: 'Purple Accent', image: '/Templates/images/modern.webp' },
      { name: 'Minimal', subtitle: 'Clean Layout', image: '/Templates/images/minimal.webp' },
      { name: 'Teal Curve', subtitle: 'Bold Teal Header', image: '/Templates/images/teal-curve.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/executive.webp' },
      { name: 'Creative', subtitle: 'Dark Sidebar', image: '/Templates/images/creative.webp' },
      { name: 'ATS Pro', subtitle: 'Maroon Accents', image: '/Templates/images/ats-pro.webp' },
    ],
    galleryCta: 'View all CV templates',
    galleryHref: '/templates',
    tipsTitle: 'ATS-friendly CV tips',
    tips: [
      'Use a simple, single-column layout on a white background.',
      'Stick to standard headings: Experience, Education, Skills and Projects.',
      'Mirror keywords from the job description wherever they honestly describe your work.',
      'Replace the old "Objective" line with a short Professional Summary that shows your value.',
      'Show results, not just duties — for example numbers and outcomes.',
      'Save your CV as a text-based PDF, not a scanned image.',
    ],
    featuresTitle: 'Everything you need to build a CV that gets noticed',
    features: [
      {
        title: 'AI-powered writing',
        text: 'Get help with your professional summary, experience descriptions and skills, so every section reads clearly and professionally.',
      },
      {
        title: 'ATS-friendly templates',
        text: 'Choose from modern, classic, minimal and executive designs, including ATS-friendly layouts that are easy for applicant tracking systems to read.',
      },
      {
        title: 'Instant download',
        text: 'Export your finished CV as a PDF, PNG or TXT file in one click.',
      },
      {
        title: 'No signup, no hidden charges',
        text: 'Start building right away. All features are free — no credit card and no watermark on your CV.',
      },
      {
        title: 'Secure and private',
        text: 'Your work is protected, with secure cloud sync so you do not lose the CVs you have built.',
      },
      {
        title: 'Made for job seekers in Pakistan',
        text: 'Adin AI is built with Pakistani job seekers in mind, with CV guides written for the local job market.',
      },
    ],
    stepsTitle: 'How to build your CV in 3 steps',
    steps: [
      {
        title: 'Choose a template',
        text: 'Browse the free CV templates and pick the design that suits your field.',
      },
      {
        title: 'Add your details',
        text: 'Fill in your education, experience and skills, and use AI to polish your summary and descriptions.',
      },
      {
        title: 'Download your CV',
        text: 'Preview your CV, then export it as a PDF, PNG or TXT file.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Is the Adin AI CV builder really free?',
        a: 'Yes. Adin AI is 100% free — there is no credit card, no hidden charges and no watermark.',
      },
      {
        q: 'Do I need to sign up to build a CV?',
        a: 'No signup is required to start building your CV.',
      },
      {
        q: 'Are the CV templates ATS-friendly?',
        a: 'Adin AI offers ATS-friendly CV templates. For the best results with applicant tracking systems, use a simple single-column layout, standard headings such as Experience, Education and Skills, and include keywords from the job description.',
      },
      {
        q: 'Which file formats can I download?',
        a: 'You can download your CV as a PDF, PNG or TXT file.',
      },
      {
        q: 'What does the AI help me write?',
        a: 'The AI helps with your professional summary, experience descriptions and skills section. You can review and edit everything before you download.',
      },
      {
        q: 'Can I build a CV if I have no work experience?',
        a: 'Yes. Put your education, projects, skills and any internships or volunteer work first. Our fresher CV guide explains how.',
      },
    ],
    guidesTitle: 'CV guides from the Adin AI blog',
    guides: [
      { label: 'ATS-Friendly CV Kya Hota Hai?', href: '/blog/ats-friendly-cv-kya-hai' },
      { label: 'Fresher CV Kaise Banayein?', href: '/blog/fresher-cv-kaise-banayein' },
      { label: 'Aapka CV In 5 Galtiyon Ki Wajah Se Reject Ho Sakta Hai', href: '/blog/naya-job-chahiye-cv-mistakes' },
    ],
    related: [
      { label: 'Free CV templates', href: '/templates' },
      { label: 'Free cover letter generator', href: '/free-cover-letter-generator' },
      { label: 'Free cover letter templates', href: '/cover-templates' },
    ],
  },

  // ══════════════════════════════════════════════
  // FREE COVER LETTER GENERATOR
  // ══════════════════════════════════════════════
  'free-cover-letter-generator': {
    slug: 'free-cover-letter-generator',
    path: '/free-cover-letter-generator',
    seoKey: 'free-cover-letter-generator',
    ctaTarget: 'cover-letter',
    breadcrumb: 'Free Cover Letter Generator',
    eyebrow: '100% free · No signup',
    h1: 'Free Cover Letter Generator: Write a Professional Cover Letter in Seconds',
    intro:
      'Adin AI is a free AI cover letter generator. Add your details, get a clear and professional draft in seconds, then edit it so it sounds like you. No signup and no credit card.',
    ctaLabel: 'Write My Cover Letter',
    ctaNote: 'Free · No credit card · No watermark',
    highlights: [
      '100% free',
      'No signup',
      'Editable AI draft',
      'Professional designs',
      'Instant download',
    ],
    fan: [
      { src: '/Templates/images/cover-classic.webp', alt: 'Classic cover letter template' },
      { src: '/Templates/images/cover-creative.webp', alt: 'Creative cover letter template' },
      { src: '/Templates/images/cover-modern.webp', alt: 'Modern cover letter template' },
      { src: '/Templates/images/cover-professional.webp', alt: 'Professional cover letter template' },
      { src: '/Templates/images/cover-executive.webp', alt: 'Executive cover letter template', pill: 'Cover Letter' },
    ],
    galleryTitle: 'Choose a professional cover letter template',
    gallerySubtitle: 'Six hand-crafted designs, from classic to creative. Pick one and start writing instantly.',
    gallery: [
      { name: 'Modern', subtitle: 'Teal Header', image: '/Templates/images/cover-modern.webp' },
      { name: 'Classic', subtitle: 'Timeless Formal', image: '/Templates/images/cover-classic.webp' },
      { name: 'Minimal', subtitle: 'Centered Header', image: '/Templates/images/cover-minimal.webp' },
      { name: 'Professional', subtitle: 'Dark Teal Bar', image: '/Templates/images/cover-professional.webp' },
      { name: 'Executive', subtitle: 'Navy & Gold', image: '/Templates/images/cover-executive.webp' },
      { name: 'Creative', subtitle: 'Black Band', image: '/Templates/images/cover-creative.webp' },
    ],
    galleryCta: 'View all cover letter templates',
    galleryHref: '/cover-templates',
    tipsTitle: 'Cover letter writing tips',
    tips: [
      'Greet the hiring manager by name if you can find it; otherwise use "Dear Hiring Manager".',
      'Open with the exact role and company, then one line on why you are a strong fit.',
      'Use the middle paragraph for one or two specific achievements, not a copy of your CV.',
      'Close with a thank-you and a clear note that you are ready for an interview.',
      'Keep it to three or four short paragraphs on a single page.',
      'Proofread twice before you send it.',
    ],
    featuresTitle: 'A cover letter that supports your CV',
    features: [
      {
        title: 'AI-written first draft',
        text: 'Add your details and get a professional, tailored draft in seconds. You stay in control and can edit every line.',
      },
      {
        title: 'Professional designs',
        text: 'Pick from classic, modern, minimal, executive, professional and creative cover letter templates.',
      },
      {
        title: 'Short and focused',
        text: 'A good cover letter has a clear introduction, a body about the value you bring and a polite closing, kept to one page.',
      },
      {
        title: 'Free to use',
        text: 'No signup, no credit card and no watermark on your cover letter.',
      },
      {
        title: 'Works with your CV',
        text: 'Use it together with the Adin AI CV builder so your CV and cover letter look professional and consistent.',
      },
      {
        title: 'Formal English drafts',
        text: 'Drafts are written in formal English, which suits most job applications in Pakistan.',
      },
    ],
    stepsTitle: 'How to write your cover letter in 3 steps',
    steps: [
      {
        title: 'Choose a design',
        text: 'Browse the free cover letter templates and pick a style that fits the job.',
      },
      {
        title: 'Add your details',
        text: 'Enter your details and let AI write a professional draft for you.',
      },
      {
        title: 'Review, edit and download',
        text: 'Read the draft, edit it so it reflects your own experience, then download your cover letter.',
      },
    ],
    faqTitle: 'Frequently asked questions',
    faqs: [
      {
        q: 'Is the cover letter generator free?',
        a: 'Yes. It is 100% free — there is no credit card, no hidden charges and no watermark.',
      },
      {
        q: 'Do I need an account to use it?',
        a: 'No signup is required to start writing your cover letter.',
      },
      {
        q: 'Can I edit the cover letter the AI writes?',
        a: 'Yes. The AI creates a draft that you should review and edit so it reflects your own experience and the job you are applying for.',
      },
      {
        q: 'How long should a cover letter be?',
        a: 'Keep it to one page: three to four short paragraphs covering who you are, what you can offer the company, and a polite thank-you with your availability for an interview.',
      },
      {
        q: 'Should I write my cover letter in English or Urdu?',
        a: 'For most jobs in Pakistan, use formal English and avoid Urdu or Roman Urdu words, unless the employer asks for something different.',
      },
      {
        q: 'What mistakes should I avoid in a cover letter?',
        a: 'Avoid a copy-pasted generic template, opening with "To Whom It May Concern", repeating your whole CV, spelling mistakes and letters longer than one page.',
      },
    ],
    guidesTitle: 'Cover letter guides from the Adin AI blog',
    guides: [
      { label: 'Cover Letter Kaise Likhein? (Pakistan Ke Liye Best Guide)', href: '/blog/cover-letter-kaise-likhein' },
      { label: 'Cover Letter Ki 5 Badi Galtiyan', href: '/blog/cover-letter-ki-5-badi-galtiyan' },
    ],
    related: [
      { label: 'Free cover letter templates', href: '/cover-templates' },
      { label: 'Free CV builder', href: '/free-cv-builder' },
      { label: 'Free CV templates', href: '/templates' },
    ],
  },
};

// ─────────────────────────────────────────────
// JSON-LD (FAQPage + BreadcrumbList) — component aur prerender dono use karte hain
// ─────────────────────────────────────────────
export const buildToolLandingSchema = (c: ToolLandingContent) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: c.faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Adin AI', item: canonicalFor('/') },
        { '@type': 'ListItem', position: 2, name: c.breadcrumb, item: canonicalFor(c.path) },
      ],
    },
  ],
});
