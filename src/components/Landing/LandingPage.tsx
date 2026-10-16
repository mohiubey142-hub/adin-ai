// src/components/Landing/LandingPage.tsx
// ✅ NEW: Legal links in footer (Privacy Policy, Terms, Contact)
// ✅ HONEST STATEMENTS — Cloud sync disclosed
// ✅ Everything else unchanged
// ✅ UPDATED: Removed hardcoded template counts from marketing copy
//             (hero trust row, trust bar, features card, how-it-works step,
//              stats section). Copy now uses a "growing library" framing
//             so it stays honest, evergreen, and consistent with SEO meta.
//             Tab counters `(N)` are intentionally kept — they are DYNAMIC
//             (CV_SHOWCASE.length / COVER_SHOWCASE.length) so they always
//             reflect the real catalogue and never go stale.
// ✅ UPDATED: Stat label "Free Forever" → "100% Free" (honest, timeless).
//             Removed "No Ads" claim from hero trust row — future-proof
//             so we never contradict ourselves if ads are introduced later.

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  FileText, Mail, Zap, CheckCircle, Layout, ArrowRight, Sparkles,
  Download, Eye, Shield, Menu, X, Wand2, Palette,
  FileDown, Lock, ChevronRight, Cpu, User,
} from 'lucide-react';

// ============================================================
// TEMPLATE DATA
// ============================================================
interface ShowcaseTemplate {
  id: string;
  name: string;
  subtitle: string;
  previewImage: string;
}

const CV_SHOWCASE: ShowcaseTemplate[] = [
  { id: 'modern',     name: 'Modern',     subtitle: 'Purple Accent',       previewImage: '/Templates/images/modern.webp' },
  { id: 'minimal',    name: 'Minimal',    subtitle: 'Clean Layout',        previewImage: '/Templates/images/minimal.webp' },
  { id: 'teal-curve', name: 'Teal Curve', subtitle: 'Bold Teal Header',    previewImage: '/Templates/images/teal-curve.webp' },
  { id: 'executive',  name: 'Executive',  subtitle: 'Navy & Gold',         previewImage: '/Templates/images/executive.webp' },
  { id: 'creative',   name: 'Creative',   subtitle: 'Dark Sidebar',        previewImage: '/Templates/images/creative.webp' },
  { id: 'academic',   name: 'Academic',   subtitle: 'Black & White',       previewImage: '/Templates/images/academic.webp' },
  { id: 'standard',   name: 'Standard',   subtitle: 'Serif & Bands',       previewImage: '/Templates/images/standard.webp' },
  { id: 'classic',    name: 'Classic',    subtitle: 'Teal Accents',        previewImage: '/Templates/images/classic.webp' },
  { id: 'ats-pro',    name: 'ATS Pro',    subtitle: 'Maroon Accents',      previewImage: '/Templates/images/ats-pro.webp' },
];

const COVER_SHOWCASE: ShowcaseTemplate[] = [
  { id: 'modern',       name: 'Modern',       subtitle: 'Teal Header',       previewImage: '/Templates/images/cover-modern.webp' },
  { id: 'classic',      name: 'Classic',      subtitle: 'Timeless Formal',   previewImage: '/Templates/images/cover-classic.webp' },
  { id: 'minimal',      name: 'Minimal',      subtitle: 'Centered Header',   previewImage: '/Templates/images/cover-minimal.webp' },
  { id: 'professional', name: 'Professional', subtitle: 'Dark Teal Bar',     previewImage: '/Templates/images/cover-professional.webp' },
  { id: 'executive',    name: 'Executive',    subtitle: 'Navy & Gold',       previewImage: '/Templates/images/cover-executive.webp' },
  { id: 'creative',     name: 'Creative',     subtitle: 'Black Band',        previewImage: '/Templates/images/cover-creative.webp' },
];

// Hero: 5 templates in an overlapping fan (left → right). Percentages are relative to the hero stage.
interface FanCard {
  src: string;
  alt: string;
  center: number;   // horizontal centre, % of stage
  top: number;      // % from top of stage
  width: number;    // % of stage
  rotate: number;   // deg (pivot = bottom centre)
  z: number;
  factor: number;   // parallax strength
  shadow: string;
  dim?: boolean;
  pill?: { text: string; cls: string; side: 'left' | 'right' };
}

