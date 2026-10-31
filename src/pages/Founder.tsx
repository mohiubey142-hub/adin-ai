// src/pages/Founder.tsx - Kian Mercer - Founder of Adin AI
// ✅ NEW: onBack prop — entry-aware back navigation
// ✅ FIXED: Neutral gray scrollbar (no purple, matches app)

import { useState } from "react";
import { SEOHead } from "../components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../utils/seo";
import { getSEOConfig } from "../utils/seoPages";
import HeroSection from "../components/founder/HeroSection";
import AboutSection from "../components/founder/AboutSection";
import SkillsSection from "../components/founder/SkillsSection";
import TimelineSection from "../components/founder/TimelineSection";
import QuoteSection from "../components/founder/QuoteSection";
import VisionSection from "../components/founder/VisionSection";
import FAQSection from "../components/founder/FAQSection";
import { ArrowLeft } from "lucide-react";
import { SITE_URL } from "../config/site";
import { cameFromApp, markLandingIntent } from "../utils/inAppNav";

interface FounderProps {
  onBack?: () => void;
}

export default function Founder({ onBack }: FounderProps) {
  // ✅ Back sirf tab jab user app ke andar se aaya; seedha khulne par Adin AI logo link
  const showBack = cameFromApp();
  // Header: transparent on top, glass + border after scrolling (this page scrolls inside its own container)
  const [scrolled, setScrolled] = useState(false);

  // ✅ Entry-aware back — if App passes onBack, use it; otherwise fallback to old behavior
  const goBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
  };

  // ✅ Get SEO config for founder page
  const seoConfig = getSEOConfig('founder');

  return (
    <>
      {/* ✅ SEO for Founder Page */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType={seoConfig.ogType || "website"}
        ogImage={`${SITE_URL}/founder-og.jpg`}
      />

      {/* ✅ JSON-LD: Person Schema + Page Schemas */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('founder'))}
      </script>

      {/* ✅ Page Content - light theme, matches Workspace page */}
      <div
        className="founder-scroll h-screen bg-slate-50 text-slate-900 overflow-y-auto"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      >
        {/* Header — Privacy/Terms jaisa: in-app aaye to Back, seedha open par logo.
            -mb-16 = header content ke upar overlay hota hai (jagah nahi gherta), isliye Hero ka glow
            header ke peeche se guzarta hai aur upar "kati hui patti" nahi dikhti. */}
        <header className={`sticky top-0 z-50 -mb-16 transition-all duration-300 ${scrolled ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {showBack ? (
              <button
                onClick={goBack}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <a
                href="/"
              onClick={markLandingIntent}
                aria-label="Adin AI home"
                className="flex items-center gap-2.5 group shrink-0"
              >
                <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
                </div>
                <span className="hidden sm:inline text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  Adin AI
                </span>
              </a>
            )}
          </div>
        </header>

        {/* Sections */}
        <HeroSection />
        <AboutSection />
        <VisionSection />
        <SkillsSection />
        <TimelineSection />
        <QuoteSection />
        <FAQSection />
      </div>

      {/* ✅ Neutral gray scrollbar — matches app UI */}
      <style>{`
        html, body {
          height: auto !important;
          min-height: 100% !important;
          max-height: none !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background: #f8fafc;
          color: #0f172a;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        body > *, body > * > *, #root, #root > * {
          height: auto !important;
          max-height: none !important;
          overflow-y: visible !important;
          overflow-x: visible !important;
        }

        .founder-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .founder-scroll::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .founder-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
          border: 2px solid #f1f5f9;
        }
        .founder-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .founder-scroll::-webkit-scrollbar-corner {
          background: transparent;
        }
        .founder-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
      `}</style>
    </>
  );
}