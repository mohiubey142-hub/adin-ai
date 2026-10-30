// src/pages/ToolLandingPage.tsx
// ============================================================
// PREMIUM public SEO landing pages (login/onboarding ke bina khulte hain):
//   /free-cv-builder
//   /free-cover-letter-generator
// Content: src/config/toolLandingContent.ts
// Template images: /Templates/images/*.webp (wahi jo main landing page use karta hai)
// CTA buttons App.tsx ke existing handlers se judte hain (templates page → onboarding flow)
// ============================================================

import type { CSSProperties } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  Eye,
  FileText,
  Layers,
  Lightbulb,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { SEOHead } from '../components/SEO/SEOHead';
import { getSEOConfig } from '../config/seoPages';
import { buildToolLandingSchema, type ToolLandingContent } from '../config/toolLandingContent';

interface ToolLandingPageProps {
  content: ToolLandingContent;
  /** Primary CTA — App.tsx ka existing "Build CV" / "Write Cover Letter" handler (templates page par le jata hai) */
  onStart: () => void;
  /** Back — landing page par wapas */
  onBack: () => void;
}

const CTA_GRADIENT = 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)';
const FEATURE_ICONS = [Sparkles, Layers, Download, Check, ShieldCheck, MapPin];

// Hero 2-row cascade (back row: 3 cards, front row: 2 cards, rows overlap vertically)
// Order = content.fan: [0 backLeft, 1 backRight, 2 frontRight, 3 backCenter, 4 frontLeft/hero]
// Values: % of stage (center/top/width), deg rotate
const SHADOW_BACK = '0 18px 36px -14px rgba(15,23,42,0.30), 0 4px 10px -4px rgba(15,23,42,0.12)';
const SHADOW_MID = '0 24px 44px -16px rgba(15,23,42,0.34), 0 8px 16px -8px rgba(15,23,42,0.14)';
const SHADOW_FRONT = '0 36px 64px -22px rgba(91,33,182,0.42), 0 14px 28px -12px rgba(15,23,42,0.26)';
const FAN_GEOMETRY = [
  { center: 18, top: 7,  width: 36, rotate: -7,   z: 1, dim: true,  row: 'back',  pillRight: false, shadow: SHADOW_BACK },
  { center: 82, top: 7,  width: 36, rotate: 7,    z: 1, dim: true,  row: 'back',  pillRight: true,  shadow: SHADOW_BACK },
  { center: 66, top: 41, width: 45, rotate: 4.5,  z: 5, dim: false, row: 'front', pillRight: true,  shadow: SHADOW_MID },
  { center: 50, top: 0,  width: 38, rotate: 0,    z: 2, dim: true,  row: 'back',  pillRight: false, shadow: SHADOW_MID },
  { center: 34, top: 38, width: 47, rotate: -4.5, z: 6, dim: false, row: 'front', pillRight: false, shadow: SHADOW_FRONT },
];

// Hero ke baad ka content (templates heading se neeche sab) kitna upar khiskega.
// 0.4 = hero↔templates ke beech ka gap 40% kam. Sirf yahi ek value badalni hai.
const SECTION_PULL_UP = 0.4;

// Sabse neeche wale gradient CTA box ka size (1 = original, 1.3 = 30% bada). Sirf yahi value badalni hai.
const FINAL_CTA_SCALE = 1.3;
// Box ka max width page ke content width se zyada na jaye (Tailwind max-w-7xl)
const FINAL_CTA_MAX_WIDTH = '80rem';

