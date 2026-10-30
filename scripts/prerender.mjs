// scripts/prerender.mjs
// ============================================================
// Build ke BAAD chalta hai (vite build -> node scripts/prerender.mjs)
//
// Kya karta hai:
//  1. dist/index.html ko template bana kar har public page ke liye
//     dist/<route>/index.html banata hai (per-page title, description,
//     canonical, og/twitter tags + crawlers ke liye asli text aur links).
//  2. Blog posts ka poora text (react-markdown se, wahi HTML jo app dikhati hai)
//     HTML mein daalta hai + Article JSON-LD.
//  3. dist/sitemap.xml articles se khud-ba-khud banata hai.
//
// Koi nayi dependency nahi: esbuild, react, react-dom, react-markdown
// pehle se package.json mein hain.
//
// App ka behaviour nahi badalta: React load hote hi #root ka content replace kar
// deta hai, aur SEOHead [data-static-seo] tags hata kar apne tags laga deta hai.
// ============================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';

const ROOT = process.env.PRERENDER_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const STRICT = process.env.PRERENDER_STRICT === '1';

const START = '<!--SEO_FALLBACK_START-->';
const END = '<!--SEO_FALLBACK_END-->';

// ---------- helpers ----------
const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rel = (p) => path.join(ROOT, p);

