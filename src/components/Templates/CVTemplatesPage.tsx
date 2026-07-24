// src/components/Templates/CVTemplatesPage.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Zap,
  Shield,
  FileText,
  Eye,
  Clock,
  Star,
  Lock,
  AlertCircle,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  Target,
  ZoomIn,
  ZoomOut,
  Maximize,
  X,
  Move
} from "lucide-react";

// ✅ SEO Imports
import { SEOHead } from "../SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../../utils/seo";
import { getSEOConfig } from "../../utils/seoPages";

interface Template {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  bestFor: string[];
  badges: string[];
  gradient: string;
  status: 'active' | 'coming-soon';
  previewImage: string;
  rating: number;
  reviews: number;
  atsScore: number;
  features: string[];
  isPopular?: boolean;
}

interface CVTemplatesPageProps {
  onBackToHome?: () => void;
  onTemplateSelect?: (templateId: string) => void;
}

const CVTemplatesPage = ({ onBackToHome, onTemplateSelect }: CVTemplatesPageProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeFilter, setActiveFilter] = useState<string>("All Templates");
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
      subtitle: "Clean & Professional",
      description: "Clean and modern design perfect for today's competitive job market.",
      bestFor: ["Software Engineering", "Technology"],
      badges: ["ATS Optimized", "Popular"],
      gradient: "from-purple-600 to-blue-500",
      status: 'active',
      previewImage: "/Templates/images/modern.webp",
      rating: 4.9,
      reviews: 1247,
      atsScore: 95,
      features: ["Single Page", "Modern Design", "Easy to Customize"],
      isPopular: true
    },
    {
      id: "minimal",
      name: "Minimal",
      subtitle: "Elegant & Simple",
      description: "Minimalist design that puts focus on your content.",
      bestFor: ["Business", "Banking", "Corporate"],
      badges: ["ATS Optimized", "Clean"],
      gradient: "from-slate-600 to-zinc-500",
      status: 'active',
      previewImage: "/Templates/images/minimal.webp",
      rating: 4.8,
      reviews: 893,
      atsScore: 90,
      features: ["Single Page", "Minimal Design", "Easy to Customize"]
    },
    {
      id: "professional",
      name: "Professional",
      subtitle: "Classic & Trusted",
      description: "Traditional and professional layout suitable for all industries.",
      bestFor: ["All Industries", "Traditional"],
      badges: [],
      gradient: "from-blue-600 to-cyan-500",
      status: 'coming-soon',
      previewImage: "/Templates/images/professional.webp",
      rating: 0,
      reviews: 0,
      atsScore: 0,
      features: []
    },
    {
      id: "executive",
      name: "Executive",
      subtitle: "Leadership & Authority",
      description: "Premium design for senior level positions and executives.",
      bestFor: ["C-Suite", "Executive", "Leadership"],
      badges: [],
      gradient: "from-amber-600 to-orange-500",
      status: 'coming-soon',
      previewImage: "/Templates/images/executive.webp",
      rating: 0,
      reviews: 0,
      atsScore: 0,
      features: []
    },
    {
      id: "creative",
      name: "Creative",
      subtitle: "Artistic & Unique",
      description: "A bold, creative design that stands out. Perfect for designers and artists.",
      bestFor: ["Design", "Art", "Creative"],
      badges: [],
      gradient: "from-pink-600 to-rose-500",
      status: 'coming-soon',
      previewImage: "/Templates/images/creative.webp",
      rating: 0,
      reviews: 0,
      atsScore: 0,
      features: []
    },
    {
      id: "academic",
      name: "Academic",
      subtitle: "Research & Education",
      description: "A structured design optimized for academic positions and research roles.",
      bestFor: ["Academia", "Research", "Education"],
      badges: [],
      gradient: "from-emerald-600 to-teal-500",
      status: 'coming-soon',
      previewImage: "/Templates/images/academic.webp",
      rating: 0,
      reviews: 0,
      atsScore: 0,
      features: []
    }
  ];

  const filterOptions = ["All Templates", "Modern", "Minimal", "Professional", "Executive", "Creative", "Academic"];

  const getFilteredTemplates = () => {
    if (activeFilter === "All Templates") {
      return templates;
    }
    return templates.filter(t => t.name === activeFilter);
  };

  const filteredTemplates = getFilteredTemplates();

  const handleUseTemplate = useCallback((templateId: string) => {
    setSelectedTemplate(templateId);
    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
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
    setImageErrors(prev => ({ ...prev, [templateId]: true }));
  }, []);

  // ✅ Pan & Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleFitToScreen = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  // ✅ Mouse drag handlers for pan
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
    setPanPosition({
      x: panStart.x + dx,
      y: panStart.y + dy
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ✅ Touch drag handlers for mobile
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
    setPanPosition({
      x: panStart.x + dx,
      y: panStart.y + dy
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ✅ Keyboard accessibility for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewTemplate) {
        closePreview();
      }
      if (event.key === '+' && previewTemplate) {
        handleZoomIn();
      }
      if (event.key === '-' && previewTemplate) {
        handleZoomOut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [previewTemplate]);

  // Focus management for modal
  useEffect(() => {
    if (previewTemplate && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [previewTemplate]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (previewTemplate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [previewTemplate]);

  // Reset pan when zoom changes
  useEffect(() => {
    if (zoomLevel <= 1) {
      setPanPosition({ x: 0, y: 0 });
    }
  }, [zoomLevel]);

  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;
    const stars = [];

    for (let i = 0; i < totalStars; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star size={10} className="text-zinc-600" />
            <Star size={10} className="fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </div>
        );
      } else {
        stars.push(<Star key={i} size={10} className="text-zinc-600" />);
      }
    }

    return stars;
  }, []);

  const getAtsColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-yellow-400";
    return "text-orange-400";
  };

  // ✅ Get SEO config for CV templates page
  const seoConfig = getSEOConfig('templates');

  return (
    <>
      {/* ✅ SEO: CV Templates Page */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType={seoConfig.ogType || "website"}
      />

      {/* ✅ JSON-LD: CV Templates Schema */}
      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('templates'))}
      </script>

      <div className="min-h-screen bg-black overflow-y-auto">
        {/* Header - Sticky */}
        <div className="h-[48px] flex justify-between items-center px-4 md:px-6 border-b border-zinc-900 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome || (() => {})}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-purple-500/30 transition-all duration-300 group shadow-lg hover:shadow-purple-500/10"
              aria-label="Back to Home"
            >
              <ArrowLeft size={14} className="text-gray-400 group-hover:text-purple-400 transition-colors duration-300" />
              <span className="text-[10px] md:text-xs font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                Back
              </span>
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
                <FileText size={10} className="md:text-sm text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-white">Resume Templates</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden px-4 md:px-6 pt-1 pb-1 md:pt-2 md:pb-2 border-b border-zinc-900">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] bg-purple-600/20 rounded-full blur-3xl opacity-20" />
          <div className="relative max-w-4xl mx-auto text-center">
            <h1 className="text-[10px] md:text-[20px] font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-0.5 md:mb-1">
              Choose Your CV Template
            </h1>
            <p className="text-gray-300 text-[7px] md:text-[11px] max-w-2xl mx-auto">
              Professional ATS-Optimized CV Templates
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 md:px-6 py-1.5 md:py-2 border-b border-zinc-900 bg-black/30 sticky top-[48px] z-10">
          <div className="flex gap-1 md:gap-1.5 max-w-4xl mx-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide snap-x snap-mandatory justify-start lg:justify-center">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[9px] md:text-xs font-medium transition-all duration-300 whitespace-nowrap snap-start flex-shrink-0 ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-lg shadow-purple-500/25"
                    : "bg-zinc-900/50 text-gray-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="px-4 md:px-6 pt-3 md:pt-4 pb-6 md:pb-8">
          <div className="max-w-[900px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 justify-items-center">
              {filteredTemplates.map((template) => {
                const isActive = template.status === 'active';
                const hasImageError = imageErrors[template.id];
                const isComingSoon = template.status === 'coming-soon';

                return (
                  <div
                    key={template.id}
                    className={`group relative rounded-xl md:rounded-2xl border transition-all duration-300 ${
                      selectedTemplate === template.id
                        ? "border-purple-500/50 shadow-xl shadow-purple-500/20"
                        : "border-zinc-800 hover:border-zinc-700 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
                    } bg-zinc-900/50 backdrop-blur-sm w-full max-w-[400px]`}
                    style={{ height: "660px" }}
                  >
                    <div className={`absolute -inset-0.5 rounded-xl md:rounded-2xl bg-gradient-to-r ${template.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />

                    <div className="relative p-2 md:p-3 h-full">
                      <div className={`relative rounded-lg md:rounded-xl overflow-hidden bg-zinc-950 border ${isActive ? 'border-zinc-800 group-hover:border-zinc-700' : 'border-zinc-800/50 group-hover:border-zinc-700'} transition-colors duration-300 h-full flex flex-col`}>
                        
                        <div className="relative flex justify-center items-center p-2 md:p-3 w-full" style={{ minHeight: "528px", height: "528px" }}>
                          {hasImageError ? (
                            <div className="flex flex-col items-center justify-center gap-2 md:gap-3 text-zinc-500">
                              <AlertCircle size={30} className="md:text-4xl text-zinc-700" />
                              <span className="text-[9px] md:text-[10px]">Preview unavailable</span>
                            </div>
                          ) : (
                            <img
                              src={template.previewImage}
                              alt={`${template.name} template preview`}
                              className="w-full h-full object-contain max-h-[500px]"
                              loading="lazy"
                              onError={() => handleImageError(template.id)}
                            />
                          )}
                          
                          {isComingSoon && (
                            <div className="absolute top-3 md:top-4 right-3 md:right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1 md:px-3 md:py-1.5 shadow-lg">
                              <Lock size={12} className="md:w-[14px] md:h-[14px] text-amber-400" />
                              <span className="text-[8px] md:text-[9px] font-medium text-amber-400 whitespace-nowrap">Coming Soon</span>
                            </div>
                          )}
                        </div>

                        {template.isPopular && isActive && (
                          <div className="absolute top-3 md:top-4 left-3 md:left-4">
                            <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center gap-1 md:gap-1.5">
                              <Award size={8} className="md:w-[10px] md:h-[10px]" />
                              POPULAR
                            </span>
                          </div>
                        )}

                        <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4">
                          <span className="px-1.5 md:px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-medium bg-black/70 backdrop-blur-sm border border-white/10 text-white/70">
                            PREVIEW
                          </span>
                        </div>

                        {isActive && (
                          <div className="absolute top-3 md:top-4 right-3 md:right-4 flex flex-wrap gap-1">
                            {template.badges.map((badge) => {
                              if (badge === "Popular") return null;
                              return (
                                <span
                                  key={badge}
                                  className="px-1.5 md:px-2 py-0.5 rounded-full text-[7px] md:text-[8px] font-medium bg-black/70 backdrop-blur-sm border border-white/10 text-white/80 flex items-center gap-0.5"
                                >
                                  {badge === "ATS Optimized" && <CheckCircle size={7} className="md:w-[8px] md:h-[8px] text-green-400" />}
                                  {badge === "Classic" && <Briefcase size={7} className="md:w-[8px] md:h-[8px] text-blue-400" />}
                                  {badge === "Clean" && <CheckCircle size={7} className="md:w-[8px] md:h-[8px] text-blue-400" />}
                                  {badge === "Premium" && <Award size={7} className="md:w-[8px] md:h-[8px] text-amber-400" />}
                                  {badge === "Executive" && <Users size={7} className="md:w-[8px] md:h-[8px] text-amber-400" />}
                                  {badge}
                                </span>
                              );
                            })}
                          </div>
                        )}

                        <div className="h-[132px] p-3 md:p-4 pt-2 md:pt-3 flex flex-col justify-center overflow-y-auto custom-scrollbar">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-sm md:text-base font-semibold text-white">{template.name}</h3>
                            </div>
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br ${template.gradient} flex items-center justify-center shadow-lg shrink-0`}>
                              <FileText size={12} className="md:text-sm text-white" />
                            </div>
                          </div>

                          {isActive && template.atsScore > 0 && (
                            <div className="flex items-center gap-1.5 md:gap-2 mt-0.5 md:mt-1">
                              <div className={`text-[9px] md:text-[10px] font-semibold ${getAtsColor(template.atsScore)}`}>
                                {template.atsScore}% ATS Score
                              </div>
                              <div className="flex-1 h-1 md:h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full bg-gradient-to-r ${
                                    template.atsScore >= 90 ? 'from-green-500 to-emerald-500' :
                                    template.atsScore >= 80 ? 'from-yellow-500 to-amber-500' :
                                    'from-orange-500 to-red-500'
                                  }`}
                                  style={{ width: `${template.atsScore}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 mt-1.5 md:mt-2">
                            <button
                              onClick={() => handlePreview(template)}
                              className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-zinc-700 hover:border-zinc-600 text-[9px] md:text-[10px] font-medium text-gray-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-1 md:gap-1.5 group/btn hover:bg-zinc-800/50 min-h-[32px] md:min-h-[36px]"
                              aria-label={`Preview ${template.name} template`}
                            >
                              <Eye size={11} className="md:w-[12px] md:h-[12px] text-gray-500 group-hover/btn:text-purple-400 transition-colors flex-shrink-0" />
                              <span className="whitespace-nowrap">Preview</span>
                            </button>
                            
                            {isActive ? (
                              <button
                                onClick={() => handleUseTemplate(template.id)}
                                className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-[9px] md:text-[10px] font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-1 md:gap-1.5 min-h-[32px] md:min-h-[36px]"
                                aria-label={`Use ${template.name} template`}
                              >
                                <CheckCircle size={11} className="md:w-[12px] md:h-[12px] flex-shrink-0" />
                                <span className="whitespace-nowrap">Use Template</span>
                              </button>
                            ) : (
                              <div className="flex-1 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center min-h-[32px] md:min-h-[36px] flex items-center justify-center cursor-not-allowed opacity-60">
                                <span className="text-[9px] md:text-[10px] font-medium text-zinc-400 whitespace-nowrap">Coming Soon</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-zinc-900 max-w-[900px] mx-auto">
              <h2 className="text-sm md:text-base lg:text-lg font-bold text-center mb-4 md:mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Why Our CV Templates?
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  {
                    icon: <CheckCircle size={14} className="md:w-[16px] md:h-[16px]" />,
                    title: "ATS Optimized",
                    desc: "All templates are ATS friendly and optimized for applicant tracking systems"
                  },
                  {
                    icon: <Award size={14} className="md:w-[16px] md:h-[16px]" />,
                    title: "Professional Design",
                    desc: "Designed by HR experts to make you stand out to recruiters"
                  },
                  {
                    icon: <Zap size={14} className="md:w-[16px] md:h-[16px]" />,
                    title: "Easy to Customize",
                    desc: "Fully customizable templates to match your personal brand"
                  },
                  {
                    icon: <FileText size={14} className="md:w-[16px] md:h-[16px]" />,
                    title: "Export Ready",
                    desc: "Export your CV in PDF format, ready to share with employers"
                  }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 md:p-4 rounded-lg md:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 text-center group"
                  >
                    <div className="w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg md:rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-500/20 flex items-center justify-center mb-1.5 md:mb-2 group-hover:scale-110 transition-transform text-purple-400">
                      {item.icon}
                    </div>
                    <h4 className="text-[10px] md:text-[11px] font-semibold text-white">{item.title}</h4>
                    <p className="text-[7px] md:text-[8px] text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ FIXED: Preview Modal with Pan & Zoom */}
        {previewTemplate && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4"
            onClick={closePreview}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
          >
            <div
              ref={modalRef}
              className="relative max-w-5xl w-full bg-zinc-900 rounded-xl md:rounded-2xl border border-zinc-800 shadow-2xl max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-3 md:p-4 border-b border-zinc-800 shrink-0">
                <div>
                  <h3 id="preview-modal-title" className="text-sm md:text-base font-semibold text-white">
                    {previewTemplate.name} Template
                  </h3>
                  <p className="text-[10px] md:text-[11px] text-gray-400">{previewTemplate.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* ✅ Zoom Controls with Pan indicator */}
                  <div className="flex items-center gap-1 mr-2">
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                      aria-label="Zoom Out"
                      title="Zoom Out (-)"
                    >
                      <ZoomOut size={16} />
                    </button>
                    <span className="text-xs text-gray-400 min-w-[40px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                      aria-label="Zoom In"
                      title="Zoom In (+)"
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={handleFitToScreen}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-gray-400 hover:text-white"
                      aria-label="Fit to Screen"
                      title="Fit to Screen"
                    >
                      <Maximize size={16} />
                    </button>
                    {zoomLevel > 1 && (
                      <span className="text-[10px] text-amber-400/70 flex items-center gap-1 ml-1">
                        <Move size={12} />
                        <span className="hidden sm:inline">Drag to pan</span>
                      </span>
                    )}
                  </div>
                  <button
                    ref={closeButtonRef}
                    onClick={closePreview}
                    className="p-1.5 md:p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                    aria-label="Close preview"
                  >
                    <X size={18} className="text-gray-400 hover:text-white" />
                  </button>
                </div>
              </div>

              {/* ✅ Image Container with Pan & Zoom support */}
              <div 
                ref={imageContainerRef}
                className="p-4 md:p-6 flex justify-center items-center min-h-[400px] md:min-h-[500px] overflow-hidden modal-scrollbar flex-1"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
              >
                <div className="w-full max-w-4xl bg-white rounded-lg shadow-2xl p-4 md:p-8 flex justify-center items-center overflow-hidden">
                  {imageErrors[previewTemplate.id] ? (
                    <div className="flex flex-col items-center justify-center gap-2 md:gap-3 text-zinc-500 min-h-[300px] md:min-h-[400px]">
                      <AlertCircle size={32} className="md:text-5xl text-zinc-300" />
                      <span className="text-xs md:text-sm text-zinc-400">Preview unavailable</span>
                    </div>
                  ) : (
                    <div 
                      className="transition-transform duration-100 ease-out"
                      style={{ 
                        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                        transformOrigin: 'center center',
                        willChange: 'transform'
                      }}
                    >
                      <img
                        ref={imageRef}
                        src={previewTemplate.previewImage}
                        alt={`${previewTemplate.name} template full preview`}
                        className="w-full h-auto max-h-[70vh] object-contain select-none"
                        loading="lazy"
                        onError={() => handleImageError(previewTemplate.id)}
                        draggable={false}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ Modal Footer */}
              <div className="p-3 md:p-4 border-t border-zinc-800 flex justify-between items-center shrink-0">
                <div className="text-[10px] md:text-xs text-gray-500">
                  <span className="hidden sm:inline">Zoom: {Math.round(zoomLevel * 100)}% • </span>
                  {zoomLevel > 1 && <span className="hidden sm:inline">Drag to pan • </span>}
                  <span className="hidden sm:inline">ESC to close • </span>
                  <span>Click outside to close</span>
                </div>
                {previewTemplate.status === 'active' ? (
                  <button
                    onClick={() => handleUseTemplate(previewTemplate.id)}
                    className="px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-gradient-to-r from-purple-600 to-blue-500 text-white text-[10px] md:text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-1.5 md:gap-2"
                    aria-label={`Use ${previewTemplate.name} template`}
                  >
                    <CheckCircle size={12} className="md:w-[14px] md:h-[14px]" />
                    <span>Use This Template</span>
                  </button>
                ) : (
                  <div className="px-4 md:px-6 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-center min-h-[36px] md:min-h-[40px] flex items-center justify-center cursor-not-allowed opacity-60">
                    <span className="text-[10px] md:text-xs font-medium text-zinc-400 flex items-center gap-1.5 md:gap-2">
                      <Lock size={12} className="md:w-[14px] md:h-[14px] text-amber-400" />
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .min-h-screen.bg-black.overflow-y-auto::-webkit-scrollbar {
            width: 6px;
          }
          .min-h-screen.bg-black.overflow-y-auto::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
          }
          .min-h-screen.bg-black.overflow-y-auto::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
            border-radius: 3px;
          }
          .min-h-screen.bg-black.overflow-y-auto::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #a78bfa, #60a5fa);
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #a78bfa, #60a5fa);
          }
          
          .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .modal-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 3px;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #8b5cf6, #3b82f6);
            border-radius: 3px;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #a78bfa, #60a5fa);
          }
          
          .min-h-screen.bg-black.overflow-y-auto {
            scrollbar-width: thin;
            scrollbar-color: #8b5cf6 rgba(0, 0, 0, 0.3);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #8b5cf6 rgba(0, 0, 0, 0.2);
          }
          .modal-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #8b5cf6 rgba(0, 0, 0, 0.2);
          }
        `}</style>
      </div>
    </>
  );
};

export default CVTemplatesPage;