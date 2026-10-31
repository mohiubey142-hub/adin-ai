// src/components/founder/AboutSection.tsx
import { User } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md shadow-purple-600/20">
            <User size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">About Kian Mercer</h2>
        </div>

        {/* ✅ 2-COLUMN LAYOUT: Text + Image */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Left: Text Content */}
          <div className="space-y-4">
            {/* Introduction */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-slate-700 leading-relaxed text-sm">
                <span className="text-purple-700 font-semibold">Kian Mercer</span> is a{' '}
                <span className="text-blue-700 font-semibold">17-year-old AI product founder</span> from
                Pakistan. He is the Founder and CEO of{' '}
                <span className="text-purple-700 font-semibold">Adin AI</span>, an AI-powered career platform
                helping students and job seekers build professional resumes, cover letters, and grow their careers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">17</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Age</div>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Pakistan</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Based In</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">May 2026</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Building Since</div>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">100%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Free to Use</div>
              </div>
            </div>

          </div>

          {/* ✅ Right: Founder Image */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-purple-100 shadow-lg shadow-purple-600/10">
              <img
                src="/kian-mercer-founder.png"
                alt="Kian Mercer building Adin AI - Founder Story"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
