// ============================================================
// site.ts — SINGLE SOURCE OF TRUTH
// ============================================================
// ⚠️ FUTURE MEIN DOMAIN CHANGE KARNI HO TO
//    SIRF YEH FILE UPDATE KARO. BAS.
// ============================================================

export const SITE_CONFIG = {
  // ─────────────────────────────────────────────
  // 👇 DOMAIN — YAHAN CHANGE KARO FUTURE MEIN
  // ─────────────────────────────────────────────
  url: 'https://getadinai.com',

  // ─────────────────────────────────────────────
  // BRAND
  // ─────────────────────────────────────────────
  name: 'Adin AI',
  fullName: 'Adin AI — Free CV Builder, Cover Letter & Career Assistant',
  shortName: 'Adin AI',
  tagline: 'Free CV Builder, Cover Letter & Career Assistant',
  description:
    'Adin AI is a 100% free AI-powered career platform. Build professional CVs, generate cover letters, and get career help — no signup, no credit card, no ads.',
  locale: 'en_US',
  language: 'en',
  country: 'PK',
  countryName: 'Pakistan',
  region: 'PK',
  placename: 'Pakistan',

  // ─────────────────────────────────────────────
  // SOCIAL
  // ─────────────────────────────────────────────
  twitterHandle: '@adin_ai',
  twitterSite: '@adin_ai',

  // ─────────────────────────────────────────────
  // THEME
  // ─────────────────────────────────────────────
  themeColor: '#8b5cf6',
  tileColor: '#8b5cf6',

  // ─────────────────────────────────────────────
  // FOUNDER (for Person schema)
  // ─────────────────────────────────────────────
  founder: {
    name: 'Kian Mercer',
    title: 'Founder',
  },

  // ─────────────────────────────────────────────
  // CONTACT
  // ─────────────────────────────────────────────
  contact: {
    city: 'Mananwala',
    region: 'Sheikhupura',
    country: 'Pakistan',
    countryCode: 'PK',
  },

  // ─────────────────────────────────────────────
  // KEYWORDS — Global pool (used as fallback)
  // ─────────────────────────────────────────────
  defaultKeywords: [
    'free cv builder',
    'free cover letter generator',
    'free resume builder',
    'free career assistant',
    'free cv maker online',
    'ai cv builder free',
    'ai cover letter generator',
    'ats resume builder free',
    'free cv builder pakistan',
    'free resume builder pakistan',
    'pakistan cv format free',
    'adin ai',
  ].join(', '),
} as const;

// ─────────────────────────────────────────────
// COMPUTED — domain se auto bante hain
// ─────────────────────────────────────────────

/** Base site URL (no trailing slash) */
export const SITE_URL = SITE_CONFIG.url;

/** Full site name for titles */
export const SITE_NAME = SITE_CONFIG.name;

/** Full brand title */
export const SITE_FULL_NAME = SITE_CONFIG.fullName;

/** OG image URL (auto-derived from domain) */
export const OG_IMAGE = `${SITE_CONFIG.url}/og-image.png`;

/** Logo URL (auto-derived from domain) */
export const LOGO_URL = `${SITE_CONFIG.url}/logo.png`;

/** Twitter handle */
export const TWITTER_HANDLE = SITE_CONFIG.twitterHandle;

/** Canonical URL for a given path */
export const canonicalFor = (path: string): string => {
  if (!path) return SITE_CONFIG.url;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${clean}`;
};

/** Build a fully-qualified URL */
export const absoluteUrl = (path: string): string => canonicalFor(path);