// src/components/founder/AboutSection.tsx
// The founder: intro + photo (/kian-mercer-founder.png, indexed in Google Images — keep src/alt) + story + mission/vision.
import { User, Lightbulb, Target, Rocket } from "lucide-react";

const STATS = [
  { value: "17", label: "Age", cls: "bg-purple-50 border-purple-100", grad: "from-purple-600 to-purple-500" },
  { value: "Pakistan", label: "Based in", cls: "bg-blue-50 border-blue-100", grad: "from-blue-600 to-cyan-500" },
  { value: "May 2026", label: "Building since", cls: "bg-emerald-50 border-emerald-100", grad: "from-emerald-600 to-teal-500" },
  { value: "100%", label: "Free to use", cls: "bg-amber-50 border-amber-100", grad: "from-amber-600 to-orange-500" },
];

export default function AboutSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-white">
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <User size={12} />
            The founder
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Meet the person behind <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Adin AI</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
              <p className="text-slate-700 leading-relaxed text-sm">
                <span className="text-purple-700 font-semibold">Kian Mercer</span> is a{' '}
                <span className="text-blue-700 font-semibold">17-year-old AI product founder</span> from Pakistan. He is
                the Founder and CEO of <span className="text-purple-700 font-semibold">Adin AI</span>, an AI-powered
                career platform helping students and job seekers build professional resumes, cover letters, and grow
                their careers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {STATS.map((s) => (
                <div key={s.label} className={`p-3.5 rounded-xl border text-center ${s.cls}`}>
                  <div className={`text-lg sm:text-xl font-bold bg-gradient-to-r ${s.grad} bg-clip-text text-transparent`}>{s.value}</div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

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

        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} className="text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">Why Adin AI started</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            I was inspired by the rapid growth of AI and wanted to use it for something practical that creates real
            value. Instead of building just another chatbot, I built an AI platform that helps people improve their
            careers and unlock new opportunities.
          </p>
        </div>

        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-900">Mission</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              To solve career challenges faced by students and freelancers by building an AI-powered platform where
              anyone can create professional resumes and cover letters today.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <Rocket size={18} className="text-purple-600" />
              <h3 className="text-sm font-semibold text-slate-900">Where we want to go</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Over time, we want Adin AI to grow into a complete AI career platform: interview preparation, skill
              learning, jobs and scholarships, and freelance opportunities in one place.
            </p>
            <p className="mt-2 text-xs text-slate-400">These are plans, not features that are live today.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
