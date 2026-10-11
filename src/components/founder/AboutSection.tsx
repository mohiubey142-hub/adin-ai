// src/components/founder/AboutSection.tsx
import { User, GraduationCap } from "lucide-react";

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
                <span className="text-purple-700 font-semibold">Kian Mercer</span> (born Ghulam MohiyuDin) is a{' '}
                <span className="text-blue-700 font-semibold">16-year-old AI product founder</span> from
                Mananwala, Sheikhupura, Pakistan. He is the Founder and CEO of{' '}
                <span className="text-purple-700 font-semibold">Adin AI</span>, an AI-powered career platform
                helping students and freelancers build professional resumes, cover letters, and grow their careers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">16</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Age</div>
              </div>
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">92%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Matric Score</div>
              </div>
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">A+</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Current Grade</div>
              </div>
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">ICS</div>
                <div className="text-[11px] text-slate-500 font-medium mt-0.5">Field of Study</div>
              </div>
            </div>

            {/* Previous Name */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">
                <span className="text-slate-600 font-medium">Previously known as:</span> Ghulam MohiyuDin
              </p>
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

        {/* Education Detail - Full Width */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">Education</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500">Matriculation</span>
              <span className="text-slate-900 font-medium">92% (Bio)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500">Intermediate</span>
              <span className="text-slate-900 font-medium">ICS (Computer Science)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">College</span>
              <span className="text-slate-900 font-medium">Superior College</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
