// src/pages/Features.tsx — public Features page
// ✅ Text-first, SEO-optimized, SaaS-level clean design
// ✅ Video-ready structure — add `videoSrc` to any group and layout switches automatically
// ✅ "Smart CV autofill" as its own group (USP — was hidden in Templates before)
// ✅ FIX: Use Lucide's CheckCircle directly (no custom component — prevents TDZ error)

import { useState } from "react";
import {
  ArrowLeft, ArrowRight, Sparkles, FileText, Mail, Eye, MousePointerClick, Repeat, ListOrdered,
  LayoutList, SlidersHorizontal, Type, Download, FileImage, ShieldCheck, FolderOpen, CloudUpload,
  Pin, BookOpen, Layers, Wand2, Briefcase, FolderKanban, Award, Lightbulb, UserCheck, Heart, Users,
  PenLine, Image as ImageIcon, CheckCircle, Zap,
} from "lucide-react";
import { SEOHead } from "../components/SEO/SEOHead";
import { getSEOConfig } from "../utils/seoPages";
import { cameFromApp, markLandingIntent } from "../utils/inAppNav";
// 🔮 FUTURE: uncomment when videos are ready
// import { DemoVideo } from "../components/features-demo/DemoVideo";

interface FeaturesProps {
  onBack?: () => void;
  /** Same as the landing page "Build My CV" button: opens the CV templates in the app. */
  onBuildCV?: () => void;
  /** Same as the landing page "Write Cover Letter" button: opens the cover letter templates in the app. */
  onWriteCoverLetter?: () => void;
}

type Item = { icon: React.ReactNode; title: string; text: string };

type Group = {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: Item[];
  // 🔮 FUTURE-PROOF video fields (all optional)
  videoSrc?: string;
  videoWebmSrc?: string;
  videoPoster?: string;
  videoAlt?: string;
  videoPosition?: 'left' | 'right';
};

const ICON = 18;

