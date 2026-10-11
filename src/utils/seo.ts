// ============================================================
// seo.ts — JSON-LD structured data generators
// ============================================================

import {
  SITE_CONFIG,
  SITE_URL,
  SITE_NAME,
  SITE_FULL_NAME,
  LOGO_URL,
  OG_IMAGE,
} from '../config/site';

// ═══════════════════════════════════════════════
// ORGANIZATION
// ═══════════════════════════════════════════════
export const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: SITE_FULL_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
  image: OG_IMAGE,
  description: SITE_CONFIG.description,
  founder: {
    '@type': 'Person',
    name: SITE_CONFIG.founder.name,
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: SITE_CONFIG.contact.city,
    addressRegion: SITE_CONFIG.contact.region,
    addressCountry: SITE_CONFIG.contact.countryCode,
  },
  sameAs: [
    `https://twitter.com/${SITE_CONFIG.twitterHandle.replace('@', '')}`,
  ],
});

// ═══════════════════════════════════════════════
// WEBSITE (with sitelinks searchbox)
// ═══════════════════════════════════════════════
export const websiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: SITE_FULL_NAME,
  url: SITE_URL,
  description: SITE_CONFIG.description,
  inLanguage: SITE_CONFIG.language,
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
  },
});

// ═══════════════════════════════════════════════
// SOFTWARE APPLICATION (the app itself)
// ═══════════════════════════════════════════════
export const softwareAppSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: SITE_NAME,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1240',
    bestRating: '5',
    worstRating: '1',
  },
  description: SITE_CONFIG.description,
  url: SITE_URL,
  screenshot: OG_IMAGE,
  featureList: [
    'Free AI CV Builder',
    'Free Cover Letter Generator',
    'ATS-friendly templates',
    'AI-powered writing assistance',
    'PDF, PNG, TXT export',
    'Cloud backup and restore',
  ],
});

// ═══════════════════════════════════════════════
// BREADCRUMB
// ═══════════════════════════════════════════════
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
});

// ═══════════════════════════════════════════════
// FAQ (for home / feature pages)
// ═══════════════════════════════════════════════
export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: f.a,
    },
  })),
});

// ═══════════════════════════════════════════════
// PERSON (for founder page)
// ═══════════════════════════════════════════════
export const personSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_CONFIG.founder.name,
  jobTitle: SITE_CONFIG.founder.title,
  worksFor: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  },
  url: `${SITE_URL}/founder`,
});

// ═══════════════════════════════════════════════
// PAGE-SPECIFIC SCHEMA BUNDLES
// ═══════════════════════════════════════════════
export const generatePageSchemas = (pageKey: string): any[] => {
  const base = [websiteSchema()];

  switch (pageKey) {
    case 'home':
      return [
        ...base,
        organizationSchema(),
        softwareAppSchema(),
        faqSchema([
          {
            q: 'Is Adin AI really free?',
            a: 'Yes. Adin AI is 100% free — no credit card, no premium tiers, no ads. Every feature you see is included.',
          },
          {
            q: 'Do I need to sign up to build a CV?',
            a: 'No. You get a private Guest Account automatically — no email, no password, no signup required.',
          },
          {
            q: 'Can I download my CV as PDF?',
            a: 'Yes. You can export your CV as PDF, PNG, or TXT — free, anytime.',
          },
          {
            q: 'Are the CV templates ATS-friendly?',
            a: 'Yes. All our CV templates are designed to pass Applicant Tracking Systems (ATS) used by recruiters.',
          },
          {
            q: 'Can I restore my CV on another device?',
            a: 'Yes. Use your User ID and optional 4-digit PIN to restore all documents on any device.',
          },
        ]),
      ];

    case 'templates':
      return [
        ...base,
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'CV Templates', url: `${SITE_URL}/templates` },
        ]),
      ];

    case 'cover-templates':
      return [
        ...base,
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Cover Letter Templates', url: `${SITE_URL}/cover-templates` },
        ]),
      ];

    case 'founder':
      return [
        ...base,
        personSchema(),
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Founder', url: `${SITE_URL}/founder` },
        ]),
      ];

    case 'privacy-policy':
      return [
        ...base,
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Privacy Policy', url: `${SITE_URL}/privacy-policy` },
        ]),
      ];

    case 'terms-of-service':
      return [
        ...base,
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Terms of Service', url: `${SITE_URL}/terms-of-service` },
        ]),
      ];

    case 'contact':
      return [
        ...base,
        breadcrumbSchema([
          { name: 'Home', url: SITE_URL },
          { name: 'Contact', url: `${SITE_URL}/contact` },
        ]),
      ];

    case 'cv-builder':
    case 'cover-letter':
      return [softwareAppSchema()];

    default:
      return base;
  }
};

// ═══════════════════════════════════════════════
// Safe JSON-LD script generator
// ═══════════════════════════════════════════════
export const generateJSONLDScript = (schemas: any | any[]): string => {
  const arr = Array.isArray(schemas) ? schemas : [schemas];
  return JSON.stringify(arr.length === 1 ? arr[0] : arr);
};