// ============================================================
// SEOHead.tsx — Dynamic Meta Tags (React 19 native hoisting)
// ============================================================
// ✅ Uses site.ts for all domain-related values
// ✅ Future domain change = only site.ts update
// ============================================================

import { useEffect } from 'react';
import {
  SITE_CONFIG,
  SITE_URL,
  SITE_NAME,
  SITE_FULL_NAME,
  OG_IMAGE,
  canonicalFor,
} from '../../config/site';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  applicationName?: string;
  themeColor?: string;
}

export function SEOHead({
  title,
  description,
  keywords = SITE_CONFIG.defaultKeywords,
  canonicalUrl = SITE_URL,
  ogImage = OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  noFollow = false,
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
  section,
  tags,
  applicationName = SITE_CONFIG.name,
  themeColor = SITE_CONFIG.themeColor,
}: SEOHeadProps) {
  // ─────────────────────────────────────────────
  // index.html ke static SEO tags (data-static-seo) hata do — warna har page par
  // home ki canonical/description duplicate ho kar page-specific tags ko override karti thi
  // ─────────────────────────────────────────────
  useEffect(() => {
    document.head.querySelectorAll('[data-static-seo]').forEach((el) => el.remove());
  }, []);

  // ─────────────────────────────────────────────
  // TITLE — brand auto-appended (no duplicate)
  // ─────────────────────────────────────────────
  const needsBrand = !title.toLowerCase().includes('adin ai');
  const fullTitle = needsBrand ? `${title} | ${SITE_NAME}` : title;

  // ─────────────────────────────────────────────
  // ROBOTS
  // ─────────────────────────────────────────────
  let robotsContent = 'index, follow, max-snippet:-1, max-image-preview:large';
  if (noIndex && noFollow) robotsContent = 'noindex, nofollow';
  else if (noIndex) robotsContent = 'noindex, follow';
  else if (noFollow) robotsContent = 'index, nofollow';

  const url = canonicalUrl || SITE_URL;
  const imageUrl = ogImage || OG_IMAGE;

  return (
    <>
      {/* BASIC */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />

      {/* CANONICAL */}
      <link rel="canonical" href={url} />

      {/* OPEN GRAPH */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_FULL_NAME} />
      <meta property="og:locale" content={SITE_CONFIG.locale} />

      {/* TWITTER */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content={SITE_CONFIG.twitterSite} />
      <meta name="twitter:creator" content={SITE_CONFIG.twitterHandle} />

      {/* ARTICLE */}
      {ogType === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {author && <meta property="article:author" content={author} />}
          {section && <meta property="article:section" content={section} />}
          {tags && tags.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* ADDITIONAL */}
      <meta name="theme-color" content={themeColor} />
      <meta name="application-name" content={applicationName} />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta name="format-detection" content="telephone=no" />

      {/* GEO */}
      <meta name="geo.region" content={SITE_CONFIG.region} />
      <meta name="geo.placename" content={SITE_CONFIG.placename} />
    </>
  );
}