// src/components/founder/TimelineSection.tsx
import { Calendar, GraduationCap, Rocket } from "lucide-react";

export default function TimelineSection() {
  const timeline = [
    {
      year: "May 2026",
      title: "Started Adin AI",
      description: "Founded Adin AI with the vision of making career development accessible to everyone through AI. Started building the platform from scratch.",
      icon: <Rocket size={16} />,
      color: "purple"
    },
    {
      year: "2026",
      title: "Intermediate (ICS)",
      description: "Currently pursuing Intermediate in Computer Science (ICS) with an A+ grade.",
      icon: <GraduationCap size={16} />,
      color: "blue"
    },
    {
      year: "July 2026",
      title: "Adin AI Launch",
      description: "Launched Adin AI, an AI-powered career platform for resumes, cover letters, and career growth.",
      icon: <img src="/icon-192x192.png" alt="Adin AI" className="w-5 h-5 object-contain rounded" />,
      color: "amber"
    }
  ];

  const colorMap: Record<string, string> = {
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    emerald: "bg-emerald-50 border-emerald-100 text-emerald-700",
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    amber: "bg-amber-50 border-amber-100 text-amber-700",
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-slate-200 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-md shadow-purple-600/20">
            <Calendar size={18} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Founder Timeline</h2>
        </div>

        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border ${colorMap[item.color]} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-slate-900">{item.year}</span>
                    <span className="text-sm font-medium text-slate-700">{item.title}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