const PAGE_CSS = `
/* Final CTA box: har size base value × --tlp-final-scale (base = purani Tailwind values) */
.tlp-final-section { max-width: min(calc(64rem * var(--tlp-final-scale)), ${FINAL_CTA_MAX_WIDTH}); }
.tlp-final-box { padding: calc(3rem * var(--tlp-final-scale)) calc(1.5rem * var(--tlp-final-scale)); }
.tlp-final-title { font-size: calc(1.5rem * var(--tlp-final-scale)); line-height: 1.2; }
.tlp-final-text { margin-top: calc(0.75rem * var(--tlp-final-scale)); font-size: calc(0.875rem * var(--tlp-final-scale)); max-width: calc(36rem * var(--tlp-final-scale)); }
.tlp-final-btn { margin-top: calc(1.75rem * var(--tlp-final-scale)); font-size: calc(1rem * var(--tlp-final-scale)); padding: 0.875em 1.75em; gap: 0.5em; }
@media (min-width: 640px) {
  .tlp-final-box { padding-inline: calc(3rem * var(--tlp-final-scale)); }
  .tlp-final-title { font-size: calc(1.875rem * var(--tlp-final-scale)); }
  .tlp-final-text { font-size: calc(1rem * var(--tlp-final-scale)); }
}/* Hero → templates gap: base spacing (mobile / md+) aur pull-up CSS variables se aati hai */
.tlp-page { --tlp-hero-pb: 3rem; --tlp-gallery-pt: 3.5rem; }
@media (min-width: 768px) { .tlp-page { --tlp-hero-pb: 5rem; --tlp-gallery-pt: 5rem; } }
.tlp-hero-section { padding-bottom: calc(var(--tlp-hero-pb) * (1 - var(--tlp-pull-up))); }
.tlp-gallery-section { padding-top: calc(var(--tlp-gallery-pt) * (1 - var(--tlp-pull-up))); }
@keyframes tlp-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes tlp-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.tlp-float { animation: tlp-float 4s ease-in-out infinite; }
.tlp-rise { animation: tlp-rise .7s ease-out both; }
details > summary::-webkit-details-marker { display: none; }
@media (prefers-reduced-motion: reduce) { .tlp-float, .tlp-rise { animation: none; } }
`;

