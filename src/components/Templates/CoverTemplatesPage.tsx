// src/components/Templates/CoverTemplatesPage.tsx
// ✅ Sidebar + Hamburger REMOVED — App.tsx handles header + sidebar
// ✅ Search bar COMPLETELY removed (header + hero + state + logic)
// ✅ All 6 templates ACTIVE
// ✅ Preview modal: NO card wrapper
// ✅ Neutral gray scrollbar (App.tsx handles globally)

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  CheckCircle, Zap, FileText, Eye, Lock, AlertCircle, Award,
  ZoomIn, ZoomOut, Maximize, X,
} from "lucide-react";

import { SEOHead } from "../SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../../utils/seo";
import { getSEOConfig } from "../../utils/seoPages";

interface Template {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  detailedDescription?: string;
  qualities?: string[];
  bestFor: string[];
  badges: string[];
  gradient: string;
  status: "active" | "coming-soon";
  previewImage: string;
  features: string[];
  isPopular?: boolean;
}

interface CoverTemplatesPageProps {
  onBackToHome?: () => void;
  onTemplateSelect?: (templateId: string) => void;
}

const CoverTemplatesPage = ({
  onBackToHome,
  onTemplateSelect,
}: CoverTemplatesPageProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>("All Templates");
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const templates: Template[] = [
    {
      id: "modern",
      name: "Modern",
      subtitle: "Dark Teal Header Band",
      description: "Dark teal full-width header band with name, title, and contact line.",
      detailedDescription: "A contemporary cover letter featuring a full-width dark teal header band that spans the top of the page. Inside the band: your name and job title in white, with a contact line below. No dividers — just clean, bold color blocking. The letter body uses clean left-aligned typography with strong visual hierarchy and ATS-friendly structure.",
      qualities: ["Dark teal full-width header band", "White name & job title in header", "Contact line below title", "ATS-friendly structure"],
      bestFor: ["Creative", "Tech", "Marketing"],
      badges: ["ATS Optimized", "Popular"],
      gradient: "from-teal-700 to-teal-500",
      status: "active",
      previewImage: "/Templates/images/cover-modern.webp",
      features: ["Teal Header Band", "Contact Line"],
      isPopular: true,
    },
    {
      id: "classic",
      name: "Classic",
      subtitle: "Timeless Formal Layout",
      description: "Traditional layout with thin divider and left-aligned content.",
      detailedDescription: "A timeless formal cover letter with a left-aligned name. A single thin gray divider separates the header from the letter body, and the date sits left-aligned just below. Professional and ATS-friendly.",
      qualities: ["Traditional formal layout", "Single thin divider", "Left-aligned date", "ATS-friendly formatting"],
      bestFor: ["Corporate", "Legal", "Executive"],
      badges: ["ATS Optimized", "Professional"],
      gradient: "from-blue-600 to-indigo-500",
      status: "active",
      previewImage: "/Templates/images/cover-classic.webp",
      features: ["Traditional Layout", "Single Divider"],
    },
    {
      id: "minimal",
      name: "Minimal",
      subtitle: "Centered Header & Two-Column",
      description: "Centered name and title, contact grid, and two-column body layout.",
      detailedDescription: "A minimalist cover letter with a centered name and job title, a clean contact grid (labels + values in two columns), and a two-column layout below — TO/FROM/DATE blocks on the left, salutation and letter body on the right. Structured, elegant, and easy to read.",
      qualities: ["Centered name and title", "Two-column contact grid", "TO/FROM/DATE sidebar", "Two-column body layout", "Highly ATS-compatible"],
      bestFor: ["Design", "Freelance", "Creative"],
      badges: ["ATS Optimized"],
      gradient: "from-gray-600 to-zinc-500",
      status: "active",
      previewImage: "/Templates/images/cover-minimal.webp",
      features: ["Centered Header", "Contact Grid", "Two-Column Body"],
    },
    {
      id: "professional",
      name: "Professional",
      subtitle: "Dark Teal Bar & Right Contact",
      description: "Dark teal top bar with bold name and right-aligned contact block.",
      detailedDescription: "A polished professional cover letter with a dark teal top bar, a bold left-aligned name and subtitle, and a right-aligned contact block (values only) starting on the same line as the name. The letter body is cleanly left-aligned below.",
      qualities: ["Dark teal top bar", "Bold name on the left", "Right-aligned contact block", "Same-line name and contact", "ATS-friendly layout"],
      bestFor: ["All Industries", "Traditional"],
      badges: ["ATS Optimized", "Professional"],
      gradient: "from-blue-600 to-cyan-500",
      status: "active",
      previewImage: "/Templates/images/cover-professional.webp",
      features: ["Dark Teal Bar", "Right Contact Block", "Bold Name"],
    },
    {
      id: "executive",
      name: "Executive",
      subtitle: "Navy Bar & Gold Divider",
      description: "Navy top bar, big navy name, and gold divider.",
      detailedDescription: "A premium executive cover letter with a navy top bar, a large navy name, pipe-separated contact details, a gold divider below the header, and a subtle grey-blue page background. Communicates authority and polish.",
      qualities: ["Navy top bar", "Large navy name", "Gold divider", "Grey-blue page background"],
      bestFor: ["C-Suite", "Executive", "Leadership"],
      badges: ["ATS Optimized", "Premium"],
      gradient: "from-amber-600 to-orange-500",
      status: "active",
      previewImage: "/Templates/images/cover-executive.webp",
      features: ["Navy Top Bar", "Gold Divider"],
    },
    {
      id: "creative",
      name: "Creative",
      subtitle: "Black Band & Justified Body",
      description: "Full-width black header band with justified letter body.",
      detailedDescription: "A bold creative cover letter with a full-width black header band containing the name, title, and contact details in light text. The body is justified with a Times italic signature — distinctive and portfolio-ready.",
      qualities: ["Full-width black header band", "Justified body text", "Times italic signature", "Distinctive creative layout"],
      bestFor: ["Design", "Art", "Creative"],
      badges: ["ATS Optimized"],
      gradient: "from-pink-600 to-rose-500",
      status: "active",
      previewImage: "/Templates/images/cover-creative.webp",
      features: ["Black Header Band", "Justified Body", "Times Signature"],
    },
  ];

  const filterOptions = ["All Templates", "Modern", "Classic", "Minimal", "Professional", "Executive", "Creative"];

  // ✅ Search removed — only filter by category
  const filteredTemplates = useMemo(() => {
    let list = templates;
    if (activeFilter !== "All Templates") {
      list = list.filter((t) => t.name === activeFilter);
    }
    return list;
  }, [templates, activeFilter]);

  const handleUseTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    if (onTemplateSelect) onTemplateSelect(templateId);
  }, [onTemplateSelect]);

  const handlePreview = useCallback((template: Template) => {
    setPreviewTemplate(template);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const closePreview = useCallback(() => {
    setPreviewTemplate(null);
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  }, []);

  const handleImageError = useCallback((templateId: string) => {
    setImageErrors((prev) => ({ ...prev, [templateId]: true }));
  }, []);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleFitToScreen = () => { setZoomLevel(1); setPanPosition({ x: 0, y: 0 }); };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setPanStart({ x: panPosition.x, y: panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setPanPosition({ x: panStart.x + dx, y: panStart.y + dy });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel <= 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setPanStart({ x: panPosition.x, y: panPosition.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.x;
    const dy = touch.clientY - dragStart.y;
    setPanPosition({ x: panStart.x + dx, y: panStart.y + dy });
  };

  const handleTouchEnd = () => setIsDragging(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!previewTemplate) return;
      if (event.key === "Escape") closePreview();
      if (event.key === "+") handleZoomIn();
      if (event.key === "-") handleZoomOut();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewTemplate, closePreview]);

  useEffect(() => {
    if (previewTemplate && closeButtonRef.current) closeButtonRef.current.focus();
  }, [previewTemplate]);

  useEffect(() => {
    if (previewTemplate) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prevOverflow || ""; };
    }
  }, [previewTemplate]);

  useEffect(() => {
    if (zoomLevel <= 1) setPanPosition({ x: 0, y: 0 });
  }, [zoomLevel]);

  useEffect(() => {
    if (expandedTemplateId === null) return;
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setExpandedTemplateId(null);
        ticking = false;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [expandedTemplateId]);

  const getFeatureChips = (t: Template): string[] => {
    const map: Record<string, string> = {
      "ATS Optimized": "ATS Friendly",
      Professional: "Professional",
      Clean: "Clean",
      Premium: "Premium",
    };
    const out: string[] = [];
    t.badges.forEach((b) => {
      if (b === "Popular") return;
      const label = map[b];
      if (label && !out.includes(label)) out.push(label);
    });
    return out;
  };

  const seoConfig = getSEOConfig("cover-templates");

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType={seoConfig.ogType || "website"}
      />

      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas("cover-templates"))}
      </script>

      {/* ✅ Container fills parent — App.tsx gives us flex-1 min-h-0 wrapper */}
      <div className="w-full h-full flex flex-col bg-slate-100 text-slate-900 overflow-hidden">

        {/* ✅ Scrollable content — only this scrolls */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* HERO — ✅ Search bar removed */}
          <section className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 sm:py-8 md:py-10 text-center">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
                Choose Your Cover Letter Template
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-2 max-w-2xl mx-auto">
                Professional cover letter templates designed to help you make a strong first impression.
              </p>
            </div>
          </section>

          {/* FILTERS — scrollable, scrollbar hidden, pills never shrink */}
          <section className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3">
              <div
                className="cv-filter-scroll overflow-x-auto overflow-y-hidden -mx-1 px-1"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-x",
                }}
              >
                <div className="flex flex-nowrap gap-2 w-max mx-auto">
                {filterOptions.map((filter) => {
                  const active = activeFilter === filter;
                  return (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap shrink-0 flex-none transition-all border focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
                        active
                          ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                      }`}
                      aria-pressed={active}
                    >
                      {filter}
                    </button>
                  );
                })}
                </div>
              </div>
            </div>
          </section>

          {/* GRID */}
          <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
            {filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <FileText size={22} className="text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">No templates found</h3>
                <p className="text-sm text-slate-500 mt-1">Try a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 items-start">
                {filteredTemplates.map((template) => {
                  const isActive = template.status === "active";
                  const hasImageError = imageErrors[template.id];
                  const isComingSoon = template.status === "coming-soon";
                  const isSelected = selectedTemplate === template.id;
                  const isExpanded = expandedTemplateId === template.id;
                  const featureChips = getFeatureChips(template);

                  return (
                    <article
                      key={template.id}
                      className={`group relative flex flex-col bg-white rounded-xl sm:rounded-2xl border transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? "border-purple-500 ring-2 ring-purple-500/20 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-lg hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Preview Image */}
                      <div className="relative bg-slate-50 border-b border-slate-100 p-2 sm:p-4 md:p-5">
                        <div className="relative w-full aspect-[3/4] flex items-center justify-center">
                          <div className="relative w-full h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            {hasImageError ? (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50">
                                <AlertCircle size={24} />
                                <span className="text-[10px] sm:text-[11px]">Preview unavailable</span>
                              </div>
                            ) : (
                              <img
                                src={template.previewImage}
                                alt={`${template.name} cover letter preview`}
                                className="w-full h-full object-contain object-top p-1 sm:p-2 bg-white"
                                loading="lazy"
                                onError={() => handleImageError(template.id)}
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                              />
                            )}
                          </div>

                          {template.isPopular && isActive && (
                            <div className="absolute -top-1 -left-1 z-10">
                              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold bg-purple-600 text-white shadow-sm">
                                <Award size={9} className="sm:hidden" />
                                <Award size={10} className="hidden sm:inline" />
                                Popular
                              </span>
                            </div>
                          )}

                          {isComingSoon && (
                            <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-10">
                              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium bg-white border border-amber-200 text-amber-700 shadow-sm">
                                <Lock size={9} className="sm:hidden" />
                                <Lock size={10} className="hidden sm:inline" />
                                Coming Soon
                              </span>
                            </div>
                          )}

                          {isActive && (
                            <button
                              onClick={() => handlePreview(template)}
                              className="absolute inset-0 flex items-center justify-center bg-slate-900/0 group-hover:bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus-visible:opacity-100 focus-visible:bg-slate-900/40"
                              aria-label={`Open ${template.name} preview`}
                            >
                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white text-slate-900 text-[10px] sm:text-xs font-medium shadow-md">
                                <Eye size={11} className="sm:hidden" />
                                <Eye size={13} className="hidden sm:inline" />
                                Quick Preview
                              </span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="flex flex-col flex-1 p-2.5 sm:p-4 md:p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xs sm:text-base font-semibold text-slate-900 truncate">{template.name}</h3>
                            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate">{template.subtitle}</p>
                          </div>
                        </div>

                        {!isExpanded ? (
                          <div className="mt-2 sm:mt-3">
                            <p className="text-[10px] sm:text-xs text-slate-600 leading-snug line-clamp-2 sm:line-clamp-1">{template.description}</p>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedTemplateId(template.id); }}
                              className="mt-1.5 sm:mt-2 inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:border-purple-300 text-[9px] sm:text-[11px] font-medium transition-colors"
                            >
                              More
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2 sm:mt-3">
                            <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 uppercase tracking-wide mb-1 sm:mb-1.5">About</p>
                            <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">{template.detailedDescription || template.description}</p>
                            {featureChips.length > 0 && (
                              <div className="mt-2.5 sm:mt-4">
                                <p className="text-[9px] sm:text-[11px] font-semibold text-slate-800 uppercase tracking-wide mb-1.5 sm:mb-2">Features</p>
                                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                  {featureChips.map((chip) => (
                                    <span key={chip} className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                      {chip}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {template.qualities && template.qualities.length > 0 && (
                              <ul className="mt-2 sm:mt-3 space-y-0.5 sm:space-y-1">
                                {template.qualities.map((q) => (
                                  <li key={q} className="flex items-start gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-600 leading-snug sm:leading-relaxed">
                                    <span aria-hidden="true" className="mt-1 sm:mt-1.5 w-1 h-1 rounded-full bg-purple-500 shrink-0" />
                                    <span>{q}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setExpandedTemplateId(null); }}
                              className="mt-2 sm:mt-3 inline-flex items-center gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-[9px] sm:text-[11px] font-medium transition-colors"
                            >
                              Hide
                            </button>
                          </div>
                        )}

                        {/* Buttons */}
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                          <button
                            onClick={() => handlePreview(template)}
                            className="w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-[10px] sm:text-xs font-medium transition-colors"
                          >
                            <Eye size={11} className="sm:hidden" />
                            <Eye size={13} className="hidden sm:inline" />
                            Preview
                          </button>
                          {isActive ? (
                            <button
                              onClick={() => handleUseTemplate(template.id)}
                              className="w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] sm:text-xs font-medium transition-colors shadow-sm"
                            >
                              <CheckCircle size={11} className="sm:hidden" />
                              <CheckCircle size={13} className="hidden sm:inline" />
                              Use Template
                            </button>
                          ) : (
                            <div className="w-full inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-slate-100 text-slate-400 text-[10px] sm:text-xs font-medium cursor-not-allowed">
                              <Lock size={10} className="sm:hidden" />
                              <Lock size={12} className="hidden sm:inline" />
                              Coming Soon
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* WHY SECTION */}
            <section className="mt-12 md:mt-16 pt-10 border-t border-slate-200">
              <div className="text-center mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">Why Our Cover Letter Templates?</h2>
                <p className="text-sm text-slate-500 mt-1.5">Built to get you past the bots and in front of real recruiters.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                {[
                  { icon: <CheckCircle size={18} />, title: "ATS Optimized", desc: "All templates are ATS friendly." },
                  { icon: <Award size={18} />, title: "Professional Design", desc: "Designed by HR experts." },
                  { icon: <Zap size={18} />, title: "Easy to Customize", desc: "Fully customizable templates." },
                  { icon: <FileText size={18} />, title: "Export Ready", desc: "Export in PDF format." },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-center group">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                      {item.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>

        {/* PREVIEW MODAL */}
        {previewTemplate && (
          <div
            className="tpl-overlay fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4"
            onClick={closePreview}
            role="dialog"
            aria-modal="true"
          >
            <div
              ref={modalRef}
              className="relative max-w-5xl w-full bg-white rounded-2xl border border-slate-200 shadow-2xl tpl-modal flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center tpl-modal-header p-3 md:p-4 border-b border-slate-200 shrink-0 bg-white">
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-slate-900 truncate">{previewTemplate.name} Template</h3>
                  <p className="text-[11px] md:text-xs text-slate-500 truncate">{previewTemplate.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 mr-2 bg-slate-50 border border-slate-200 rounded-lg px-1">
                    <button onClick={handleZoomOut} className="p-1.5 rounded-md hover:bg-white transition-colors text-slate-500 hover:text-slate-900" aria-label="Zoom Out">
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-xs text-slate-600 min-w-[40px] text-center font-medium">{Math.round(zoomLevel * 100)}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded-md hover:bg-white transition-colors text-slate-500 hover:text-slate-900" aria-label="Zoom In">
                      <ZoomIn size={16} />
                    </button>
                    <button onClick={handleFitToScreen} className="p-1.5 rounded-md hover:bg-white transition-colors text-slate-500 hover:text-slate-900" aria-label="Fit to Screen">
                      <Maximize size={16} />
                    </button>
                  </div>
                  <button
                    ref={closeButtonRef}
                    onClick={closePreview}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label="Close preview"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
              </div>

              <div
                ref={imageContainerRef}
                className="tpl-modal-body p-3 md:p-6 flex justify-center items-center min-h-[200px] overflow-hidden flex-1 bg-slate-200"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
              >
                {imageErrors[previewTemplate.id] ? (
                  <div className="flex flex-col items-center justify-center gap-2 md:gap-3 text-slate-500 min-h-[200px]">
                    <AlertCircle size={32} />
                    <span className="text-xs md:text-sm">Preview unavailable</span>
                  </div>
                ) : (
                  <div
                    className="transition-transform duration-100 ease-out"
                    style={{
                      transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                      transformOrigin: "center center",
                      willChange: "transform",
                      maxWidth: "56rem",
                      width: "100%",
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={previewTemplate.previewImage}
                      alt={`${previewTemplate.name} template full preview`}
                      className="tpl-modal-img w-full h-auto object-contain select-none block"
                      loading="lazy"
                      onError={() => handleImageError(previewTemplate.id)}
                      draggable={false}
                    />
                  </div>
                )}
              </div>

              <div className="tpl-modal-footer p-3 md:p-4 border-t border-slate-200 flex justify-between items-center gap-3 shrink-0 bg-white">
                <div className="min-w-0 truncate text-[10px] md:text-xs text-slate-500">
                  <span className="hidden sm:inline">Zoom: {Math.round(zoomLevel * 100)}% • </span>
                  {zoomLevel > 1 && <span className="hidden sm:inline">Drag to pan • </span>}
                  <span className="hidden sm:inline">ESC to close • </span>
                  <span>Click outside to close</span>
                </div>
                {previewTemplate.status === "active" ? (
                  <button
                    onClick={() => handleUseTemplate(previewTemplate.id)}
                    className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium whitespace-nowrap shrink-0 transition-colors shadow-sm"
                  >
                    <CheckCircle size={14} />
                    <span>Use This Template</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 md:gap-2 px-4 md:px-6 py-2 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium whitespace-nowrap shrink-0 cursor-not-allowed">
                    <Lock size={14} className="text-amber-500" />
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
          /* Filter tabs: scroll works, scrollbar fully hidden (beats global scrollbar CSS) */
          .cv-filter-scroll,
          section .cv-filter-scroll {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .cv-filter-scroll::-webkit-scrollbar,
          section .cv-filter-scroll::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
          /* Preview modal: mobile-browser safe (dvh = visible height, excludes address bar) */
          .tpl-overlay {
            height: 100vh;
            height: 100dvh;
            padding-top: max(0.75rem, env(safe-area-inset-top));
            padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
          }
          .tpl-modal {
            max-height: 95vh;
            max-height: 95dvh;
            max-height: 100%;
            min-height: 0;
          }
          .tpl-modal-body { min-height: 0; }
          .tpl-modal-img {
            max-height: calc(95vh - 200px);
            max-height: calc(95dvh - 200px);
          }
          .tpl-modal-header, .tpl-modal-footer { flex-shrink: 0; }
          .tpl-modal-footer { padding-bottom: max(0.75rem, env(safe-area-inset-bottom)); }
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </>
  );
};

export default CoverTemplatesPage;