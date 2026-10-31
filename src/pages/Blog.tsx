// src/pages/Blog.tsx
import React from 'react';
import { ARTICLES } from '../config/articles';
import { SEOHead } from '../components/SEO/SEOHead';
import { getSEOConfig } from '../utils/seoPages';
import { cameFromApp, markLandingIntent } from '../utils/inAppNav';
import { Clock, ArrowRight, User, FileText } from 'lucide-react';

interface BlogProps {
  onOpenArticle: (slug: string) => void;
  onBackToLanding: () => void;
}

export default function Blog({ onOpenArticle, onBackToLanding }: BlogProps) {
  const seo = getSEOConfig('blog');
  // ✅ Back sirf tab jab user app ke andar se aaya; seedha khulne par Adin AI home link
  const showBack = cameFromApp();

  return (
    <div className="min-h-screen bg-slate-50">
      <SEOHead
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        canonicalUrl={seo.canonicalUrl}
      />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Adin AI Blog
          </h1>
          <p className="mt-4 text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Career tips, CV advice, cover letter guides, and AI insights to help you land your dream job.
          </p>
          {showBack ? (
            <button
              onClick={onBackToLanding}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowRight size={16} className="rotate-180" />
              Back
            </button>
          ) : (
            <a
              href="/"
              onClick={markLandingIntent}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
            >
              Adin AI home
            </a>
          )}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
          {ARTICLES.map((article) => (
            <article
              key={article.slug}
              onClick={() => onOpenArticle(article.slug)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-purple-300 hover:shadow-xl hover:shadow-purple-900/5 transition-all duration-300 flex flex-col"
            >
              
              {/* ✅ IMAGE SECTION */}
              {article.image ? (
                <div className="aspect-[2.5/1] bg-slate-100 overflow-hidden relative">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[2.5/1] bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 relative overflow-hidden flex items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <FileText size={24} className="text-white" strokeWidth={2.2} />
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} /> {article.readTime}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User size={13} /> {article.author}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug mb-2">
                  {/* ✅ Real link for crawlers; normal click still uses the card's SPA navigation */}
                  <a
                    href={`/blog/${article.slug}`}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { e.stopPropagation(); return; }
                      e.preventDefault();
                    }}
                  >
                    {article.title}
                  </a>
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                  {article.excerpt}
                </p>
                <div className="mt-auto flex items-center text-sm font-semibold text-purple-600 group-hover:text-purple-700">
                  Read Article <ArrowRight size={15} className="ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}