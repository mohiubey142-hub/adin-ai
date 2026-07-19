// src/components/founder/TimelineSection.tsx
import { Calendar, GraduationCap, Rocket, Award } from "lucide-react";

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
      description: "Currently pursuing Intermediate in Computer Science (ICS) at Superior College with A+ grade.",
      icon: <GraduationCap size={16} />,
      color: "blue"
    },
    {
      year: "July 2026",
      title: "Adin AI Launch",
      description: "Launched Adin AI as a complete AI-powered career platform for resumes, cover letters, and career growth. Pakistan's first AI career platform.",
      // ✅ Using existing icon-192x192.png from public folder
      icon: <img src="/icon-192x192.png" alt="Adin AI" className="w-5 h-5 object-contain rounded" />,
      color: "amber"
    }
  ];

  const colorMap: Record<string, string> = {
    purple: "bg-purple-500/20 border-purple-500/30 text-purple-300",
    emerald: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    blue: "bg-blue-500/20 border-blue-500/30 text-blue-300",
    amber: "bg-amber-500/20 border-amber-500/30 text-amber-300",
  };

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Calendar size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Founder Timeline</h2>
        </div>

        <div className="space-y-4">
          {timeline.map((item, index) => (
            <div
              key={index}
              className={`p-5 rounded-2xl border ${colorMap[item.color]} bg-zinc-900/20`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${colorMap[item.color]} flex-shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-white">{item.year}</span>
                    <span className="text-sm font-medium text-gray-200">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}