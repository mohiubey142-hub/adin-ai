// src/pages/BlogPost.tsx
import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ARTICLES, DEFAULT_BLOG_CTA, type BlogCta } from '../config/articles';
import { SEOHead } from '../components/SEO/SEOHead';
import { ArrowLeft, ArrowRight, Clock, User, Share2, FileText, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

interface BlogPostProps {
  slug: string;
  onBackToBlog: () => void;
  onBuildCV: () => void;
  onWriteCoverLetter: () => void;
}

const CTA_BUTTON_GRADIENT = 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)';

interface CtaContent {
  heading: string;
  description: string;
  buttonLabel: string;
}

// ✅ Article type ke hisaab se CTA text (button sirf ek hi dikhega)
const CTA_CONTENT: Record<BlogCta, CtaContent> = {
  'cv': {
    heading: 'Ready to build your CV?',
    description: 'It takes just 5 minutes with Adin AI. No signup required.',
    buttonLabel: 'Build My CV',
  },
  'cover-letter': {
    heading: 'Ready to write your cover letter?',
    description: 'Generate a professional cover letter in seconds with Adin AI. No signup required.',
    buttonLabel: 'Write Cover Letter',
  },
};

export default function BlogPost({ slug, onBackToBlog, onBuildCV, onWriteCoverLetter }: BlogPostProps) {
  const article = ARTICLES.find((a) => a.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Article not found</h1>
        <button onClick={onBackToBlog} className="text-purple-600 hover:underline">
          Go back to Blog
        </button>
      </div>
    );
  }

  const ctaType: BlogCta = article.cta ?? DEFAULT_BLOG_CTA;
  const ctaContent = CTA_CONTENT[ctaType];
  const isCoverLetterCta = ctaType === 'cover-letter';
  const handleCtaClick = isCoverLetterCta ? onWriteCoverLetter : onBuildCV;

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: article.title, url });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <SEOHead
        title={`${article.title} | Adin AI Blog`}
        description={article.excerpt}
        ogType="article"
      />

      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center">
          <button
            onClick={onBackToBlog}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-purple-600 transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Back to Blog
          </button>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-center gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <User size={15} /> {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={15} /> {article.readTime}
            </span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm relative">
          
          <button
            onClick={handleShare}
            className="absolute top-6 right-6 p-2 rounded-lg bg-slate-50 text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title="Share Article"
          >
            <Share2 size={18} />
          </button>

          {/* ✅ FIX: Explicit text colors added so it doesn't fade out */}
          <div className="max-w-none text-slate-800 leading-relaxed space-y-4">
            <ReactMarkdown
              components={{
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="text-[15px] text-slate-700 leading-relaxed mb-4" {...props} />,
                strong: ({node, ...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2 text-slate-700" {...props} />,
                li: ({node, ...props}) => <li className="text-[15px]" {...props} />,
                em: ({node, ...props}) => <em className="italic text-slate-600" {...props} />
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>
          
        </div>
        
        {/* CTA at bottom */}
        <div className="mt-12 text-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{ctaContent.heading}</h3>
          <p className="text-slate-600 mb-6">{ctaContent.description}</p>
          <button
            onClick={handleCtaClick}
            className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-white text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-purple-600/25"
            style={{ background: CTA_BUTTON_GRADIENT }}
          >
            {isCoverLetterCta ? <Mail size={17} /> : <FileText size={17} />}
            <span>{ctaContent.buttonLabel}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}