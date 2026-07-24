// ============================================
// seo.ts - Structured Data (JSON-LD) Utilities
// PRODUCTION READY - All Schemas
// ============================================

interface OrganizationSchemaProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  email?: string;
  phone?: string;
  foundingDate?: string;
  founder?: string;
  brandName?: string;
}

interface WebApplicationSchemaProps {
  name?: string;
  url?: string;
  description?: string;
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
  image?: string;
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
  authorName?: string;
  datePublished: string;
  dateModified?: string;
}

// ============================================
// ✅ ORGANIZATION SCHEMA
// ============================================

export function generateOrganizationSchema({
  name = "Adin AI",
  url = "https://adin-ai.com/",
  logo = "https://adin-ai.com/logo.png",
  description = "Free AI-powered CV builder and cover letter maker platform. Pakistan's leading career assistant for students, freelancers, and professionals.",
  sameAs = [
    "https://twitter.com/adin_ai",
    "https://linkedin.com/company/adin-ai"
  ],
  email = "support@adin-ai.com",
  phone = "",
  foundingDate = "2025",
  founder = "Kian Mercer (Ghulam MohiyuDin)",
  brandName = "Adin AI"
}: OrganizationSchemaProps = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    "alternateName": brandName,
    url,
    logo,
    description,
    sameAs,
    foundingDate,
    founder: {
      "@type": "Person",
      name: founder
    },
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
// ✅ WEBSITE SCHEMA
// ============================================

export function generateWebsiteSchema({
  name = "Adin AI",
  url = "https://adin-ai.com/",
  description = "Free AI-powered career platform. Create professional CV, cover letters, and get AI career assistance."
}: { name?: string; url?: string; description?: string } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://adin-ai.com/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// ============================================
// ✅ BRAND SCHEMA
// ============================================

export function generateBrandSchema({
  name = "Adin AI",
  logo = "https://adin-ai.com/logo.png",
  description = "Pakistan's leading AI career assistant platform."
}: { name?: string; logo?: string; description?: string } = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "Brand",
    name,
    logo,
    description,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.8,
      ratingCount: 1250
    }
  };
}

// ============================================
// ✅ WEB APPLICATION SCHEMA
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
  dateModified = "2026-07-24",
  image = "https://adin-ai.com/og-image.png"
}: WebApplicationSchemaProps = {}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    image,
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
// ✅ BREADCRUMB SCHEMA
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
// ✅ FAQ SCHEMA
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
// ✅ ARTICLE SCHEMA
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
// ✅ PERSON SCHEMA (Founder)
// ============================================

export function generatePersonSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Kian Mercer",
    "alternateName": "Ghulam MohiyuDin",
    "description": "Founder of Adin AI - Pakistan's AI-Powered Career Platform. 16-year-old AI product builder from Mananwala, Sheikhupura.",
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
// ✅ DEFAULT SCHEMAS (All in One)
// ============================================

export function generateDefaultSchemas() {
  return [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateBrandSchema(),
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
// ✅ PAGE SPECIFIC SCHEMAS
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
// ✅ HELPER: Generate JSON-LD Script
// ============================================

export function generateJSONLDScript(data: any): string {
  return JSON.stringify(data, null, 2);
}

// ============================================
// ✅ HELPER: Generate All Schemas for Page
// ============================================

export function generatePageSchemas(
  pageType: "home" | "cv-builder" | "cover-letter" | "ai-chat" | "about" | "settings" | "founder" | "templates"
) {
  const baseSchemas = [
    generateOrganizationSchema(),
    generateWebsiteSchema(),
    generateBrandSchema(),
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