// Hash link (#templates) App.tsx ke hashchange handler ko trigger karta hai (onboarding khul jati thi),
// isliye plain JS smooth-scroll use karte hain.
const scrollToTemplates = () => {
  document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

export default function ToolLandingPage({ content, onStart, onBack }: ToolLandingPageProps) {
  const seo = getSEOConfig(content.seoKey);
  const isCover = content.ctaTarget === 'cover-letter';
  const CtaIcon = isCover ? Mail : FileText;
  const schema = buildToolLandingSchema(content);

  // "Free CV Builder: Create a ..." → gradient lead + normal rest
  const colonAt = content.h1.indexOf(': ');
  const h1Lead = colonAt > 0 ? content.h1.slice(0, colonAt) : '';
  const h1Rest = colonAt > 0 ? content.h1.slice(colonAt + 2) : content.h1;

  return (
    <div className="tlp-page relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 overflow-x-hidden pb-24 md:pb-0"
      style={{ '--tlp-pull-up': SECTION_PULL_UP } as CSSProperties}>
      <style>{PAGE_CSS}</style>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonicalUrl={seo.canonicalUrl}
        ogType="website"
      />
      <script type="application/ld+json">
        {JSON.stringify(schema).replace(/</g, '\\u003c')}
      </script>

      {/* Background — main landing page jaisi soft layer (kam bright) */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute top-[-10%] left-[-10%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute top-[40%] right-[-10%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', filter: 'blur(90px)' }}
        />
        <div
          className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(100px)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: 'radial-gradient(#94a3b8 0.7px, transparent 0.7px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse 60% 55% at 50% 30%, black 15%, transparent 75%)',
          }}
        />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={onStart}
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-white text-sm font-semibold shadow-md shadow-purple-600/20 hover:scale-[1.03] active:scale-[0.97] transition-transform"
          style={{ background: CTA_GRADIENT }}
        >
          {content.ctaLabel}
          <ArrowRight size={14} />
        </button>
      </header>

      <main className="relative z-10">
        {/* ───────── HERO ───────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 tlp-hero-section">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            {/* Left */}
            <div className="tlp-rise text-left">
              <nav aria-label="Breadcrumb" className="mb-5 flex items-center text-xs text-slate-500">
                <a href="/" className="inline-flex items-center gap-2 group" aria-label="Adin AI home">
                  <span className="w-8 h-8 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
                  </span>
                  <span className="text-sm font-bold text-slate-800 tracking-tight">
                    Adin AI
                  </span>
                </a>
                <span className="mx-2 text-slate-400">/</span>
                <span className="text-slate-700 font-medium">{content.breadcrumb}</span>
              </nav>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-purple-200 text-purple-700 text-xs font-semibold shadow-sm mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {content.eyebrow}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                {h1Lead && (
                  <span className="block pb-1" style={{ color: '#6d5ef5' }}>
                    {h1Lead}
                  </span>
                )}
                <span className="block">{h1Rest}</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                {content.intro}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={onStart}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-white text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-xl shadow-purple-600/30"
                  style={{ background: CTA_GRADIENT }}
                >
                  <CtaIcon size={18} />
                  <span>{content.ctaLabel}</span>
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={scrollToTemplates}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border border-slate-200 hover:border-purple-300 text-slate-800 hover:text-purple-700 text-base font-semibold shadow-sm transition-colors"
                >
                  <Eye size={17} />
                  See templates
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">{content.ctaNote}</p>

              <ul className="mt-6 flex flex-wrap items-center justify-start gap-2">
                {content.highlights.map((h) => (
                  <li
                    key={h}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-medium text-slate-700 shadow-sm"
                  >
                    <Check size={12} className="text-emerald-600" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — 2-row overlapping template cascade */}
            <div className="relative tlp-rise mt-6 lg:mt-16" style={{ animationDelay: '120ms' }}>
              <div className="relative w-full max-w-[580px] mx-auto aspect-[100/104]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.18) 0%, transparent 65%)', filter: 'blur(60px)' }}
                />
                {content.fan.map((card, i) => {
                  const g = FAN_GEOMETRY[i];
                  if (!g) return null;
                  return (
                    <div
                      key={card.src}
                      className="absolute"
                      style={{
                        width: `${g.width}%`,
                        left: `${g.center}%`,
                        top: `${g.top}%`,
                        zIndex: g.z,
                        transformOrigin: '50% 100%',
                        transform: `translateX(-50%) rotate(${g.rotate}deg)`,
                      }}
                    >
                      <div
                        className="tlp-rise rounded-2xl bg-white ring-1 ring-slate-900/5 border border-white overflow-hidden transition-transform duration-500 ease-out hover:-translate-y-2"
                        style={{ boxShadow: g.shadow, animationDelay: `${180 + i * 90}ms` }}
                      >
                        <div className="aspect-[3/4] bg-slate-50 relative">
                          <img
                            src={card.src}
                            alt={card.alt}
                            className="w-full h-full object-contain object-top p-2"
                            draggable={false}
                            decoding="async"
                          />
                          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/30 via-transparent to-slate-900/[0.04]" />
                          {g.dim && <div className="absolute inset-0 pointer-events-none bg-slate-900/[0.04]" />}
                          {g.row === 'back' && (
                            <div className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none bg-gradient-to-t from-white/40 to-transparent" />
                          )}
                          {card.pill && (
                            <div
                              className={`absolute top-2.5 ${g.pillRight ? 'right-2.5' : 'left-2.5'} px-2.5 py-[3px] rounded-full bg-purple-600 text-white text-[10px] font-semibold shadow-sm`}
                            >
                              {card.pill}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Floating AI badge — sits on the seam between the two front cards */}
                <div
                  className="absolute pointer-events-none"
                  style={{ left: '50%', bottom: '1.5%', transform: 'translateX(-50%)', zIndex: 8 }}
                >
                  <div className="tlp-float px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-sm border border-purple-200 shadow-xl shadow-purple-900/15 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                      <Wand2 size={15} className="text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-800 leading-tight">AI Writing</div>
                      <div className="text-[10px] text-slate-500 leading-tight">Advanced GPT Models</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ───────── TEMPLATE GALLERY ───────── */}
        <section id="templates" className="tlp-gallery-section max-w-7xl mx-auto px-4 sm:px-6 pb-14 md:pb-20 scroll-mt-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
              <Layers size={12} />
              Templates
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{content.galleryTitle}</h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">{content.gallerySubtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 max-w-5xl mx-auto">
            {content.gallery.map((tpl) => (
              <button
                key={tpl.image}
                onClick={onStart}
                className="group relative text-left rounded-2xl bg-white border border-slate-200 hover:border-purple-300 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10"
              >
                <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                  <img
                    src={tpl.image}
                    alt={`${tpl.name} ${isCover ? 'cover letter' : 'CV'} template`}
                    className="w-full h-full object-contain object-top p-3 transition-transform duration-500 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-[3px] rounded-full bg-emerald-600 text-white text-[10px] font-semibold shadow-sm">
                    Free
                  </span>
                  <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-lg">
                      <Eye size={13} />
                      Use this template
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4 border-t border-slate-100">
                  <div className="text-sm font-semibold text-slate-900 truncate">{tpl.name}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{tpl.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a
              href={content.galleryHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-purple-400 text-slate-800 hover:text-purple-700 text-sm font-semibold transition-colors shadow-sm"
            >
              {content.galleryCta}
              <ArrowRight size={15} />
            </a>
          </div>
        </section>

        {/* ───────── FEATURES ───────── */}
        <section className="bg-white/60 backdrop-blur-sm border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
                <Sparkles size={12} />
                Features
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{content.featuresTitle}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {content.features.map((f, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <div
                    key={f.title}
                    className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mb-4 shadow-md shadow-purple-600/20">
                      <Icon size={20} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───────── STEPS ───────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center">{content.stepsTitle}</h2>
          <ol className="relative mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div
              aria-hidden="true"
              className="hidden md:block absolute top-9 left-[16%] right-[16%] h-px bg-gradient-to-r from-purple-200 via-indigo-300 to-blue-200"
            />
            {content.steps.map((s, i) => (
              <li key={s.title} className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center">
                <div
                  className="relative mx-auto w-12 h-12 rounded-full text-white text-lg font-bold flex items-center justify-center shadow-lg shadow-purple-600/25 mb-4"
                  style={{ background: CTA_GRADIENT }}
                >
                  {i + 1}
                </div>
                <h3 className="text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ───────── TIPS ───────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 md:pb-20">
          <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb size={20} className="text-amber-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{content.tipsTitle}</h2>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {content.tips.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                  <span className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={12} className="text-emerald-700" />
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── FAQ ───────── */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-14 md:pb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-center">{content.faqTitle}</h2>
          <div className="mt-8 space-y-3">
            {content.faqs.map((f) => (
              <details key={f.q} className="group bg-white rounded-xl border border-slate-200 shadow-sm open:border-purple-200 open:shadow-md transition-all">
                <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 text-sm sm:text-base font-semibold text-slate-900">
                  <span>{f.q}</span>
                  <ChevronDown size={18} className="shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ───────── GUIDES + RELATED ───────── */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 md:pb-20 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{content.guidesTitle}</h2>
            <ul className="mt-3 space-y-2">
              {content.guides.map((g) => (
                <li key={g.href}>
                  <a href={g.href} className="text-sm font-medium text-purple-700 hover:underline">
                    {g.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="/blog" className="text-sm font-medium text-slate-600 hover:text-purple-700 hover:underline">
                  All career tips on the blog
                </a>
              </li>
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Explore more</h2>
            <ul className="mt-3 space-y-2">
              {content.related.map((r) => (
                <li key={r.href}>
                  <a href={r.href} className="text-sm font-medium text-purple-700 hover:underline">
                    {r.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───────── FINAL CTA ───────── */}
        <section
          className="tlp-final-section mx-auto px-4 sm:px-6 pb-16 md:pb-24"
          style={{ '--tlp-final-scale': FINAL_CTA_SCALE } as CSSProperties}
        >
          <div className="tlp-final-box relative overflow-hidden rounded-3xl border border-slate-200 text-center text-white shadow-2xl shadow-purple-900/10"
            style={{ background: CTA_GRADIENT }}>
            <div aria-hidden="true" className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.8px, transparent 0.8px)', backgroundSize: '22px 22px' }} />
            <div aria-hidden="true" className="absolute -top-20 -right-16 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            <div aria-hidden="true" className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }} />
            <div className="relative">
              <h2 className="tlp-final-title font-bold tracking-tight">
                {isCover ? 'Ready to write your cover letter?' : 'Ready to build your CV?'}
              </h2>
              <p className="tlp-final-text text-white/80 mx-auto">
                {isCover
                  ? 'Get a professional draft in seconds. Free, with no signup required.'
                  : 'It takes just a few minutes. Free, with no signup required.'}
              </p>
              <button
                onClick={onStart}
                className="tlp-final-btn group inline-flex items-center justify-center rounded-full bg-white text-slate-900 font-bold shadow-lg hover:scale-[1.03] active:scale-[0.97] transition-transform"
              >
                <CtaIcon size="1.125em" />
                <span>{content.ctaLabel}</span>
                <ArrowRight size="1em" className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} Adin AI. All rights reserved.</p>
            <nav aria-label="Footer" className="flex items-center gap-4">
              <a href="/privacy-policy" className="hover:text-purple-700">Privacy Policy</a>
              <a href="/terms-of-service" className="hover:text-purple-700">Terms of Service</a>
              <a href="/contact" className="hover:text-purple-700">Contact</a>
            </nav>
          </div>
        </footer>
      </main>

      {/* Sticky mobile CTA */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/90 backdrop-blur-xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
        <button
          onClick={onStart}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white text-base font-semibold shadow-lg shadow-purple-600/25 active:scale-[0.98] transition-transform"
          style={{ background: CTA_GRADIENT }}
        >
          <CtaIcon size={18} />
          {content.ctaLabel}
        </button>
      </div>
    </div>
  );
}