// "October 16, 2026" -> "2026-10-16" (local parts, timezone shift se bachne ke liye)
function toIsoDate(str) {
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return undefined;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function loadData() {
  const seoPath = ['src/config/seoPages.ts', 'src/utils/seoPages.ts'].find(
    (p) => fs.existsSync(rel(p)) && fs.readFileSync(rel(p), 'utf8').includes('SEO_PAGES')
  );
  if (!seoPath) throw new Error('seoPages.ts nahi mili (src/config ya src/utils)');
  if (!fs.existsSync(rel('src/config/site.ts'))) throw new Error('src/config/site.ts nahi mili');

  const articlesDir = 'src/config/articles';
  const files = fs.existsSync(rel(articlesDir))
    ? fs
        .readdirSync(rel(articlesDir))
        .filter((f) => /^article-\d+\.tsx?$/.test(f))
        .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))
    : [];

  const imports = files
    .map((f, i) => `import * as a${i} from './${articlesDir}/${f.replace(/\.tsx?$/, '')}';`)
    .join('\n');
  const entry = `${imports}
export * from './src/config/site';
export { SEO_PAGES, SITEMAP_PAGES } from './${seoPath.replace(/\.ts$/, '')}';
export const ARTICLES = [${files.map((_, i) => `...Object.values(a${i})`).join(', ')}].filter((a) => a && a.slug);
${fs.existsSync(rel('src/config/toolLandingContent.ts')) ? "export { TOOL_LANDING_CONTENT, buildToolLandingSchema } from './src/config/toolLandingContent';" : 'export const TOOL_LANDING_CONTENT = {}; export const buildToolLandingSchema = () => null;'}
`;

  const result = await build({
    stdin: { contents: entry, resolveDir: ROOT, loader: 'ts', sourcefile: 'prerender-entry.ts' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}

// ---------- main ----------
async function main() {
  const tplPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(tplPath)) throw new Error('dist/index.html nahi mili — pehle vite build chalayein');
  const template = fs.readFileSync(tplPath, 'utf8');

  const D = await loadData();
  const { SITE_CONFIG, SITE_URL, SITE_NAME, SITE_FULL_NAME, OG_IMAGE, LOGO_URL, canonicalFor, absoluteUrl, SEO_PAGES, SITEMAP_PAGES } = D;
  const ARTICLES = [...D.ARTICLES].sort((a, b) => (toIsoDate(b.date) || '').localeCompare(toIsoDate(a.date) || ''));

  const warnMarkers = !(template.includes(START) && template.includes(END));
  if (warnMarkers) console.warn('[prerender] ⚠️  SEO_FALLBACK markers dist/index.html mein nahi mile — sirf head tags update honge');

  // ----- shared pieces -----
  const navHtml = `<nav aria-label="Adin AI pages">
          <a href="/">Home</a>
          <a href="/templates">Free CV Templates</a>
          <a href="/free-cv-builder">Free CV Builder</a>
          <a href="/free-cover-letter-generator">Free Cover Letter Generator</a>
          <a href="/cover-templates">Free Cover Letter Templates</a>
          <a href="/cv-builder">Free AI CV Builder</a>
          <a href="/cover-letter">Free AI Cover Letter Generator</a>
          <a href="/my-documents">My Documents</a>
          <a href="/blog">Career Tips, CV &amp; Cover Letter Blog</a>
          <a href="/founder">Founder</a>
          <a href="/contact">Contact</a>
          <a href="/privacy-policy">Privacy Policy</a>
          <a href="/terms-of-service">Terms of Service</a>
        </nav>`;

  const headBlock = ({ title, description, keywords, canonical, ogType = 'website', ogImage = OG_IMAGE, jsonld }) => {
    const needsBrand = !title.toLowerCase().includes('adin ai');
    const fullTitle = needsBrand ? `${title} | ${SITE_NAME}` : title;
    const S = 'data-static-seo'; // SEOHead mount par inhe hata deta hai
    const robots = 'index, follow, max-snippet:-1, max-image-preview:large';
    return {
      title: `<title>${esc(fullTitle)}</title>`,
      tags: [
        `<meta ${S} name="description" content="${esc(description)}" />`,
        `<meta ${S} name="keywords" content="${esc(keywords || SITE_CONFIG.defaultKeywords)}" />`,
        `<meta ${S} name="author" content="${esc(SITE_NAME)}" />`,
        `<meta ${S} name="robots" content="${robots}" />`,
        `<link ${S} rel="canonical" href="${esc(canonical)}" />`,
        `<meta ${S} property="og:title" content="${esc(fullTitle)}" />`,
        `<meta ${S} property="og:description" content="${esc(description)}" />`,
        `<meta ${S} property="og:type" content="${ogType}" />`,
        `<meta ${S} property="og:url" content="${esc(canonical)}" />`,
        `<meta ${S} property="og:image" content="${esc(ogImage)}" />`,
        `<meta ${S} property="og:image:width" content="1200" />`,
        `<meta ${S} property="og:image:height" content="630" />`,
        `<meta ${S} property="og:site_name" content="${esc(SITE_FULL_NAME)}" />`,
        `<meta ${S} property="og:locale" content="${esc(SITE_CONFIG.locale)}" />`,
        `<meta ${S} name="twitter:card" content="summary_large_image" />`,
        `<meta ${S} name="twitter:title" content="${esc(fullTitle)}" />`,
        `<meta ${S} name="twitter:description" content="${esc(description)}" />`,
        `<meta ${S} name="twitter:image" content="${esc(ogImage)}" />`,
        `<meta ${S} name="twitter:site" content="${esc(SITE_CONFIG.twitterSite)}" />`,
        `<meta ${S} name="twitter:creator" content="${esc(SITE_CONFIG.twitterHandle)}" />`,
        `<meta ${S} name="geo.region" content="${esc(SITE_CONFIG.region)}" />`,
        `<meta ${S} name="geo.placename" content="${esc(SITE_CONFIG.placename)}" />`,
        jsonld
          ? `<script ${S} type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`
          : '',
      ]
        .filter(Boolean)
        .join('\n    '),
    };
  };

  const renderPage = ({ head, bodyHtml }) => {
    let html = template;
    // purane static SEO tags + title hata do
    html = html.replace(/<script\b[^>]*\bdata-static-seo\b[^>]*>[\s\S]*?<\/script>\s*/g, '');
    html = html.replace(/<(?:meta|link)\b[^>]*\bdata-static-seo\b[^>]*>\s*/g, '');
    html = html.replace(/<title>[\s\S]*?<\/title>\s*/, '');
    html = html.replace('</head>', `    ${head.title}\n    ${head.tags}\n  </head>`);
    if (warnMarkers) return html;
    const s = html.indexOf(START);
    const e = html.indexOf(END);
    return html.slice(0, s + START.length) + '\n        ' + bodyHtml + '\n        ' + html.slice(e);
  };

  const written = [];
  const writeRoute = (routePath, html) => {
    const file = routePath === '/' ? path.join(DIST, 'index.html') : path.join(DIST, routePath.replace(/^\//, ''), 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
    written.push(routePath);
  };

  // ----- static pages -----
  for (const page of SITEMAP_PAGES) {
    const key = page.path === '/' ? 'home' : page.path.replace(/^\//, '');
    const seo = SEO_PAGES[key];
    if (!seo) { console.warn(`[prerender] SEO config nahi mili: ${key}`); continue; }

    let bodyExtra = '';
    if (key === 'blog') {
      bodyExtra = `<ul>${ARTICLES.map(
        (a) => `<li><h2><a href="/blog/${esc(a.slug)}">${esc(a.title)}</a></h2><p>${esc(a.excerpt)}</p></li>`
      ).join('')}</ul>`;
    }
    if (key === 'cv-builder') {
      bodyExtra = `<p>Free AI CV builder: AI-powered summaries, experience descriptions and skills enhancement. Choose from free ATS-friendly <a href="/templates">CV templates</a> and export your CV as PDF, PNG or TXT. No signup required. Need ideas? Read our <a href="/blog">CV writing tips</a>.</p>`;
    }
    if (key === 'cover-letter') {
      bodyExtra = `<p>Free AI cover letter generator: add your details and get a professional, tailored draft in seconds that you can edit. Pick a design from our <a href="/cover-templates">cover letter templates</a>. No signup required. Read our <a href="/blog">cover letter guides</a>.</p>`;
    }
    if (key === 'my-documents') {
      bodyExtra = `<p>Your saved CVs and cover letters in one place. Create a new one with the <a href="/cv-builder">free AI CV builder</a> or the <a href="/cover-letter">free AI cover letter generator</a>.</p>`;
    }
    const tool = (D.TOOL_LANDING_CONTENT || {})[key];
    let bodyHtml = `<h1>${esc(seo.title)}</h1>
        <p>${esc(seo.description)}</p>
        ${bodyExtra}
        ${navHtml}`;
    let toolSchema;
    if (tool) {
      bodyHtml = `<h1>${esc(tool.h1)}</h1>
        <p>${esc(tool.intro)}</p>
        <ul>${tool.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        <h2>${esc(tool.galleryTitle)}</h2>
        <p>${esc(tool.gallerySubtitle)}</p>
        <ul>${tool.gallery.map((t) => `<li>${esc(t.name)} — ${esc(t.subtitle)}</li>`).join('')}</ul>
        <p><a href="${esc(tool.galleryHref)}">${esc(tool.galleryCta)}</a></p>
        <h2>${esc(tool.featuresTitle)}</h2>
        ${tool.features.map((f) => `<h3>${esc(f.title)}</h3><p>${esc(f.text)}</p>`).join('')}
        <h2>${esc(tool.stepsTitle)}</h2>
        <ol>${tool.steps.map((s) => `<li><strong>${esc(s.title)}</strong> — ${esc(s.text)}</li>`).join('')}</ol>
        <h2>${esc(tool.tipsTitle)}</h2>
        <ul>${tool.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <h2>${esc(tool.faqTitle)}</h2>
        ${tool.faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}
        <h2>${esc(tool.guidesTitle)}</h2>
        <ul>${tool.guides.map((g) => `<li><a href="${esc(g.href)}">${esc(g.label)}</a></li>`).join('')}</ul>
        <ul>${tool.related.map((r) => `<li><a href="${esc(r.href)}">${esc(r.label)}</a></li>`).join('')}</ul>
        ${navHtml}`;
      toolSchema = D.buildToolLandingSchema(tool);
    }

    const head = headBlock({
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords,
      canonical: seo.canonicalUrl,
      ogType: seo.ogType || 'website',
      ogImage: key === 'founder' ? `${SITE_URL}/founder-og.jpg` : OG_IMAGE,
      jsonld: toolSchema,
    });
    writeRoute(page.path, renderPage({ head, bodyHtml }));
  }

  // ----- blog posts -----
  for (const a of ARTICLES) {
    const url = canonicalFor(`/blog/${a.slug}`);
    const iso = toIsoDate(a.date);
    const imageUrl = a.image ? (/^https?:\/\//.test(a.image) ? a.image : absoluteUrl(a.image)) : undefined;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.excerpt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': /adin ai|team/i.test(a.author) ? 'Organization' : 'Person', name: a.author },
      publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: LOGO_URL } },
      ...(iso ? { datePublished: iso, dateModified: iso } : {}),
      ...(imageUrl ? { image: imageUrl } : {}),
    };
    const content = renderToStaticMarkup(React.createElement(ReactMarkdown, null, a.content));
    const bodyHtml = `<article>
          <h1>${esc(a.title)}</h1>
          <p>${esc(a.author)} · ${esc(a.date)} · ${esc(a.readTime)}</p>
          ${content}
        </article>
        ${navHtml}`;
    const head = headBlock({
      title: `${a.title} | Adin AI Blog`,
      description: a.excerpt,
      canonical: url,
      ogType: 'article',
      jsonld: schema,
    });
    writeRoute(`/blog/${a.slug}`, renderPage({ head, bodyHtml }));
  }

  // ----- sitemap.xml (articles se auto) -----
  const newest = ARTICLES.map((a) => toIsoDate(a.date)).filter(Boolean).sort().pop();
  const urlXml = (loc, { lastmod, changefreq, priority } = {}) =>
    `  <url>\n    <loc>${esc(loc)}</loc>\n` +
    (lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : '') +
    (changefreq ? `    <changefreq>${changefreq}</changefreq>\n` : '') +
    (priority ? `    <priority>${priority}</priority>\n` : '') +
    `  </url>`;
  const entries = [];
  for (const p of SITEMAP_PAGES) {
    entries.push(urlXml(canonicalFor(p.path), {
      lastmod: p.path === '/blog' ? newest : undefined, // baqi static pages: lastmod nahi (galat date se behtar hai na likhna)
      changefreq: p.changefreq,
      priority: p.priority,
    }));
    if (p.path === '/blog') {
      for (const a of ARTICLES) {
        entries.push(urlXml(canonicalFor(`/blog/${a.slug}`), { lastmod: toIsoDate(a.date), changefreq: 'monthly', priority: '0.70' }));
      }
    }
  }
  fs.writeFileSync(
    path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
  );

  console.log(`[prerender] ✅ ${written.length} pages + sitemap.xml (${entries.length} URLs): ${written.join(', ')}`);
}

main().catch((err) => {
  console.error('[prerender] ⚠️  Prerender fail hua — site normal SPA ki tarah chalegi:', err);
  process.exit(STRICT ? 1 : 0);
});
