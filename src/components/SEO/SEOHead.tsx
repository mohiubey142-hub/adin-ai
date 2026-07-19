// ============================================
// SEOHead.tsx - Dynamic Meta Tags Component
// For: Google, Bing, DuckDuckGo, Brave, Yahoo
// And AI Crawlers: ChatGPT, Gemini, Claude, Perplexity
// ============================================

import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
  noFollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function SEOHead({
  title,
  description,
  keywords = "free cv builder, free cover letter, best cv builder, best cover letter, ai resume builder, professional cv maker, cover letter generator, career assistant, adin ai",
  canonicalUrl = "https://adin-ai.com/",
  ogImage = "https://adin-ai.com/og-image.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
  noFollow = false,
  publishedTime,
  modifiedTime,
  author = "Adin AI",
  section,
  tags,
}: SEOHeadProps) {
  
  // ✅ FIXED: Sirf 1 baar brand name, duplicate nahi
  // Pehle: "Free CV Builder & Cover Letter Maker | Adin AI - Free CV Builder & Cover Letter Maker"
  // Ab: "Free CV Builder & Cover Letter Maker | Adin AI"
  const fullTitle = `${title} | Adin AI`;
  
  const fullKeywords = keywords || "free cv builder, free cover letter, best cv builder, best cover letter, ai resume builder, professional cv maker, cover letter generator, career assistant, adin ai";
  
  let robotsContent = "index, follow";
  if (noIndex && noFollow) robotsContent = "noindex, nofollow";
  else if (noIndex) robotsContent = "noindex, follow";
  else if (noFollow) robotsContent = "index, nofollow";
  
  const url = canonicalUrl || "https://adin-ai.com/";
  const imageUrl = ogImage || "https://adin-ai.com/og-image.png";
  
  return (
    <Helmet>
      {/* BASIC META TAGS */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      
      {/* CANONICAL URL */}
      <link rel="canonical" href={url} />
      
      {/* OPEN GRAPH (Facebook, LinkedIn, etc.) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Adin AI" />
      <meta property="og:locale" content="en_US" />
      
      {/* TWITTER CARDS */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@adin_ai" />
      <meta name="twitter:creator" content="@adin_ai" />
      
      {/* ARTICLE META */}
      {ogType === "article" && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* ADDITIONAL META TAGS */}
      <meta name="theme-color" content="#8b5cf6" />
      <meta name="application-name" content="Adin AI" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* MOBILE OPTIMIZATION */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes, viewport-fit=cover" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* JSON-LD: WebApplication Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: fullTitle,
          url: url,
          description: description,
          applicationCategory: "Career Application",
          operatingSystem: "All",
          browserRequirements: "JavaScript enabled",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD"
          },
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: 4.8,
            ratingCount: 1250
          },
          author: {
            "@type": "Organization",
            name: "Adin AI"
          }
        })}
      </script>
      
      {/* JSON-LD: Breadcrumb Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://adin-ai.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "CV Builder",
              "item": "https://adin-ai.com/#cv-builder"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": "Cover Letter",
              "item": "https://adin-ai.com/#cover-letter"
            }
          ]
        })}
      </script>
    </Helmet>
  );
}