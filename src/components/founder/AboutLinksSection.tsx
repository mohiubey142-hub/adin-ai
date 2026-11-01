// src/components/founder/AboutLinksSection.tsx
// Closing CTA band (real <a href> links: visitors get a next step, crawlers get internal links).
import { ArrowRight, FileText, Mail } from "lucide-react";

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

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <a href="/contact" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Contact</a>
          <a href="/privacy-policy" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Privacy Policy</a>
          <a href="/terms-of-service" className="font-medium text-slate-600 hover:text-purple-700 transition-colors">Terms of Service</a>
        </div>
      </div>
    </section>
  );
}
