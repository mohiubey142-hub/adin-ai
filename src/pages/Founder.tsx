// src/pages/Founder.tsx - Kian Mercer - Founder of Adin AI
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

export default function Founder() {
  // ✅ Go back to workspace
  const goBack = () => {
    window.location.hash = '';
    window.location.reload();
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

      {/* ✅ Page Content - overflow-y-auto for scrollbar */}
      <div className="h-screen bg-black text-white overflow-y-auto">
        {/* Navigation - Sticky top */}
        <div className="sticky top-0 z-50 h-[56px] flex items-center border-b border-zinc-900 bg-black/90 backdrop-blur-md px-0">
          {/* ✅ Back to Home Button - Purple to Blue Gradient (Matches Scrollbar) */}
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 shadow-md shadow-purple-500/30 ml-0"
          >
            <ArrowLeft size={16} className="text-white" />
            <span className="text-sm">Back to Home</span>
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
    </>
  );
}