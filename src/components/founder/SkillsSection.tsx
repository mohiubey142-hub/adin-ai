// src/components/founder/SkillsSection.tsx
import { Code2, Brain, Sparkles, Zap, Layers, Globe, Palette, Rocket as RocketIcon, Users, PenTool, Search, BarChart } from "lucide-react";

export default function SkillsSection() {
  const skills = [
    { name: "AI Product Development", icon: <Brain size={16} /> },
    { name: "AI Prompt Engineering", icon: <Sparkles size={16} /> },
    { name: "AI-Assisted Development", icon: <Code2 size={16} /> },
    { name: "Product Vision & Strategy", icon: <RocketIcon size={16} /> },
    { name: "Startup Building", icon: <Users size={16} /> },
    { name: "UI/UX Product Direction", icon: <Palette size={16} /> },
    { name: "AI Content Creation", icon: <PenTool size={16} /> },
    { name: "Digital Branding", icon: <Layers size={16} /> },
    { name: "SEO Strategy", icon: <Search size={16} /> },
    { name: "Career Platform Design", icon: <Globe size={16} /> },
    { name: "Project Management", icon: <BarChart size={16} /> },
    { name: "Problem Solving", icon: <Zap size={16} /> },
  ];

  const tools = ["ChatGPT", "Claude", "Gemini", "DeepSeek", "Vercel", "GitHub", "React", "Prompt Engineering"];

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <span className="inline-flex items-center text-[11px] font-semibold tracking-[0.2em] uppercase text-purple-600">
          03 — Skills &amp; Expertise
        </span>
        <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          How the work gets done
        </h2>
        <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
          I specialize in building AI-powered products by combining modern AI tools with product strategy.
          While I am not a traditional software engineer, I use AI-assisted development to design, plan,
          and build websites, digital products, content, and business solutions.
        </p>

        {/* Spec-sheet style skills grid — hairline grid lines via gap + bg */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center gap-2.5 bg-white px-4 py-3.5 text-sm text-slate-700 font-medium"
            >
              <span className="text-purple-600 shrink-0">{skill.icon}</span>
              {skill.name}
            </div>
          ))}
        </div>

        {/* Tools */}
        <div className="mt-10">
          <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">
            AI Tools (Advanced)
          </h3>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-xs font-mono text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors duration-200"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
