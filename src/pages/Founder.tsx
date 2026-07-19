// src/pages/Founder.tsx - Kian Mercer - Founder of Adin AI
import { SEOHead } from "../components/SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../utils/seo";
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

  return (
    <>
      {/* ✅ SEO for Founder Page */}
      <SEOHead
        title="Kian Mercer - Founder of Adin AI | AI Career Platform"
        description="Kian Mercer is the 16-year-old founder of Adin AI, an AI-powered career platform helping students and freelancers build resumes, cover letters, and grow their careers."
        canonicalUrl="https://adin-ai.com/founder"
        ogType="website"
        ogImage="https://adin-ai.com/founder-og.jpg"
      />

      {/* ✅ Person Schema for Google */}
      <script type="application/ld+json">
        {generateJSONLDScript({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Kian Mercer",
          "alternateName": "Ghulam MohiyuDin",
          "description": "Founder of Adin AI - AI-Powered Career Platform",
          "url": "https://adin-ai.com/founder",
          "jobTitle": "Founder & CEO",
          "worksFor": {
            "@type": "Organization",
            "name": "Adin AI"
          },
          "nationality": "Pakistani",
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
            "Startup Building"
          ],
          "sameAs": [
            "https://adin-ai.com",
            "https://twitter.com/adin_ai"
          ]
        })}
      </script>

      {/* ✅ Breadcrumb Schema */}
      <script type="application/ld+json">
        {generateJSONLDScript({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://adin-ai.com/"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Founder",
              "item": "https://adin-ai.com/founder"
            }
          ]
        })}
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