// src/components/founder/AboutLinksSection.tsx
// Closing CTA band (real <a href> links: visitors get a next step, crawlers get internal links).
import { ArrowRight, FileText, Mail } from "lucide-react";

// Founder's public accounts (also listed as sameAs in the founder Person schema in utils/seo.ts)
const SOCIAL_LINKS = [
  {
    label: "X",
    href: "https://x.com/itxkian",
    ariaLabel: "Kian Mercer on X (Twitter)",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="#000000" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kiansovereign",
    ariaLabel: "Kian Mercer on Instagram",
    icon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="url(#ig-grad-about)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <defs>
          <linearGradient id="ig-grad-about" gradientUnits="userSpaceOnUse" x1="2" y1="22" x2="22" y2="2">
            <stop offset="0" stopColor="#F58529" />
            <stop offset="0.4" stopColor="#DD2A7B" />
            <stop offset="0.75" stopColor="#8134AF" />
            <stop offset="1" stopColor="#515BD4" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

export default function AboutLinksSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-2xl shadow-purple-900/10"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #2563eb 100%)' }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.15]"
            style={{ backgroundImage: 'radial-gradient(#ffffff 0.8px, transparent 0.8px)', backgroundSize: '22px 22px' }}
          />
          <div className="relative px-6 sm:px-10 md:px-16 py-12 sm:py-14 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              Ready to build your CV?
            </h2>
            <p className="mt-3 text-white/85 text-sm sm:text-base max-w-xl mx-auto">
              No signup. No credit card. No watermark.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <a
                href="/free-cv-builder"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-slate-900 text-sm font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg"
              >
                <FileText size={16} />
                Build my CV
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/free-cover-letter-generator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-sm font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <Mail size={16} />
                Write a cover letter
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-600">Connect with Kian</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            {SOCIAL_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="me noopener noreferrer"
                aria-label={l.ariaLabel}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-600 hover:text-purple-700 hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                {l.icon}
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <a href="/contact" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Contact</a>
          <a href="/privacy-policy" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Privacy Policy</a>
          <a href="/terms-of-service" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Terms of Service</a>
        </div>
      </div>
    </section>
  );
}