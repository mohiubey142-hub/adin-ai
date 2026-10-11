// src/components/Workspace/WorkspacePage.tsx
// ✅ FIX: pdfGenerator import path (../../ → ../)
// ✅ NEW: Download options in Recent Documents (PDF/TXT)
// ✅ Real thumbnails via DocumentCard
// ✅ Hero + Big CTA cards (original size)
// ✅ Only shows Recent Documents when user has docs

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Mail,
  ArrowRight,
  CheckCircle,
  Shield,
  Clock,
  Check,
} from 'lucide-react';

import { SEOHead } from "../SEO/SEOHead";
import { generatePageSchemas, generateJSONLDScript } from "../../utils/seo";
import { getSEOConfig } from "../../utils/seoPages";

import { useMyDocuments } from "../cv-builder/hooks/useMyDocuments";
import { useCoverLetters } from "../cover-letter/hooks/useCoverLetters";

import { loadDocumentData } from "../cv-builder/utils/storageUtils";
import { readCLDocument } from "../cover-letter/utils/coverLetterStorage";

import DocumentCard from "../cv-builder/components/DocumentCard";

// ✅ Download generators
import { createDownloadActions } from "../cv-builder/handlers/downloadActions";

interface WorkspacePageProps {
  onNavigate: (page: string) => void;
  userId?: string;
  onEditDocument?: (documentId: string) => void;
  onEditCoverLetter?: (documentId: string) => void;
}

interface RecentDoc {
  id: string;
  title: string;
  jobTitle?: string;
  template: string;
  lastEdited: number;
  pinned?: boolean;
  kind: 'resume' | 'cover-letter';
  data?: any | null;
}

const LIVE_THUMBNAIL_LIMIT = 4;

