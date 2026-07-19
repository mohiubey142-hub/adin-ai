// src/components/founder/AboutSection.tsx
import { User, Briefcase, GraduationCap, Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <User size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">About Kian Mercer</h2>
        </div>

        {/* ✅ 2-COLUMN LAYOUT: Text + Image */}
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Left: Text Content */}
          <div className="space-y-4">
            {/* Introduction */}
            <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/50">
              <p className="text-gray-300 leading-relaxed text-sm">
                <span className="text-purple-400 font-medium">Kian Mercer</span> (born Ghulam MohiyuDin) is a 
                <span className="text-blue-400 font-medium"> 16-year-old AI product founder</span> from 
                Mananwala, Sheikhupura, Pakistan. He is the Founder and CEO of 
                <span className="text-purple-400 font-medium"> Adin AI</span>, an AI-powered career platform 
                helping students and freelancers build professional resumes, cover letters, and grow their careers.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">16</div>
                <div className="text-[10px] text-gray-500">Age</div>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">92%</div>
                <div className="text-[10px] text-gray-500">Matric Score</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">A+</div>
                <div className="text-[10px] text-gray-500">Current Grade</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center">
                <div className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">ICS</div>
                <div className="text-[10px] text-gray-500">Field of Study</div>
              </div>
            </div>

            {/* Previous Name */}
            <div className="p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/30">
              <p className="text-xs text-gray-500">
                <span className="text-gray-400">Previously known as:</span> Ghulam MohiyuDin
              </p>
            </div>
          </div>

          {/* ✅ Right: Founder Image (IMAGE 2) - PNG */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-xs rounded-2xl overflow-hidden border border-purple-500/20 shadow-xl shadow-purple-500/10">
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
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap size={18} className="text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Education</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-zinc-800/30 pb-2">
              <span className="text-gray-400">Matriculation</span>
              <span className="text-white font-medium">92% (Bio)</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800/30 pb-2">
              <span className="text-gray-400">Intermediate</span>
              <span className="text-white font-medium">ICS (Computer Science)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">College</span>
              <span className="text-white font-medium">Superior College</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}