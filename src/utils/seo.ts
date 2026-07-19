// ============================================
// seo.ts - Structured Data (JSON-LD) Utilities
// For: Google, Bing, DuckDuckGo, Brave, Yahoo
// And AI Crawlers: ChatGPT, Gemini, Claude, Perplexity
// ============================================

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  email?: string;
  phone?: string;
}

interface WebApplicationSchemaProps {
  name: string;
  url: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  browserRequirements?: string;
  price?: string;
  priceCurrency?: string;
  ratingValue?: number;
  ratingCount?: number;
  author?: string;
  datePublished?: string;
  dateModified?: string;
}

interface BreadcrumbSchemaProps {
  items: { name: string; url: string }[];
}

interface FAQSchemaProps {
  questions: { question: string; answer: string }[];
}

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  authorName: string;
  datePublished: string;
  dateModified?: string;
}

// ============================================
// GENERATE ORGANIZATION SCHEMA
// ============================================

export function generateOrganizationSchema({
  name = "Adin AI",
  url = "https://adin-ai.com/",
  logo = "https://adin-ai.com/logo.png",
  description = "Free AI-powered CV builder and cover letter maker platform.",
  sameAs = [
    "https://twitter.com/adin_ai",
    "https://linkedin.com/company/adin-ai"
  ],
  email = "support@adin-ai.com",
  phone = "",
}: OrganizationSchemaProps = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    sameAs,
    ...(email && { email }),
    ...(phone && { telephone: phone }),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Support",
      ...(email && { email }),
      ...(phone && { telephone: phone })
    }
  };
}

// ============================================
// GENERATE WEB APPLICATION SCHEMA
// ============================================

export function generateWebApplicationSchema({
  name = "Adin AI",
  url = "https://adin-ai.com/",
  description = "Free CV Builder and Cover Letter Maker with AI-powered career assistance. Create professional resumes and cover letters online.",
  applicationCategory = "Career Application",
  operatingSystem = "All",
  browserRequirements = "JavaScript enabled",
  price = "0",
  priceCurrency = "USD",
  ratingValue = 4.8,
  ratingCount = 1250,
  author = "Adin AI",
  datePublished = "2025-01-01",
  dateModified = "2026-07-17",
}: WebApplicationSchemaProps = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory,
    operatingSystem,
    browserRequirements,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency
    },
    ...(ratingValue && ratingCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue,
        ratingCount
      }
    }),
    author: {
      "@type": "Organization",
      name: author
    },
    datePublished,
    dateModified
  };
}

// ============================================
// GENERATE BREADCRUMB SCHEMA
// ============================================

export function generateBreadcrumbSchema({
  items
}: BreadcrumbSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// ============================================
// GENERATE FAQ SCHEMA
// ============================================

export function generateFAQSchema({
  questions
}: FAQSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer
      }
    }))
  };
}

// ============================================
// GENERATE ARTICLE SCHEMA
// ============================================

export function generateArticleSchema({
  title,
  description,
  url,
  image = "https://adin-ai.com/og-image.png",
  authorName = "Adin AI",
  datePublished,
  dateModified,
}: ArticleSchemaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image,
    author: {
      "@type": "Organization",
      name: authorName
    },
    publisher: {
      "@type": "Organization",
      name: "Adin AI",
      logo: {
        "@type": "ImageObject",
        url: "https://adin-ai.com/logo.png"
      }
    },
    datePublished,
    ...(dateModified && { dateModified }),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  };
}

// ============================================
// GENERATE DEFAULT SCHEMA (ALL IN ONE)
// ============================================

export function generateDefaultSchemas() {
  return [
    generateOrganizationSchema(),
    generateWebApplicationSchema(),
    generateBreadcrumbSchema({
      items: [
        { name: "Home", url: "https://adin-ai.com/" },
        { name: "CV Builder", url: "https://adin-ai.com/cv-builder" },
        { name: "Cover Letter", url: "https://adin-ai.com/cover-letter" }
      ]
    })
  ];
}

// ============================================
// GENERATE CV BUILDER SCHEMA
// ============================================