const WorkspacePage: React.FC<WorkspacePageProps> = ({
  onNavigate,
  userId,
  onEditDocument,
  onEditCoverLetter,
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const {
    documents: resumeDocs,
    loading: resumeLoading,
    removeDocument: removeResume,
    togglePin: toggleResumePin,
    renameDocument: renameResume,
  } = useMyDocuments(userId || '');

  const {
    documents: coverDocs,
    loading: coverLoading,
    removeDocument: removeCover,
    togglePin: toggleCoverPin,
    renameDocument: renameCover,
  } = useCoverLetters(userId || '');

  const isLoading = resumeLoading || coverLoading;

  const [docDataMap, setDocDataMap] = useState<Record<string, any>>({});

  const recentDocs: RecentDoc[] = useMemo(() => {
    const resumes: RecentDoc[] = (resumeDocs || []).map((d: any) => ({
      id: d.id,
      title: d.title || 'Untitled CV',
      jobTitle: d.jobTitle,
      template: d.template || 'modern',
      lastEdited: d.lastEdited || 0,
      pinned: d.pinned,
      kind: 'resume' as const,
      data: docDataMap[d.id] ?? null,
    }));

    const covers: RecentDoc[] = (coverDocs || []).map((d: any) => ({
      id: d.id,
      title: d.title || 'Untitled Cover Letter',
      jobTitle: d.jobTitle,
      template: d.template || 'modern',
      lastEdited: d.lastEdited || 0,
      pinned: d.pinned,
      kind: 'cover-letter' as const,
      data: docDataMap[d.id] ?? null,
    }));

    return [...resumes, ...covers]
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.lastEdited - a.lastEdited;
      })
      .slice(0, LIVE_THUMBNAIL_LIMIT);
  }, [resumeDocs, coverDocs, docDataMap]);

  useEffect(() => {
    if (isLoading) return;
    if (!userId) return;
    if (recentDocs.length === 0) return;

    const toLoad = recentDocs
      .filter((doc) => !(doc.id in docDataMap))
      .map((doc) => `${doc.kind}:${doc.id}`);

    if (toLoad.length === 0) return;

    const scheduler: (cb: () => void) => number =
      typeof (window as any).requestIdleCallback === 'function'
        ? (cb) => (window as any).requestIdleCallback(cb, { timeout: 500 })
        : (cb) => window.setTimeout(cb, 1);

    let cancelled = false;

    const loadBatch = (index: number) => {
      if (cancelled) return;
      if (index >= toLoad.length) return;

      const key = toLoad[index];
      const [kind, id] = key.split(':') as ['resume' | 'cover-letter', string];

      let data: any = null;
      try {
        if (kind === 'resume') {
          data = loadDocumentData(userId, id);
        } else {
          data = readCLDocument(userId, id);
        }
      } catch (e) {
        console.warn('[WorkspacePage] Failed to load thumbnail data for', key, e);
      }

      if (cancelled) return;

      setDocDataMap((prev) => (id in prev ? prev : { ...prev, [id]: data }));
      scheduler(() => loadBatch(index + 1));
    };

    scheduler(() => loadBatch(0));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, userId, resumeDocs?.length, coverDocs?.length]);

  const handleEdit = useCallback((id: string) => {
    const doc = recentDocs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.kind === 'cover-letter') {
      onEditCoverLetter?.(id);
    } else {
      onEditDocument?.(id);
    }
  }, [recentDocs, onEditDocument, onEditCoverLetter]);

  const handleDelete = useCallback((id: string) => {
    const doc = recentDocs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.kind === 'cover-letter') removeCover(id);
    else removeResume(id);
  }, [recentDocs, removeCover, removeResume]);

  const handleTogglePin = useCallback((id: string) => {
    const doc = recentDocs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.kind === 'cover-letter') toggleCoverPin(id);
    else toggleResumePin(id);
  }, [recentDocs, toggleCoverPin, toggleResumePin]);

  const handleRename = useCallback((id: string, newTitle: string) => {
    const doc = recentDocs.find((d) => d.id === id);
    if (!doc) return;
    if (doc.kind === 'cover-letter') renameCover(id, newTitle);
    else renameResume(id, newTitle);
  }, [recentDocs, renameCover, renameResume]);

  // ═══════════════════════════════════════════════════════════
  // ✅ DOWNLOAD HANDLER — PDF / TXT only
  // ═══════════════════════════════════════════════════════════
  const handleDownload = useCallback(async (
    id: string,
    kind: 'resume' | 'cover-letter',
    format: 'pdf' | 'txt',
  ) => {
    const { default: toast } = await import('react-hot-toast');
    const toastId = `dl-ws-${id}-${format}`;
    try {
      toast.loading(`Generating ${format.toUpperCase()}...`, { id: toastId });

      if (kind === 'resume') {
        const data = loadDocumentData(userId || '', id);
        if (!data) {
          toast.error('Document not found', { id: toastId });
          return;
        }

        const getCompleteExperiences = (data.experiences || []).filter((exp: any) =>
          exp.title?.trim() && exp.company?.trim() && exp.startDate?.trim() && exp.endDate?.trim() && exp.description?.trim()
        );

        const actions = createDownloadActions(
          data.personalInfo || {},
          data.phoneNumber || '',
          data.selectedCountryCode || 'PK',
          data.professionalSummary || '',
          getCompleteExperiences,
          data.educations || [],
          data.projects || [],
          data.certifications || [],
          data.languages || [],
          data.achievements || [],
          data.skills || '',
          data.template || 'modern',
          data.profilePhoto || null,
        );

        const template = data.template || 'modern';

        if (format === 'pdf') {
          switch (template) {
            case 'classic': await actions.downloadClassicPDF(); break;
            case 'minimal': await actions.downloadMinimalPDF(); break;
            case 'modern': await actions.downloadModernPDF(); break;
            case 'academic': await actions.downloadAcademicPDF(); break;
            case 'creative': await actions.downloadCreativePDF(); break;
            case 'teal-curve': await actions.downloadTealCurvePDF(); break;
            case 'executive': await actions.downloadExecutivePDF(); break;
            case 'standard': await actions.downloadStandardPDF(); break;
            default: await actions.downloadPDF(); break;
          }
        } else if (format === 'txt') {
          await actions.downloadTXT();
        }

        toast.success('Downloaded!', { id: toastId });
      } else {
        const data = readCLDocument(userId || '', id);
        if (!data) {
          toast.error('Document not found', { id: toastId });
          return;
        }

        if (format === 'pdf') {
          // ✅ FIXED: import path (../../ → ../)
          const { generateCoverLetterPDF } = await import('../cover-letter/utils/pdfGenerator');
          const pdfBlob = await generateCoverLetterPDF({
            userName: data.userName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            selectedCountryCode: data.selectedCountryCode || '+92',
            address: data.address || '',
            linkedin: data.linkedin || '',
            jobTitle: data.jobTitle || '',
            company: data.company || '',
            education: data.education || '',
            experience: data.experience || '',
            skills: data.skills || '',
            additionalInfo: data.additionalInfo || '',
            generatedLetter: data.generatedLetter || '',
            selectedStyle: data.selectedStyle || 'professional',
            profilePhoto: data.profilePhoto || null,
            selectedTemplate: data.selectedTemplate || 'classic',
            hiringManagerName: data.hiringManagerName || '',
          });
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `cover_letter_${(data.jobTitle || 'application').replace(/\s/g, '_')}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Downloaded!', { id: toastId });
        } else if (format === 'txt') {
          const blob = new Blob([data.generatedLetter || ''], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `cover_letter_${(data.jobTitle || 'application').replace(/\s/g, '_')}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          toast.success('Downloaded!', { id: toastId });
        }
      }
    } catch (err) {
      console.error('[WorkspacePage] Download failed:', err);
      toast.error('Download failed', { id: toastId });
    }
  }, [userId]);

  const features = [
    {
      icon: CheckCircle,
      title: 'ATS Optimized',
      desc: 'Get past ATS systems with professionally structured templates.',
    },
    {
      icon: CheckCircle,
      title: 'AI Powered',
      desc: 'Smart AI tools that create content tailored to your goals.',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      desc: 'Your data is encrypted and always protected.',
    },
    {
      icon: Clock,
      title: 'Save Time',
      desc: 'Create professional documents in minutes, not hours.',
    },
  ];

  const seoConfig = getSEOConfig('home');

  const hasDocuments = recentDocs.length > 0;

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonicalUrl}
        ogType={seoConfig.ogType || 'website'}
      />

      <script type="application/ld+json">
        {generateJSONLDScript(generatePageSchemas('home'))}
      </script>

      <div className="ws-page-root min-h-screen w-full bg-gradient-to-b from-slate-50 via-slate-50 to-white text-slate-900">
        <main className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-12 md:pb-16">
          {/* HERO */}
          <section className="relative text-center max-w-3xl mx-auto">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-64 w-[36rem] max-w-full bg-purple-300/25 blur-3xl rounded-full"
            />

            <span className="relative inline-flex items-center px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-[11px] font-semibold tracking-wide uppercase">
              AI-Powered Creation Suite
            </span>
            <h1 className="relative mt-5 text-4xl md:text-6xl font-bold tracking-tight text-slate-900">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Adin AI
              </span>
            </h1>
            <p className="relative mt-4 text-base md:text-lg font-medium text-slate-700">
              Your AI-Powered Career Assistant
            </p>
            <p className="relative mt-2 text-sm md:text-base text-slate-600">
              Create professional resumes and cover letters with the power of AI.
            </p>
          </section>

          {/* BIG CTA CARDS */}
          <section className="mt-12 md:mt-16 grid md:grid-cols-2 gap-5 md:gap-6">
            {[
              {
                id: 'cv',
                title: 'CV Builder',
                subtitle: 'Professional ATS Resume',
                badge: 'ATS Optimized',
                route: 'cv-builder',
                cta: 'Create New CV',
                icon: <FileText size={22} className="text-white" />,
                bullets: [
                  'ATS-Optimized Templates',
                  'Real-time Content Suggestions',
                  'Professional Formatting',
                  'Export in PDF Format',
                ],
              },
              {
                id: 'cover',
                title: 'Cover Letter',
                subtitle: 'AI Generated Cover Letter',
                badge: 'AI Powered',
                route: 'cover-letter',
                cta: 'Create New Cover Letter',
                icon: <Mail size={22} className="text-white" />,
                bullets: [
                  'Job Specific & Personalized',
                  'AI-Powered Content Generation',
                  'Multiple Professional Templates',
                  'Export in PDF Format',
                ],
              },
            ].map((card) => {
              const isHovered = hoveredCard === card.id;
              return (
                <article
                  key={card.id}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => onNavigate(card.route)}
                  className={`group relative cursor-pointer bg-white rounded-2xl border transition-all duration-300 p-6 md:p-7 ${
                    isHovered
                      ? 'border-purple-200 shadow-xl shadow-purple-900/5 -translate-y-1'
                      : 'border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md shadow-purple-600/20">
                      {card.icon}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                      {card.badge}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl md:text-2xl font-bold text-slate-900">
                    {card.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {card.subtitle}
                  </p>

                  <ul className="mt-5 space-y-2.5">
                    {card.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-center gap-2 text-sm text-slate-700"
                      >
                        <Check
                          size={15}
                          className="text-purple-600 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(card.route);
                    }}
                    className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold transition-all shadow-md shadow-purple-600/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    aria-label={card.cta}
                  >
                    {card.cta}
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </article>
              );
            })}
          </section>

          {/* RECENT DOCUMENTS */}
          {hasDocuments && (
            <section className="mt-10 md:mt-14">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-slate-900">
                    Recent Documents
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Continue where you left off
                  </p>
                </div>

                <button
                  onClick={() => onNavigate('my-documents')}
                  className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 border border-transparent hover:border-purple-100 transition-all"
                >
                  View all
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                {recentDocs.map((doc) => (
                  <DocumentCard
                    key={`${doc.kind}-${doc.id}`}
                    doc={doc as any}
                    userId={userId || ''}
                    kind={doc.kind}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePin={handleTogglePin}
                    onRename={handleRename}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            </section>
          )}

          {/* BENEFIT CARDS */}
          <section className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-purple-200 hover:shadow-md hover:shadow-purple-900/5 transition-all duration-300 p-5 flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {f.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </section>

          {/* CLOSING MESSAGE */}
          <section className="mt-10 md:mt-14 text-center">
            <p className="text-sm italic font-medium text-slate-600 max-w-xl mx-auto">
              "Professional documents that open doors to your dream career"
            </p>
          </section>
        </main>

        {/* FOOTER */}
        <footer className="border-t border-slate-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 text-center">
            <p className="text-xs text-slate-500">
              © 2026 Adin AI. All rights reserved.
            </p>
          </div>
        </footer>

        <style>{`
          html, body {
            height: auto !important;
            min-height: 100% !important;
            max-height: none !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
          }
          body > *,
          body > * > *,
          #root,
          #root > * {
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
            overflow-x: visible !important;
          }
          .ws-page-root {
            display: block;
            width: 100%;
            min-height: 100vh;
            height: auto;
            overflow: visible;
            position: relative;
          }
          html {
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          html::-webkit-scrollbar,
          body::-webkit-scrollbar {
            width: 10px;
            height: 10px;
          }
          html::-webkit-scrollbar-track,
          body::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          html::-webkit-scrollbar-thumb,
          body::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 6px;
            border: 2px solid #f1f5f9;
          }
          html::-webkit-scrollbar-thumb:hover,
          body::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}</style>
      </div>
    </>
  );
};

export default WorkspacePage;