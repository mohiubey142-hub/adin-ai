// ============================================================
// seoPages.ts (utils) — BACKWARD-COMPAT SHIM
// ============================================================
// Purani imports ko break hone se bachane ke liye.
// Actual config src/config/seoPages.ts mein hai.
// ============================================================

export {
  getSEOConfig,
  SEO_PAGES,
  SITEMAP_PAGES,
  ROBOTS_DISALLOW,
} from '../config/seoPages';

export type { SEOConfig } from '../config/seoPages';