export function generateCVBuilderSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free CV Builder - Create Professional Resume Online",
    description: "Build your professional CV for free with Adin AI. Choose from multiple templates, add your experience, and download PDF.",
    url: "https://adin-ai.com/cv-builder",
    about: {
      "@type": "Thing",
      name: "CV Builder"
    },
    mainEntity: {
      "@type": "WebApplication",
      name: "CV Builder",
      description: "Free online CV builder with professional templates",
      applicationCategory: "Career Application",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    }
  };
}

// ============================================
// GENERATE COVER LETTER SCHEMA
// ============================================

export function generateCoverLetterSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Free Cover Letter Maker - Professional Cover Letters",
    description: "Create professional cover letters for free with Adin AI. AI-powered cover letter generator with multiple templates.",
    url: "https://adin-ai.com/cover-letter",
    about: {
      "@type": "Thing",
      name: "Cover Letter Maker"
    },
    mainEntity: {
      "@type": "WebApplication",
      name: "Cover Letter Maker",
      description: "Free online cover letter generator with professional templates",
      applicationCategory: "Career Application",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD"
      }
    }
  };
}

// ============================================
// ✅ NEW: GENERATE PERSON SCHEMA (FOUNDER)
// ============================================

export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kian Mercer",
    "alternateName": "Ghulam MohiyuDin",
    "description": "Founder of Adin AI - AI-Powered Career Platform. 16-year-old AI product builder from Pakistan.",
    "url": "https://adin-ai.com/founder",
    "jobTitle": "Founder & CEO",
    "worksFor": {
      "@type": "Organization",
      "name": "Adin AI"
    },
    "nationality": {
      "@type": "Country",
      "name": "Pakistan"
    },
    "homeLocation": {
      "@type": "City",
      "name": "Mananwala, Sheikhupura, Pakistan"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Superior College"
    },
    "knowsAbout": [
      "AI Product Development",
      "Prompt Engineering",
      "AI-Assisted Development",
      "Product Strategy",
      "Startup Building",
      "AI Content Creation",
      "Digital Branding",
      "SEO Strategy",
      "Career Platform Design"
    ],
    "sameAs": [
      "https://adin-ai.com",
      "https://twitter.com/adin_ai"
    ],
    "age": "16",
    "birthPlace": {
      "@type": "City",
      "name": "Mananwala, Sheikhupura, Pakistan"
    }
  };
}

// ============================================
// HELPER: JSON-LD SCRIPT STRING
// ============================================

export function generateJSONLDScript(data: any): string {
  return JSON.stringify(data, null, 2);
}

// ============================================
// HELPER: GENERATE ALL SCHEMAS FOR A PAGE
// ============================================

export function generatePageSchemas(
  pageType: "home" | "cv-builder" | "cover-letter" | "ai-chat" | "about" | "settings" | "founder"
) {
  const baseSchemas = [
    generateOrganizationSchema(),
    generateWebApplicationSchema()
  ];

  switch (pageType) {
    case "home":
      return [
        ...baseSchemas,
        generateBreadcrumbSchema({
          items: [
            { name: "Home", url: "https://adin-ai.com/" }
          ]
        })
      ];
    case "cv-builder":
      return [
        ...baseSchemas,
        generateCVBuilderSchema(),
        generateBreadcrumbSchema({
          items: [
            { name: "Home", url: "https://adin-ai.com/" },
            { name: "CV Builder", url: "https://adin-ai.com/cv-builder" }
          ]
        })
      ];
    case "cover-letter":
      return [
        ...baseSchemas,
        generateCoverLetterSchema(),
        generateBreadcrumbSchema({
          items: [
            { name: "Home", url: "https://adin-ai.com/" },
            { name: "Cover Letter", url: "https://adin-ai.com/cover-letter" }
          ]
        })
      ];
    case "founder":
      return [
        ...baseSchemas,
        generatePersonSchema(),
        generateBreadcrumbSchema({
          items: [
            { name: "Home", url: "https://adin-ai.com/" },
            { name: "Founder", url: "https://adin-ai.com/founder" }
          ]
        })
      ];
    default:
      return baseSchemas;
  }
}