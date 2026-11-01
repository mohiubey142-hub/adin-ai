// src/components/founder/TimelineSection.tsx
import { Calendar, Rocket } from "lucide-react";

const TIMELINE = [
  {
    when: "May 2026",
    title: "Started Adin AI",
    text: "Founded Adin AI with the vision of making career development accessible to everyone through AI, and started building the platform from scratch.",
    icon: <Rocket size={18} />,
  },
  {
    when: "July 2026",
    title: "Adin AI launch",
    text: "Launched Adin AI, an AI-powered career platform for resumes, cover letters, and career growth.",
    icon: <img src="/icon-v2-192x192.png" alt="Adin AI" className="w-6 h-6 object-contain rounded" />,
  },
];

export default function TimelineSection() {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div className="absolute -bottom-24 -right-24 w-[360px] h-[360px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)', filter: 'blur(70px)' }} />
      </div>
      <div className="relative max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Calendar size={12} />
            Timeline
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            How <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Adin AI</span> started
          </h2>
        </div>

        <div className="space-y-4">
          {TIMELINE.map((item) => (
            <div key={item.when} className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-purple-900/5 hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-purple-600/25 shrink-0">{item.icon}</div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 rounded-full px-2.5 py-0.5">{item.when}</span>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