const GROUPS: Group[] = [
  // ─── 1. AI WRITING HELP ───
  {
    id: 'ai',
    eyebrow: 'AI writing help',
    title: 'Let AI do the hard part of writing',
    intro: 'Stuck on what to write? Get suggestions for each section, then edit them until they sound like you.',
    items: [
      { icon: <Wand2 size={ICON} />, title: 'Summary suggestions', text: 'A professional summary drafted from your details.' },
      { icon: <Briefcase size={ICON} />, title: 'Experience bullets', text: 'Turn your job duties into clear, achievement-focused points.' },
      { icon: <FolderKanban size={ICON} />, title: 'Project descriptions', text: 'Describe what you built and what it achieved.' },
      { icon: <Sparkles size={ICON} />, title: 'Skills suggestions', text: 'Relevant skills for your role, ready to add in one click.' },
      { icon: <Award size={ICON} />, title: 'Achievement bullets', text: 'Polish your wins into strong, readable bullet points.' },
      { icon: <Mail size={ICON} />, title: 'Cover letter drafts', text: 'A tailored, editable draft in seconds, written for the job you are applying to.' },
    ],
  },

  // ─── 2. SMART CV AUTOFILL (USP) ───
  {
    id: 'smart-fill',
    eyebrow: 'Smart CV autofill',
    title: 'Your CV becomes your cover letter — in seconds',
    intro: 'Stop retyping the same details. Pick a saved CV and Adin AI fills in your cover letter sections automatically. Review the result, then generate a professional letter with one click.',
    items: [
      {
        icon: <UserCheck size={ICON} />,
        title: 'One-click CV import',
        text: 'Select any saved CV and your name, contact info, experience, education, and skills fill in instantly.',
      },
      {
        icon: <Eye size={ICON} />,
        title: 'Review before generating',
        text: 'Check every section before you proceed — nothing is generated until you approve.',
      },
      {
        icon: <Zap size={ICON} />,
        title: 'AI writes the letter',
        text: 'One click and Adin AI drafts a tailored, professional cover letter using your CV details.',
      },
      {
        icon: <PenLine size={ICON} />,
        title: 'Edit anything',
        text: 'Fine-tune the tone, reorder paragraphs, or adjust details — the letter is yours.',
      },
    ],
  },

  // ─── 3. THE EDITOR ───
  {
    id: 'editor',
    eyebrow: 'The editor',
    title: 'Edit with the result in front of you',
    intro: 'Your CV updates as you type, so you always see exactly what the final page will look like.',
    items: [
      { icon: <Eye size={ICON} />, title: 'Live preview', text: 'See every change instantly while you edit.' },
      { icon: <MousePointerClick size={ICON} />, title: 'Click to edit', text: 'Click any section in the preview and its editor opens right away.' },
      { icon: <Repeat size={ICON} />, title: 'Fast template switcher', text: 'Try different designs with one tap. Your content stays exactly as it is.' },
      { icon: <ListOrdered size={ICON} />, title: 'Your section order', text: 'Move sections up or down. The order carries over to your PDF.' },
      { icon: <Layers size={ICON} />, title: 'Custom sections', text: 'Add your own section, like Volunteering or Publications, with your own title.' },
      { icon: <SlidersHorizontal size={ICON} />, title: 'Custom fields', text: 'Add extra details such as a portfolio link or date of birth where you need them.' },
      { icon: <Type size={ICON} />, title: 'Text formatting', text: 'Show descriptions as bullets, numbered lists or paragraphs, left-aligned or justified.' },
      { icon: <Heart size={ICON} />, title: 'Interests & references', text: 'Add hobbies as tags and keep your references ready.' },
      { icon: <ImageIcon size={ICON} />, title: 'Profile photo', text: 'Add a photo on the templates that support one.' },
    ],
  },

  // ─── 4. TEMPLATES & EXPORT ───
  {
    id: 'templates',
    eyebrow: 'Templates & export',
    title: 'Professional designs, no watermark',
    intro: 'Pick a clean, ATS-friendly layout and download it the way you need.',
    items: [
      { icon: <ShieldCheck size={ICON} />, title: 'ATS-friendly templates', text: 'Clean structure that applicant tracking systems can read.' },
      { icon: <LayoutList size={ICON} />, title: 'Many designs', text: 'Modern, classic, minimal, executive, creative — and growing.' },
      { icon: <Download size={ICON} />, title: 'PDF download', text: 'A sharp, print-ready file for job applications.' },
      { icon: <FileImage size={ICON} />, title: 'PNG and TXT', text: 'Save an image copy or plain text for online forms.' },
      { icon: <PenLine size={ICON} />, title: 'Matching cover letter templates', text: 'Designs that pair perfectly with your CV for a consistent, polished look.' },
      { icon: <CheckCircle size={ICON} />, title: 'No watermark', text: 'Every download is clean — no branding, no lock icons, no paywall.' },
    ],
  },

  // ─── 5. YOUR DOCUMENTS ───
  {
    id: 'account',
    eyebrow: 'Your documents',
    title: 'Everything saved, on any device',
    intro: 'Log in once and your work follows you.',
    items: [
      { icon: <FolderOpen size={ICON} />, title: 'My Documents', text: 'All your CVs and cover letters in one place, with real previews.' },
      { icon: <CloudUpload size={ICON} />, title: 'Saved to your account', text: 'Continue where you left off on your phone or computer.' },
      { icon: <Pin size={ICON} />, title: 'Pin, rename, download', text: 'Keep your best version on top and download it straight from the list.' },
      { icon: <Users size={ICON} />, title: 'Free to start', text: 'Build and download without paying and without a watermark.' },
      { icon: <BookOpen size={ICON} />, title: 'Career blog', text: 'Practical guides on CVs, cover letters and job hunting.' },
    ],
  },
];

