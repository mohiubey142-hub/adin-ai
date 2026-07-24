// ============================================
// SEOHead.tsx - Dynamic Meta Tags Component
// PRODUCTION READY - All SEO tags
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
  // ✅ NEW: Additional SEO props
  applicationName?: string;
  themeColor?: string;
}

export function SEOHead({
  title,
  description,
  keywords = "free cv builder, free cover letter, best cv builder, best cover letter, ai resume builder, professional cv maker, cover letter generator, career assistant, adin ai, adin ai Pakistan, Pakistan CV builder, ATS resume builder, resume builder Pakistan, career AI, interview preparation, skill roadmap",
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
  applicationName = "Adin AI",
  themeColor = "#8b5cf6",
}: SEOHeadProps) {
  
  // ✅ Clean title - brand at end, no duplicates
  const fullTitle = `${title} | Adin AI`;
  
  // ✅ Keywords string
  const fullKeywords = keywords;
  
  // ✅ Robots directive
  let robotsContent = "index, follow, max-snippet:-1, max-image-preview:large";
  if (noIndex && noFollow) robotsContent = "noindex, nofollow";
  else if (noIndex) robotsContent = "noindex, follow";
  else if (noFollow) robotsContent = "index, nofollow";
  
  const url = canonicalUrl || "https://adin-ai.com/";
  const imageUrl = ogImage || "https://adin-ai.com/og-image.png";
  
  return (
    <Helmet>
      {/* ============================================
           BASIC META TAGS
           ============================================ */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* ============================================
           CANONICAL URL
           ============================================ */}
      <link rel="canonical" href={url} />
      
      {/* ============================================
           OPEN GRAPH (Facebook, LinkedIn, etc.)
           ============================================ */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Adin AI" />
      <meta property="og:locale" content="en_US" />
      
      {/* ============================================
           TWITTER CARDS
           ============================================ */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@adin_ai" />
      <meta name="twitter:creator" content="@adin_ai" />
      
      {/* ============================================
           ARTICLE META (if article type)
           ============================================ */}
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
      
      {/* ============================================
           ADDITIONAL META TAGS
           ============================================ */}
      <meta name="theme-color" content={themeColor} />
      <meta name="application-name" content={applicationName} />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* ============================================
           GEO TAGS (Local SEO)
           ============================================ */}
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Pakistan" />
      
    </Helmet>
  );
}