const HERO_FAN: FanCard[] = [
  {
    src: '/Templates/images/cover-executive.webp', alt: 'Executive cover letter template',
    center: 15, top: 14, width: 34, rotate: -13, z: 1, factor: 0.008, dim: true,
    shadow: '0 18px 36px -14px rgba(15,23,42,0.28), 0 4px 10px -4px rgba(15,23,42,0.12)',
    pill: { text: 'Cover Letter', cls: 'bg-amber-600', side: 'left' },
  },
  {
    src: '/Templates/images/cover-creative.webp', alt: 'Creative cover letter template',
    center: 85, top: 14, width: 34, rotate: 13, z: 1, factor: 0.012, dim: true,
    shadow: '0 18px 36px -14px rgba(15,23,42,0.28), 0 4px 10px -4px rgba(15,23,42,0.12)',
    pill: { text: 'Cover Letter', cls: 'bg-pink-600', side: 'right' },
  },
  {
    src: '/Templates/images/minimal.webp', alt: 'Minimal CV template',
    center: 28, top: 7, width: 43, rotate: -6.5, z: 2, factor: 0.014,
    shadow: '0 26px 48px -18px rgba(15,23,42,0.35), 0 8px 16px -8px rgba(15,23,42,0.15)',
  },
  {
    src: '/Templates/images/teal-curve.webp', alt: 'Teal Curve CV template',
    center: 72, top: 7, width: 43, rotate: 6.5, z: 2, factor: 0.018,
    shadow: '0 26px 48px -18px rgba(15,23,42,0.35), 0 8px 16px -8px rgba(15,23,42,0.15)',
  },
  {
    src: '/Templates/images/modern.webp', alt: 'Modern CV template',
    center: 50, top: 0, width: 54, rotate: 0, z: 4, factor: 0.01,
    shadow: '0 40px 70px -24px rgba(91,33,182,0.45), 0 14px 28px -12px rgba(15,23,42,0.25)',
    pill: { text: 'CV Template', cls: 'bg-purple-600', side: 'left' },
  },
];

// ============================================================
// PROPS
// ============================================================
interface LandingPageProps {
  onGetStarted: () => void;
  onBuildCV?: () => void;
  onWriteCoverLetter?: () => void;
  onViewCVTemplates?: () => void;
  onViewCoverTemplates?: () => void;
  onOpenSidebar?: () => void;
  onOpenFounder?: () => void;
  onOpenPrivacy?: () => void;   // ✅ NEW
  onOpenTerms?: () => void;     // ✅ NEW
  onOpenContact?: () => void;   // ✅ NEW
}

