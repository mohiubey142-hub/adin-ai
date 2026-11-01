// src/components/founder/AdinIntroSection.tsx
// "What is Adin AI?": product overview — feature cards + who/what/worth-knowing cards.
import { Sparkles, FileText, Mail, Layout, Download, Users, Gift, Info } from "lucide-react";

const FEATURES = [
  { icon: <FileText size={20} />, title: "CV Builder", text: "AI writing help for your summary, experience and skills." },
  { icon: <Mail size={20} />, title: "Cover Letters", text: "A tailored, editable draft in seconds." },
  { icon: <Layout size={20} />, title: "Templates", text: "A growing library of clean, ATS-friendly designs." },
  { icon: <Download size={20} />, title: "Export", text: "PDF, PNG or TXT. No watermark." },
];

const NOTES = [
  {
    icon: <Users size={16} />,
    title: "Who it's for",
    text: "Students, fresh graduates and job seekers who need a professional CV or cover letter without paying or signing up. Built with job seekers in Pakistan in mind, open to anyone.",
  },
  {
    icon: <Gift size={16} />,
    title: "What makes it different",
    text: "Free to use, no signup (you start with a private guest account), no watermark, and your work can be restored on another device with your User ID and PIN.",
  },
  {
    icon: <Info size={16} />,
    title: "Worth knowing",
    text: "Adin AI launched in July 2026 and is still growing. AI-written text is a starting point, so always read and edit it before you send an application.",
  },
];

export default function AdinIntroSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)', filter: 'blur(70px)' }} />
      </div>
      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Sparkles size={12} />
            About Adin AI
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            A free AI career platform for <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">CVs and cover letters</span>
          </h2>
        </div>
        <p className="-mt-6 mb-10 max-w-2xl mx-auto text-center text-sm sm:text-base text-slate-600 leading-relaxed">
          Build a professional, ATS-friendly CV and write a tailored cover letter in minutes. It is 100% free, with no
          credit card and no hidden charges.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25 mb-4 group-hover:scale-105 transition-transform">{f.icon}</div>
              <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid md:grid-cols-3 gap-4">
          {NOTES.map((n) => (
            <div key={n.title} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-center gap-2 text-purple-600">
                {n.icon}
                <h3 className="text-sm font-semibold text-slate-900">{n.title}</h3>
              </div>
              <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{n.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
