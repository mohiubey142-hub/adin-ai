// src/components/founder/SkillsSection.tsx
import { Wrench, Code2, Brain, Sparkles, Zap, Layers, Globe, Palette, Rocket as RocketIcon, Users, PenTool, Search, BarChart, Shield, GitBranch } from "lucide-react";

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

  const tools = [
    "ChatGPT", "Claude", "Gemini", "DeepSeek",
    "Vercel", "GitHub", "React", "Prompt Engineering"
  ];

  // ✅ ALL BADGES - SAME PREMIUM PURPLE/BLUE THEME
  const badgeClass = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-purple-500/20 bg-purple-500/5 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all duration-300";

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 border-t border-zinc-900/50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Wrench size={24} className="text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Skills &amp; Expertise</h2>
        </div>

        <p className="text-sm text-gray-400 mb-6 leading-relaxed">
          I specialize in building AI-powered products by combining modern AI tools with product strategy. 
          While I am not a traditional software engineer, I use AI-assisted development to design, plan, 
          and build websites, digital products, content, and business solutions.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {skills.map((skill) => (
            <span
              key={skill.name}
              className={badgeClass}
            >
              {skill.icon}
              {skill.name}
            </span>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/10">
          <h3 className="text-sm font-medium text-purple-300 mb-3">AI Tools (Advanced)</h3>
          <div className="flex flex-wrap gap-2">
            {tools.map((tool) => (
              <span
                key={tool}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 font-medium hover:bg-purple-500/20 hover:border-purple-500/30 transition-all duration-300"
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