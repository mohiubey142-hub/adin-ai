// ============================================
// seoPages.ts - Page-Specific SEO Configurations
// All page titles, descriptions, and metadata
// ============================================

export interface PageSEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: "website" | "article" | "product";
}

// ============================================
// PAGE CONFIGURATIONS
// ============================================

export const SEO_PAGES: Record<string, PageSEOConfig> = {
  // ==========================================
  // HOME
  // ==========================================
  home: {
    title: "Adin AI - Pakistan's #1 AI Career Assistant",
    description: "Free CV builder, cover letter maker, and AI career assistant for Pakistani students, freelancers, and professionals. Create professional resumes and cover letters online.",
    keywords: "adin ai, adin ai Pakistan, Pakistan AI, ai career assistant, free cv builder, Pakistan cv builder, best free resume builder, ATS resume builder, resume builder Pakistan, cover letter generator, career AI, Pakistan students career AI, interview preparation AI, skill roadmap AI, freelancer cv builder, professional resume builder",
    canonicalUrl: "https://adin-ai.com/",
    ogType: "website"
  },

  // ==========================================
  // CV BUILDER
  // ==========================================
  "cv-builder": {
    title: "Free AI CV Builder - Create Professional Resume Online",
    description: "Build professional CV for free with Adin AI. Choose from 6 templates, add experience, education, skills, and download PDF. Pakistan's best free CV builder with ATS optimization.",
    keywords: "ai cv builder, free cv builder, Pakistan cv builder, resume builder, professional cv maker, ats resume builder, best free resume builder, cv creator online",
    canonicalUrl: "https://adin-ai.com/cv-builder",
    ogType: "website"
  },

  // ==========================================
  // COVER LETTER
  // ==========================================
  "cover-letter": {
    title: "Free AI Cover Letter Generator - Professional Cover Letters",
    description: "Create professional cover letters for free with Adin AI. AI-powered cover letter generator with templates. Perfect for job applications in Pakistan and worldwide.",
    keywords: "cover letter generator, free cover letter, ai cover letter maker, professional cover letter, job application, Pakistan cover letter",
    canonicalUrl: "https://adin-ai.com/cover-letter",
    ogType: "website"
  },

  // ==========================================
  // CV TEMPLATES
  // ==========================================
  templates: {
    title: "CV Templates - Professional Resume Templates Gallery",
    description: "Browse 6 professional CV templates - Modern, Classic, Minimal, Executive, Creative, Academic. Find the perfect resume template for your job application.",
    keywords: "cv templates, resume templates, professional cv templates, modern cv template, creative resume template, Pakistan cv templates",
    canonicalUrl: "https://adin-ai.com/templates",
    ogType: "website"
  },

  // ==========================================
  // COVER TEMPLATES
  // ==========================================
  "cover-templates": {
    title: "Cover Letter Templates - Professional Cover Letter Designs",
    description: "Browse professional cover letter templates. Perfect for job applications in Pakistan and around the world. Choose from multiple designs.",
    keywords: "cover letter templates, professional cover letter, job application, Pakistan cover letter",
    canonicalUrl: "https://adin-ai.com/cover-templates",
    ogType: "website"
  },

  // ==========================================
  // AI CHAT
  // ==========================================
  "ai-chat": {
    title: "AI Chat Assistant - Free Career Advice & Help",
    description: "Chat with Adin AI - your free career assistant. Get help with CV writing, interview preparation, skill roadmap, and career guidance.",
    keywords: "ai chat, career assistant, ai career help, interview preparation, skill roadmap, Pakistan career advice",
    canonicalUrl: "https://adin-ai.com/ai-chat",
    ogType: "website"
  },

  // ==========================================
  // WEB SEARCH
  // ==========================================
  "web-search": {
    title: "AI Web Search - Smart Career Research Tool",
    description: "Research careers, companies, and job opportunities with Adin AI's intelligent web search. Pakistan's smart career research tool.",
    keywords: "ai web search, career research, job search, Pakistan jobs, career exploration",
    canonicalUrl: "https://adin-ai.com/web-search",
    ogType: "website"
  },

  // ==========================================
  // LIBRARY
  // ==========================================
  library: {
    title: "Career Library - CV Templates & Career Resources",
    description: "Access free career resources, CV templates, cover letter samples, and professional guides. Pakistan's career resource library.",
    keywords: "career library, cv templates, resume samples, career resources, Pakistan career library",
    canonicalUrl: "https://adin-ai.com/library",
    ogType: "website"
  },

  // ==========================================
  // DOCUMENTS
  // ==========================================
  documents: {
    title: "My Documents - CV & Cover Letter Management",
    description: "Manage your CVs, cover letters, and career documents in one place. Free document management for Pakistani professionals.",
    keywords: "document management, cv management, cover letter management, career documents, Pakistan",
    canonicalUrl: "https://adin-ai.com/documents",
    ogType: "website"
  },

  // ==========================================
  // ABOUT ME
  // ==========================================
  "about-me": {
    title: "About Me - Personal Brand & Career Profile",
    description: "Create your professional profile for free. Showcase your skills, experience, and achievements. Pakistan's personal branding tool.",
    keywords: "about me, professional profile, personal branding, career profile, Pakistan",
    canonicalUrl: "https://adin-ai.com/about-me",
    ogType: "website"
  },

  // ==========================================
  // FOUNDER
  // ==========================================
  founder: {
    title: "Founder - Kian Mercer | Adin AI Pakistan",
    description: "Meet Kian Mercer (Ghulam MohiyuDin), the 16-year-old founder of Adin AI. A story of ambition, AI innovation, and building Pakistan's future in technology.",
    keywords: "kian mercer, ghulam mohiyudin, adin ai founder, Pakistan ai founder, young entrepreneur, 16 year old founder, Pakistan tech, ai innovation",
    canonicalUrl: "https://adin-ai.com/founder",
    ogType: "article"
  },

  // ==========================================
  // SETTINGS
  // ==========================================
  settings: {
    title: "Settings - Customize Your Adin AI Experience",
    description: "Personalize your Adin AI experience. Manage account settings, preferences, and more.",
    keywords: "settings, account settings, preferences, Pakistan",
    canonicalUrl: "https://adin-ai.com/settings",
    ogType: "website"
  },

  // ==========================================
  // PRIVACY POLICY
  // ==========================================
  "privacy-policy": {
    title: "Privacy Policy - Adin AI",
    description: "Read Adin AI's privacy policy. Learn how we protect your data and respect your privacy.",
    keywords: "privacy policy, data protection, privacy, Pakistan",
    canonicalUrl: "https://adin-ai.com/privacy-policy",
    ogType: "website"
  },

  // ==========================================
  // TERMS OF SERVICE
  // ==========================================
  "terms-of-service": {
    title: "Terms of Service - Adin AI",
    description: "Read Adin AI's terms of service. Understand the rules and guidelines for using our platform.",
    keywords: "terms of service, terms and conditions, Pakistan",
    canonicalUrl: "https://adin-ai.com/terms-of-service",
    ogType: "website"
  },

  // ==========================================
  // CONTACT
  // ==========================================
  contact: {
    title: "Contact Us - Adin AI Support",
    description: "Contact Adin AI team for support, feedback, or inquiries. We're here to help you build your career.",
    keywords: "contact, support, help, feedback, Pakistan",
    canonicalUrl: "https://adin-ai.com/contact",
    ogType: "website"
  },

  // ==========================================
  // LOGIN
  // ==========================================
  login: {
    title: "Login - Adin AI Career Platform",
    description: "Login to your Adin AI account. Access your CVs, cover letters, and career tools.",
    keywords: "login, sign in, account, Pakistan",
    canonicalUrl: "https://adin-ai.com/login",
    ogType: "website"
  },

  // ==========================================
  // SIGNUP
  // ==========================================
  signup: {
    title: "Sign Up - Free Adin AI Account",
    description: "Create your free Adin AI account. Start building professional CVs and cover letters today.",
    keywords: "signup, register, free account, Pakistan",
    canonicalUrl: "https://adin-ai.com/signup",
    ogType: "website"
  }
};

// ==========================================
// HELPER: Get SEO Config by Page Key
// ==========================================

export function getSEOConfig(pageKey: string): PageSEOConfig {
  const config = SEO_PAGES[pageKey];
  if (config) {
    return config;
  }
  // Fallback to home config
  return SEO_PAGES.home;
}