const FOOTER_COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: 'Product',
    links: [
      { href: '/free-cv-builder', label: 'Free CV Builder' },
      { href: '/free-cover-letter-generator', label: 'Free Cover Letter Generator' },
      { href: '/templates', label: 'CV Templates' },
      { href: '/cover-templates', label: 'Cover Letter Templates' },
    ],
  },
  {
    heading: 'Pakistan guides',
    links: [
      { href: '/pk/cv-format', label: 'CV Format in Pakistan' },
      { href: '/pk/cv-for-fresh-graduates', label: 'CV for Fresh Graduates' },
      { href: '/pk/job-application-letter', label: 'Job Application Letter' },
      { href: '/pk/cover-letter-for-freshers', label: 'Cover Letter for Freshers' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: '/blog', label: 'Career Blog' },
      { href: '/features', label: 'Features' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/founder', label: 'About Adin AI' },
      { href: '/contact', label: 'Contact' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { href: '/privacy-policy', label: 'Privacy Policy' },
      { href: '/terms-of-service', label: 'Terms of Service' },
    ],
  },
];

export default function Features({ onBack, onBuildCV, onWriteCoverLetter }: FeaturesProps) {
  const showBack = cameFromApp();
  const [scrolled, setScrolled] = useState(false);
  const seo = getSEOConfig('features');

  const goBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  // ✅ CTA buttons behave like the landing page: normal click uses the app handler (SPA),
  // ctrl/cmd/middle-click or no handler -> the real href still works.
  const cta = (handler?: () => void) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!handler || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    handler();
  };

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonicalUrl={seo.canonicalUrl}
        ogType={seo.ogType || 'website'}
      />

      <div
        className="features-scroll h-screen bg-white text-slate-900 overflow-y-auto"
        style={{ height: '100dvh' }}
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 20)}
      >
        {/* HEADER */}
        <header className={`sticky top-0 z-50 min-h-[64px] -mb-[64px] border-b transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm' : 'bg-transparent border-transparent'}`}>
          {/* Workspace/AppTopBar jaisa layout: [left] [center: title + subtitle] [right: buttons] */}
          <div className="min-h-[64px] grid grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 sm:px-5 py-2">
            <div className="flex justify-start">
              {showBack ? (
                <button onClick={goBack} aria-label="Back" className="inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors">
                  <ArrowLeft size={18} />
                  <span className="hidden sm:inline">Back</span>
                </button>
              ) : (
                <a href="/" onClick={markLandingIntent} aria-label="Adin AI home" className="shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-white shadow-md shadow-purple-900/10 border border-slate-200 flex items-center justify-center overflow-hidden">
                    <img src="/icon-1024x1024.png" alt="Adin AI" className="w-full h-full object-contain" />
                  </div>
                </a>
              )}
            </div>

            <div className="min-w-0 text-center">
              <div className="text-lg sm:text-xl font-bold tracking-tight text-purple-600 truncate">Adin AI</div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                <span className="sm:hidden">Features</span>
                <span className="hidden sm:inline">Everything you can do with Adin AI</span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <a href="/cover-templates" onClick={cta(onWriteCoverLetter)} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-white border border-slate-300 hover:border-purple-300 hover:text-purple-700 text-slate-700 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap">
                <Mail size={15} className="hidden sm:block" />
                <span className="sm:hidden">Cover letter</span>
                <span className="hidden sm:inline">Write cover letter</span>
              </a>
              <a href="/templates" onClick={cta(onBuildCV)} className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap">
                Build my CV
                <ArrowRight size={15} className="hidden sm:block" />
              </a>
            </div>
          </div>
        </header>

        <main>
          {/* HERO */}
          <section className="relative overflow-hidden px-4 sm:px-6 pt-[7.5rem] pb-12 sm:pt-36 sm:pb-16 text-center bg-gradient-to-b from-slate-50 to-white">
            <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[520px] h-[320px] rounded-full bg-purple-300/20 blur-3xl" />
            <div className="relative max-w-3xl mx-auto">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-600">Features</p>
              <h1 className="mt-3 text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
                Everything you need to{' '}
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  land the interview
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
                Adin AI helps you build a professional, ATS-friendly CV and write a tailored cover letter in minutes.
                Here is everything it can do today.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/templates" onClick={cta(onBuildCV)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors">
                  <FileText size={16} />
                  Build my CV
                </a>
                <a href="/cover-templates" onClick={cta(onWriteCoverLetter)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-300 hover:border-purple-300 text-slate-700 text-sm font-semibold transition-colors">
                  <Mail size={16} />
                  Write a cover letter
                </a>
              </div>
            </div>
          </section>

          {/* QUICK JUMP */}
          <nav aria-label="Feature sections" className="px-4 sm:px-6">
            <ul className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-2 pb-10">
              {GROUPS.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#${g.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(g.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="inline-flex px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-medium text-slate-600 hover:text-purple-700 hover:border-purple-200 hover:bg-purple-50 transition-colors"
                  >
                    {g.eyebrow}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* FEATURE GROUPS */}
          {GROUPS.map((g, gi) => {
            const hasVideo = !!g.videoSrc;
            const videoOnLeft = g.videoPosition === 'left';

            return (
              <section
                key={g.id}
                id={g.id}
                className={`px-4 sm:px-6 py-14 sm:py-20 border-t border-slate-100 scroll-mt-16 ${
                  gi % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'
                }`}
              >
                <div className="max-w-6xl mx-auto">
                  <div className="max-w-3xl mb-10 lg:mb-12">
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-600">
                      {g.eyebrow}
                    </p>
                    <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                      {g.title}
                    </h2>
                    <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                      {g.intro}
                    </p>
                  </div>

                  {!hasVideo && (
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                      {g.items.map((it) => (
                        <li key={it.title} className="flex gap-3.5">
                          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                            {it.icon}
                          </span>
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">{it.title}</h3>
                            <p className="mt-1 text-sm text-slate-600 leading-relaxed">{it.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasVideo && (
                    <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                      <div className={videoOnLeft ? 'lg:order-1' : 'lg:order-2'}>
                        {/* 🔮 FUTURE: uncomment when DemoVideo is imported
                        <DemoVideo src={g.videoSrc!} webmSrc={g.videoWebmSrc} poster={g.videoPoster} alt={g.videoAlt || g.title} aspectRatio="video" />
                        */}
                        <div className="aspect-video rounded-2xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
                          Video coming soon
                        </div>
                      </div>
                      <ul className={`space-y-5 ${videoOnLeft ? 'lg:order-2' : 'lg:order-1'}`}>
                        {g.items.map((it) => (
                          <li key={it.title} className="flex gap-3.5">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                              {it.icon}
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold text-slate-900">{it.title}</h3>
                              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{it.text}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          {/* HONEST NOTE */}
          <section className="px-4 sm:px-6 py-10 border-t border-slate-100">
            <p className="max-w-2xl mx-auto flex items-start gap-2.5 text-sm text-slate-500 leading-relaxed">
              <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
              AI-written text is a starting point. Always read and edit it before you send an application.
            </p>
          </section>

          {/* CLOSING CTA */}
          <section className="px-4 sm:px-6 pb-16 sm:pb-24">
            <div
              className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-xl shadow-purple-900/10"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
            >
              <div className="relative px-6 sm:px-12 py-12 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Ready to build your CV?</h2>
                <p className="mt-2 text-sm sm:text-base text-white/85">Start for free. No watermark.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="/templates" onClick={cta(onBuildCV)} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-all">
                    <FileText size={16} />
                    Build my CV
                  </a>
                  <a href="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 border-2 border-white/30 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
                    Create free account
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">
            <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
              {FOOTER_COLUMNS.map((col) => (
                <div key={col.heading}>
                  <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-900">{col.heading}</h2>
                  <ul className="mt-4 space-y-2.5">
                    {col.links.map((l) => (
                      <li key={l.href}>
                        <a href={l.href} className="text-sm text-slate-600 hover:text-purple-700 transition-colors">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
            <div className="mt-10 pt-6 border-t border-slate-200">
              <p className="text-center text-xs text-slate-500">
                &copy; {new Date().getFullYear()} Adin AI. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        html, body {
          height: auto !important;
          min-height: 100% !important;
          max-height: none !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          background: #ffffff;
          color: #0f172a;
        }
        body > *, body > * > *, #root, #root > * {
          height: auto !important;
          max-height: none !important;
          overflow-y: visible !important;
          overflow-x: visible !important;
        }
        .features-scroll {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }
        .features-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .features-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .features-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 6px; border: 2px solid #f1f5f9; }
        .features-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </>
  );
}