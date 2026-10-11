// src/pages/Founder.tsx - Kian Mercer - Founder of Adin AI
// ✅ NEW: onBack prop — entry-aware back navigation
// ✅ FIXED: Neutral gray scrollbar (no purple, matches app)

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

interface FounderProps {
  onBack?: () => void;
}

export default function Founder({ onBack }: FounderProps) {
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
        ogImage="https://adin-ai.com/founder-og.jpg"
      />

      {/* ✅ JSON-LD: Person Schema + Page Schemas */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('founder'))}
      </script>

      {/* ✅ Page Content - light theme, matches Workspace page */}
      <div className="founder-scroll h-screen bg-slate-50 text-slate-900 overflow-y-auto">
        {/* Navigation - Sticky top */}
        <div className="sticky top-0 z-50 h-14 flex items-center border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 md:px-6">
          {/* ✅ Back Button - matches Workspace's purple accent */}
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-slate-600 hover:text-purple-700 hover:bg-purple-50 font-medium transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back</span>
          </button>
        </div>

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