// ============================================================
// COMPONENT
// ============================================================
export default function LandingPage({
  onGetStarted,
  onBuildCV,
  onWriteCoverLetter,
  onViewCVTemplates,
  onViewCoverTemplates,
  onOpenSidebar,
  onOpenFounder,
  onOpenPrivacy,
  onOpenTerms,
  onOpenContact,
}: LandingPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 });

  // Hero fan: on phones/tablets the exact desktop composition (580x520) is scaled to fit the screen width.
  const heroStageRef = useRef<HTMLDivElement>(null);
  const [heroFit, setHeroFit] = useState<{ scale: number; isDesktop: boolean }>(() => ({
    scale: 0.55,
    isDesktop: typeof window !== 'undefined' && window.innerWidth >= 1024,
  }));
  useEffect(() => {
    const el = heroStageRef.current;
    if (!el) return;
    const fit = () => {
      const isDesktop = window.innerWidth >= 1024;
      const w = el.clientWidth;
      // 716 = 580 design width + room for the rotated outer cards; +24 lets their corners use the page padding
      const scale = isDesktop || !w ? 1 : Math.min(1, (w + 32) / 716);
      setHeroFit((prev) =>
        prev.scale === scale && prev.isDesktop === isDesktop ? prev : { scale, isDesktop }
      );
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    window.addEventListener('resize', fit);
    return () => { ro.disconnect(); window.removeEventListener('resize', fit); };
  }, []);
  const [activeTemplateTab, setActiveTemplateTab] = useState<'cv' | 'cover'>('cv');
  const [scrolled, setScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const getParallaxStyle = useCallback((factor: number = 0.015) => {
    const x = (mousePosition.x - 0.5) * factor * 20;
    const y = (mousePosition.y - 0.5) * factor * 20;
    return {
      transform: `translate(${x}px, ${y}px)`,
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  }, [mousePosition]);

  const getParallaxOffset = useCallback((factor: number = 0.015) => ({
    x: (mousePosition.x - 0.5) * factor * 20,
    y: (mousePosition.y - 0.5) * factor * 20,
  }), [mousePosition]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setMousePosition({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 20);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  const activeTemplates = useMemo(
    () => (activeTemplateTab === 'cv' ? CV_SHOWCASE : COVER_SHOWCASE),
    [activeTemplateTab]
  );

  const handleViewAll = useCallback(() => {
    if (activeTemplateTab === 'cv') {
      (onViewCVTemplates || onGetStarted)();
    } else {
      (onViewCoverTemplates || onGetStarted)();
    }
  }, [activeTemplateTab, onViewCVTemplates, onViewCoverTemplates, onGetStarted]);

  const handleNavCV = useCallback(() => {
    setMobileNavOpen(false);
    (onBuildCV || onGetStarted)();
  }, [onBuildCV, onGetStarted]);

  const handleNavCover = useCallback(() => {
    setMobileNavOpen(false);
    (onWriteCoverLetter || onGetStarted)();
  }, [onWriteCoverLetter, onGetStarted]);

  const handleNavCVTemplates = useCallback(() => {
    setMobileNavOpen(false);
    (onViewCVTemplates || onGetStarted)();
  }, [onViewCVTemplates, onGetStarted]);

  const handleNavCoverTemplates = useCallback(() => {
    setMobileNavOpen(false);
    (onViewCoverTemplates || onGetStarted)();
  }, [onViewCoverTemplates, onGetStarted]);

  const handleNavFounder = useCallback(() => {
    setMobileNavOpen(false);
    (onOpenFounder || onGetStarted)();
  }, [onOpenFounder, onGetStarted]);

  const handleNavPrivacy = useCallback(() => {
    setMobileNavOpen(false);
    (onOpenPrivacy || onGetStarted)();
  }, [onOpenPrivacy, onGetStarted]);

  const handleNavTerms = useCallback(() => {
    setMobileNavOpen(false);
    (onOpenTerms || onGetStarted)();
  }, [onOpenTerms, onGetStarted]);

  const handleNavContact = useCallback(() => {
    setMobileNavOpen(false);
    (onOpenContact || onGetStarted)();
  }, [onOpenContact, onGetStarted]);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900"
    >
      {/* BACKGROUND LAYER */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
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

      {/* NAVBAR */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200 shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 group shrink-0"
            aria-label="Adin AI home"
          >
            <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
              <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
            </div>
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Adin AI
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink onClick={handleNavCV}>CV Builder</NavLink>
            <NavLink onClick={handleNavCover}>Cover Letter</NavLink>
            <NavLink onClick={handleNavCVTemplates}>CV Templates</NavLink>
            <NavLink onClick={handleNavCoverTemplates}>Cover Templates</NavLink>
            <NavLink onClick={() => scrollToSection('features')}>Features</NavLink>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onGetStarted}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-md shadow-purple-600/25"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-purple-300 flex items-center justify-center text-slate-700 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-sm font-semibold text-slate-800">Menu</span>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <MobileNavItem onClick={handleNavCV} icon={<FileText size={17} />}>CV Builder</MobileNavItem>
              <MobileNavItem onClick={handleNavCover} icon={<Mail size={17} />}>Cover Letter</MobileNavItem>
              <MobileNavItem onClick={handleNavCVTemplates} icon={<Layout size={17} />}>CV Templates</MobileNavItem>
              <MobileNavItem onClick={handleNavCoverTemplates} icon={<Palette size={17} />}>Cover Templates</MobileNavItem>
              <MobileNavItem
                onClick={() => { setMobileNavOpen(false); scrollToSection('features'); }}
                icon={<Sparkles size={17} />}
              >
                Features
              </MobileNavItem>
              <MobileNavItem onClick={handleNavFounder} icon={<User size={17} />}>Founder</MobileNavItem>
              <MobileNavItem onClick={handleNavPrivacy} icon={<Shield size={17} />}>Privacy Policy</MobileNavItem>
              <MobileNavItem onClick={handleNavTerms} icon={<FileText size={17} />}>Terms of Service</MobileNavItem>
              <MobileNavItem onClick={handleNavContact} icon={<Mail size={17} />}>Contact Us</MobileNavItem>
            </nav>
            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => { setMobileNavOpen(false); onGetStarted(); }}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold shadow-md shadow-purple-600/25"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
              >
                Start Building — Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 md:pt-20 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="text-center lg:text-left">
            <div
              className="animate-fade-up"
              style={{ animationDelay: '0ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              {/* MOBILE: line 1 = one sentence, line 2 = two items with divider */}
              <div className="sm:hidden inline-flex flex-col items-center gap-1.5 max-w-full px-4 py-2.5 rounded-2xl bg-white/85 backdrop-blur-sm border border-purple-200 shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex w-2 h-2 shrink-0">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                  </span>
                  <span className="whitespace-nowrap text-[11px] font-semibold text-slate-800 tracking-tight">
                    100% Free All Premium Features
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <span className="whitespace-nowrap text-[11px] font-medium text-slate-600">
                    No Hidden Charges
                  </span>
                  <span className="w-px h-3.5 bg-slate-300" />
                  <span className="whitespace-nowrap text-[11px] font-medium text-slate-600">
                    No Signup
                  </span>
                </div>
              </div>

              {/* DESKTOP: original single-row pill */}
              <div className="hidden sm:inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-full bg-white/85 backdrop-blur-sm border border-purple-200 shadow-sm">
                <span className="relative flex w-2 h-2 shrink-0">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-slate-800 tracking-tight">100% Free</span>
                <span className="w-px h-3.5 bg-slate-300" />
                <span className="text-xs font-medium text-slate-600">No Signup</span>
                <span className="w-px h-3.5 bg-slate-300" />
                <span className="text-xs font-medium text-slate-600">No Hidden Charges</span>
                <span className="w-px h-3.5 bg-slate-300" />
                <span className="text-xs font-semibold text-slate-800 tracking-tight">All Premium Features Free</span>
              </div>
            </div>

            <h1
              className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05] animate-fade-up"
              style={{ animationDelay: '80ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              Build Your{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                CV
              </span>{' '}
              &{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #0891b2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Cover Letter
              </span>{' '}
              in Minutes
            </h1>

            <p
              className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-up"
              style={{ animationDelay: '160ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              AI-powered writing, ATS-optimized templates, and instant PDF export.
              Powered by <span className="font-semibold text-slate-800">GPT-OSS 120B</span>.
            </p>

            <div
              className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start animate-fade-up"
              style={{ animationDelay: '240ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <button
                onClick={onBuildCV || onGetStarted}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-600/25 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
              >
                <FileText size={17} />
                <span>Build My CV</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onWriteCoverLetter || onGetStarted}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white border-2 border-slate-200 hover:border-blue-400 text-slate-800 hover:text-blue-700 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-sm hover:shadow-md"
              >
                <Mail size={17} />
                <span>Write Cover Letter</span>
              </button>
            </div>

            <div
              className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2.5 text-xs sm:text-sm animate-fade-up"
              style={{ animationDelay: '320ms', opacity: 0, animationFillMode: 'forwards' }}
            >
              <TrustItem icon={<Cpu size={14} />} label="Powered by GPT-OSS 120B" />
              <TrustItem icon={<CheckCircle size={14} />} label="ATS Optimized" />
              <TrustItem icon={<Layout size={14} />} label="Professional Templates" />
              <TrustItem icon={<Shield size={14} />} label="No Watermark" />
              <TrustItem icon={<Lock size={14} />} label="Encrypted · No Tracking" />
            </div>
          </div>

          <div
            ref={heroStageRef}
            className="relative block w-full mt-2 lg:h-[520px] lg:self-start lg:mt-[56px] animate-fade-up"
            style={{
              animationDelay: '200ms',
              opacity: 0,
              animationFillMode: 'forwards',
              ...(heroFit.isDesktop ? {} : { height: 520 * heroFit.scale }),
            }}
          >
            <div
              className="absolute inset-0 rounded-3xl"
              style={{
                background: 'radial-gradient(circle at 50% 45%, rgba(139,92,246,0.18) 0%, transparent 65%)',
                filter: 'blur(60px)',
              }}
            />

            <div
              className="absolute top-0"
              style={
                heroFit.isDesktop
                  ? { left: 0, right: 0, bottom: 0 }
                  : {
                      left: '50%',
                      width: 580,
                      height: 520,
                      transform: `translateX(-50%) scale(${heroFit.scale})`,
                      transformOrigin: '50% 0%',
                    }
              }
            >
            {HERO_FAN.map((c) => {
              const o = getParallaxOffset(c.factor);
              return (
                <div
                  key={c.src}
                  className="absolute rounded-2xl bg-white ring-1 ring-slate-900/5 border border-white overflow-hidden"
                  style={{
                    width: `${c.width}%`,
                    left: `${c.center}%`,
                    top: `${c.top}%`,
                    zIndex: c.z,
                    boxShadow: c.shadow,
                    transformOrigin: '50% 100%',
                    transform: `translateX(-50%) rotate(${c.rotate}deg) translate(${o.x}px, ${o.y}px)`,
                    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div className="aspect-[3/4] bg-slate-50 relative">
                    <img src={c.src} alt={c.alt} className="w-full h-full object-contain object-top p-2" draggable={false} />
                    {/* soft sheen for a glassy, premium finish */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/30 via-transparent to-slate-900/[0.04]" />
                    {c.dim && <div className="absolute inset-0 pointer-events-none bg-slate-900/[0.035]" />}
                    {c.pill && (
                      <div
                        className={`absolute top-2.5 ${c.pill.side === 'left' ? 'left-2.5' : 'right-2.5'} px-2.5 py-[3px] rounded-full ${c.pill.cls} text-white text-[10px] font-semibold shadow-sm`}
                      >
                        {c.pill.text}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div
              className="absolute inset-x-0 flex justify-center pointer-events-none"
              style={{ bottom: '3%', zIndex: 5, transform: `translate(${getParallaxOffset(0.028).x}px, ${getParallaxOffset(0.028).y}px)`, transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
              <div className="px-3 py-2 rounded-xl bg-white border border-purple-200 shadow-lg flex items-center gap-2 animate-float">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
                  <Wand2 size={14} className="text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-800 leading-tight">AI Writing</div>
                  <div className="text-[9px] text-slate-500 leading-tight">GPT-OSS 120B</div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="relative z-10 border-y border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-600">
            {[
              { icon: <Cpu size={14} className="text-purple-600" />, label: 'GPT-OSS 120B' },
              { icon: <CheckCircle size={14} className="text-emerald-600" />, label: '100% Free' },
              { icon: <Layout size={14} className="text-blue-600" />, label: 'Professional Templates' },
              { icon: <Shield size={14} className="text-purple-600" />, label: 'ATS Optimized' },
              { icon: <FileDown size={14} className="text-blue-600" />, label: 'PDF · PNG · TXT' },
              { icon: <Lock size={14} className="text-emerald-600" />, label: 'Encrypted Cloud Sync' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TEMPLATE SHOWCASE */}
      <section id="templates" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Palette size={12} />
            Templates
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Professional Templates, Ready to Use
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
            Hand-crafted, ATS-friendly designs. Pick one and start building instantly.
          </p>

          <div className="mt-7 inline-flex p-1 rounded-full bg-slate-100 border border-slate-200">
            <button
              onClick={() => setActiveTemplateTab('cv')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTemplateTab === 'cv' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CV Templates ({CV_SHOWCASE.length})
            </button>
            <button
              onClick={() => setActiveTemplateTab('cover')}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                activeTemplateTab === 'cover' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cover Letters ({COVER_SHOWCASE.length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-5">
          {activeTemplates.slice(0, 6).map((tpl, i) => (
            <button
              key={tpl.id}
              onClick={handleViewAll}
              className="group relative rounded-2xl bg-white border border-slate-200 hover:border-purple-300 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10 text-left animate-fade-up"
              style={{ animationDelay: `${i * 50}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden">
                <img src={tpl.previewImage} alt={`${tpl.name} template`} className="w-full h-full object-contain object-top p-3 transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" draggable={false} />
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-semibold shadow-md">
                    <Eye size={13} />
                    View Template
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
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-purple-400 text-slate-800 hover:text-purple-700 text-sm font-semibold transition-all shadow-sm hover:shadow-md"
          >
            <span>View All {activeTemplateTab === 'cv' ? 'CV' : 'Cover Letter'} Templates</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 bg-white/60 backdrop-blur-sm border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
              <Sparkles size={12} />
              Features
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Get Hired
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-2xl mx-auto">
              Built for real job seekers — fast, private, and genuinely free.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: <Cpu size={20} />, title: 'GPT-OSS 120B AI', desc: 'Powered by one of the most capable open models for natural, human-sounding writing.', accent: 'purple' },
              { icon: <CheckCircle size={20} />, title: 'ATS Optimized', desc: 'Every template is engineered to pass applicant tracking systems.', accent: 'emerald' },
              { icon: <Layout size={20} />, title: 'Professional Templates', desc: 'A growing library of CV and cover letter designs — pick your style.', accent: 'blue' },
              { icon: <Download size={20} />, title: 'PDF · PNG · TXT', desc: 'Export in multiple formats with a single click. No watermark.', accent: 'purple' },
              { icon: <Eye size={20} />, title: 'Live Preview', desc: 'See your changes in real-time as you type.', accent: 'blue' },
              { icon: <Lock size={20} />, title: 'Private & Secure', desc: 'End-to-end encrypted. Your data is safely synced to your private cloud — accessible on any device.', accent: 'emerald' },
            ].map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 60} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Zap size={12} />
            How It Works
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Three Steps. That's It.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 relative">
          {[
            { step: '01', title: 'Pick a Template', desc: 'Choose from our growing library of CV and cover letter designs — all ATS-optimized.', icon: <Layout size={20} /> },
            { step: '02', title: 'Fill Your Details', desc: 'Type your info or let AI write it for you. Import from an existing CV.', icon: <Wand2 size={20} /> },
            { step: '03', title: 'Download', desc: 'Export as PDF, PNG, or TXT. Ready to send in seconds.', icon: <Download size={20} /> },
          ].map((s, i) => (
            <div
              key={i}
              className="relative rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-900/5 transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms`, opacity: 0, animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25">
                  {s.icon}
                </div>
                <span className="text-3xl font-bold text-slate-200 tracking-tight">{s.step}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="relative z-10 bg-white/60 backdrop-blur-sm border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <StatItem value="$0" label="100% Free" />
            <StatItem value="ATS" label="Optimized Templates" />
            <StatItem value="AI" label="Powered Writing" />
            <StatItem value="PDF" label="PNG · TXT Export" />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div
          className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-purple-900/10"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(#ffffff 0.8px, transparent 0.8px)', backgroundSize: '22px 22px' }}
          />
          <div
            className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)', filter: 'blur(80px)' }}
          />
          <div
            className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', filter: 'blur(80px)' }}
          />

          <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white text-xs font-semibold mb-5">
              <Sparkles size={12} />
              Ready when you are
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Land Your Dream Job — Starting Now
            </h2>
            <p className="mt-4 text-white/85 text-sm sm:text-base max-w-xl mx-auto">
              No signup. No credit card. No watermark. Just a great CV and cover letter.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={onGetStarted}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-900 text-sm sm:text-base font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg"
              >
                <span>Start Building — It's Free</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={handleViewAll}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-sm sm:text-base font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <Layout size={17} />
                <span>Browse Templates</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
                  <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Adin AI
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed max-w-xs">
                Free CV builder, cover letter writer, and AI career assistant.
                Powered by GPT-OSS 120B.
              </p>
            </div>

            <FooterColumn title="Product">
              <FooterLink onClick={handleNavCV}>CV Builder</FooterLink>
              <FooterLink onClick={handleNavCover}>Cover Letter</FooterLink>
              <FooterLink onClick={handleNavCVTemplates}>CV Templates</FooterLink>
              <FooterLink onClick={handleNavCoverTemplates}>Cover Templates</FooterLink>
            </FooterColumn>

            <FooterColumn title="Resources">
              <FooterLink onClick={() => scrollToSection('features')}>Features</FooterLink>
              <FooterLink onClick={() => scrollToSection('templates')}>Templates</FooterLink>
              <FooterLink onClick={onGetStarted}>Get Started</FooterLink>
            </FooterColumn>

            <FooterColumn title="Legal">
              <FooterLink onClick={handleNavPrivacy}>Privacy Policy</FooterLink>
              <FooterLink onClick={handleNavTerms}>Terms of Service</FooterLink>
              <FooterLink onClick={handleNavContact}>Contact Us</FooterLink>
              <FooterLink onClick={handleNavFounder}>Founder</FooterLink>
            </FooterColumn>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} Adin AI. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Cpu size={12} className="text-purple-600" />
              Powered by GPT-OSS 120B
            </p>
          </div>
        </div>
      </footer>

      {/* STYLES */}
      <style>{`
        html {
          scrollbar-width: thin;
          scrollbar-color: #a855f7 transparent;
          scroll-behavior: smooth;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        html::-webkit-scrollbar-track,
        body::-webkit-scrollbar-track {
          background: transparent;
        }
        html::-webkit-scrollbar-thumb,
        body::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #a78bfa, #818cf8, #60a5fa);
          border-radius: 10px;
          border: 1px solid rgba(139, 92, 246, 0.15);
        }
        html::-webkit-scrollbar-thumb:hover,
        body::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #8b5cf6, #6366f1, #3b82f6);
        }
        html::-webkit-scrollbar-corner,
        body::-webkit-scrollbar-corner {
          background: transparent;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-fade-up {
          animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          .animate-fade-up { opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// SMALL SUB-COMPONENTS
// ============================================================
function NavLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
    >
      {children}
    </button>
  );
}

function MobileNavItem({
  children, icon, onClick,
}: { children: React.ReactNode; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
    >
      <span className="text-purple-600">{icon}</span>
      <span>{children}</span>
      <ChevronRight size={15} className="ml-auto text-slate-400" />
    </button>
  );
}

function TrustItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-600">
      <span className="text-purple-600">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon, title, desc, accent, delay,
}: { icon: React.ReactNode; title: string; desc: string; accent: string; delay: number }) {
  const accentMap: Record<string, { bg: string; text: string; ring: string }> = {
    purple: { bg: 'from-purple-600 to-purple-500', text: 'text-purple-600', ring: 'group-hover:shadow-purple-500/20' },
    blue: { bg: 'from-blue-600 to-cyan-500', text: 'text-blue-600', ring: 'group-hover:shadow-blue-500/20' },
    emerald: { bg: 'from-emerald-600 to-teal-500', text: 'text-emerald-600', ring: 'group-hover:shadow-emerald-500/20' },
  };
  const a = accentMap[accent] || accentMap.purple;

  return (
    <div
      className={`group rounded-2xl bg-white border border-slate-200 p-5 sm:p-6 hover:-translate-y-1 hover:shadow-xl ${a.ring} hover:border-slate-300 transition-all duration-300 animate-fade-up`}
      style={{ animationDelay: `${delay}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${a.bg} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{desc}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="text-3xl sm:text-4xl font-bold tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {value}
      </div>
      <div className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">{label}</div>
    </div>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-3">{title}</h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <li>
      <button
        onClick={onClick}
        className="text-xs text-slate-500 hover:text-purple-700 transition-colors text-left"
      >
        {children}
      </button>
    </li>
  );
}